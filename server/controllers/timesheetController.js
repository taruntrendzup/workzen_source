import { Timesheet } from '../models/Timesheet.js';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';

// @route   GET /api/timesheets
// @desc    Get timesheet entries (filtered by user role and query params)
export const getTimesheets = async (req, res) => {
  try {
    const { status, project, startDate, endDate, userId } = req.query;
    let filter = {};

    // Role-based visibility
    if (req.user.role === 'employee') {
      filter.user = req.user.id;
    } else if (req.user.role === 'manager') {
      // Manager can see their own entries, plus entries on projects they manage
      if (userId) {
        filter.user = userId;
      } else {
        const managedProjects = await Project.find({ manager: req.user.id }).select('_id');
        const managedIds = managedProjects.map((p) => p._id);
        filter.$or = [
          { user: req.user.id },
          { project: { $in: managedIds } },
        ];
      }
    } else if (req.user.role === 'admin') {
      if (userId) {
        filter.user = userId;
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (project && project !== 'all') {
      filter.project = project;
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const timesheets = await Timesheet.find(filter)
      .populate('user', 'name email designation avatar hourlyRate department')
      .populate('project', 'name code clientName')
      .populate('reviewedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    const totalHours = timesheets.reduce((acc, curr) => acc + curr.hours, 0);
    const approvedHours = timesheets
      .filter((t) => t.status === 'approved')
      .reduce((acc, curr) => acc + curr.hours, 0);
    const pendingHours = timesheets
      .filter((t) => t.status === 'pending')
      .reduce((acc, curr) => acc + curr.hours, 0);

    res.json({
      success: true,
      count: timesheets.length,
      stats: { totalHours, approvedHours, pendingHours },
      timesheets,
    });
  } catch (error) {
    console.error('Error in getTimesheets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/timesheets
// @desc    Log new work hours
export const createTimesheet = async (req, res) => {
  try {
    const { project, taskTitle, description, date, hours, billable } = req.body;

    if (!project || !taskTitle || hours === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Project, task title, and hours are required',
      });
    }

    const numHours = Number(hours);
    if (isNaN(numHours) || numHours <= 0 || numHours > 24) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be a number between 0.25 and 24',
      });
    }

    const projDoc = await Project.findById(project);
    if (!projDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const timesheet = await Timesheet.create({
      user: req.user.id,
      project,
      taskTitle,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      hours: numHours,
      billable: billable !== undefined ? billable : true,
      status: 'pending',
    });

    // Notify Project Manager if exists
    if (projDoc.manager && projDoc.manager.toString() !== req.user.id) {
      await Notification.create({
        recipient: projDoc.manager,
        sender: req.user.id,
        title: 'New Timesheet Submitted',
        message: `${req.user.name} logged ${numHours}h on ${projDoc.name}`,
        type: 'submission',
        link: '/approvals',
      }).catch(() => {});
    }

    const populated = await Timesheet.findById(timesheet._id)
      .populate('user', 'name email designation avatar')
      .populate('project', 'name code clientName');

    res.status(201).json({ success: true, timesheet: populated });
  } catch (error) {
    console.error('Error logging time:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/timesheets/:id
// @desc    Edit a timesheet entry (Editable only if pending or by admin)
export const updateTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ success: false, message: 'Timesheet entry not found' });
    }

    // Role check: Only owner can edit, unless admin
    if (timesheet.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this timesheet' });
    }

    // Status check: Cannot edit once approved
    if (timesheet.status === 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Approved timesheets cannot be modified. Contact your manager or admin.',
      });
    }

    const { project, taskTitle, description, date, hours, billable } = req.body;
    if (project) timesheet.project = project;
    if (taskTitle) timesheet.taskTitle = taskTitle;
    if (description !== undefined) timesheet.description = description;
    if (date) timesheet.date = new Date(date);
    if (hours !== undefined) timesheet.hours = Number(hours);
    if (billable !== undefined) timesheet.billable = billable;

    // If was rejected and employee edits, reset status to pending for re-review!
    if (timesheet.status === 'rejected') {
      timesheet.status = 'pending';
      timesheet.reviewComment = '';
    }

    await timesheet.save();

    const populated = await Timesheet.findById(timesheet._id)
      .populate('user', 'name email designation avatar')
      .populate('project', 'name code clientName');

    res.json({ success: true, timesheet: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/timesheets/:id
// @desc    Delete timesheet entry
export const deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id);
    if (!timesheet) {
      return res.status(404).json({ success: false, message: 'Timesheet entry not found' });
    }

    if (timesheet.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this timesheet' });
    }

    if (timesheet.status === 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Approved timesheet cannot be deleted. Contact admin.',
      });
    }

    await Timesheet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timesheet entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/timesheets/:id/approve
// @desc    Approve or reject a timesheet entry (Manager, Admin)
export const reviewTimesheet = async (req, res) => {
  try {
    const { status, reviewComment } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, rejected, or pending',
      });
    }

    const timesheet = await Timesheet.findById(req.params.id).populate('project');
    if (!timesheet) {
      return res.status(404).json({ success: false, message: 'Timesheet entry not found' });
    }

    // Managers can only review their assigned projects (Admin can review all)
    if (
      req.user.role === 'manager' &&
      timesheet.project?.manager?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only review timesheets for projects you manage',
      });
    }

    timesheet.status = status;
    timesheet.reviewedBy = req.user.id;
    timesheet.reviewedAt = new Date();
    timesheet.reviewComment = reviewComment || (status === 'approved' ? 'Approved by manager' : 'Requires revision');

    await timesheet.save();

    // Create Notification for the employee
    await Notification.create({
      recipient: timesheet.user,
      sender: req.user.id,
      title: `Timesheet ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your entry for "${timesheet.taskTitle}" (${timesheet.hours}h) was ${status}.${reviewComment ? ` Note: "${reviewComment}"` : ''}`,
      type: status === 'approved' ? 'approval' : 'rejection',
      link: '/timesheets',
    }).catch(() => {});

    const populated = await Timesheet.findById(timesheet._id)
      .populate('user', 'name email designation avatar')
      .populate('project', 'name code clientName')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Timesheet marked as ${status}`,
      timesheet: populated,
    });
  } catch (error) {
    console.error('Error reviewing timesheet:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/timesheets/bulk-approve
// @desc    Approve multiple timesheets at once
export const bulkReviewTimesheets = async (req, res) => {
  try {
    const { ids, status, reviewComment } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of timesheet IDs' });
    }

    const updateData = {
      status: status || 'approved',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewComment: reviewComment || 'Batch processed by manager',
    };

    const result = await Timesheet.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `Successfully processed ${result.modifiedCount} timesheets`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
