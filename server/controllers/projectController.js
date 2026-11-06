import { Project } from '../models/Project.js';
import { Timesheet } from '../models/Timesheet.js';
import { Notification } from '../models/Notification.js';

// @route   GET /api/projects
// @desc    Get all projects (filtered by role if employee)
export const getProjects = async (req, res) => {
  try {
    let filter = {};

    // If employee, show projects they are assigned to
    if (req.user.role === 'employee') {
      filter = { assignedEmployees: req.user.id };
    } else if (req.user.role === 'manager') {
      // Show projects managed or assigned or all if manager wants
      filter = {
        $or: [{ manager: req.user.id }, { assignedEmployees: req.user.id }],
      };
    }
    // Admin sees all projects

    const { status, search } = req.query;
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$and = filter.$and || [];
      filter.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.find(filter)
      .populate('manager', 'name email designation avatar')
      .populate('assignedEmployees', 'name email designation department hourlyRate avatar')
      .sort({ createdAt: -1 });

    // Compute logged hours dynamically for each project
    const projectIds = projects.map((p) => p._id);
    const timesheetAgg = await Timesheet.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          totalLoggedHours: { $sum: '$hours' },
          approvedHours: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
          },
        },
      },
    ]);

    const hoursMap = {};
    timesheetAgg.forEach((item) => {
      hoursMap[item._id.toString()] = {
        totalLoggedHours: item.totalLoggedHours,
        approvedHours: item.approvedHours,
      };
    });

    const enrichedProjects = projects.map((proj) => {
      const stats = hoursMap[proj._id.toString()] || {
        totalLoggedHours: 0,
        approvedHours: 0,
      };
      const progress =
        proj.budgetHours > 0
          ? Math.min(100, Math.round((stats.totalLoggedHours / proj.budgetHours) * 100))
          : 0;

      return {
        ...proj.toObject(),
        totalLoggedHours: stats.totalLoggedHours,
        approvedHours: stats.approvedHours,
        progress,
      };
    });

    res.json({ success: true, count: enrichedProjects.length, projects: enrichedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/projects/:id
// @desc    Get single project details with breakdown
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email designation avatar')
      .populate('assignedEmployees', 'name email designation department hourlyRate avatar')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get timesheets for this project
    const timesheets = await Timesheet.find({ project: project._id })
      .populate('user', 'name email designation avatar')
      .sort({ date: -1 });

    const totalHours = timesheets.reduce((acc, curr) => acc + curr.hours, 0);
    const approvedHours = timesheets
      .filter((t) => t.status === 'approved')
      .reduce((acc, curr) => acc + curr.hours, 0);
    const pendingHours = timesheets
      .filter((t) => t.status === 'pending')
      .reduce((acc, curr) => acc + curr.hours, 0);

    // Contributor breakdown
    const contributorMap = {};
    timesheets.forEach((t) => {
      const uId = t.user?._id?.toString() || 'unknown';
      if (!contributorMap[uId]) {
        contributorMap[uId] = {
          user: t.user,
          totalHours: 0,
          entriesCount: 0,
        };
      }
      contributorMap[uId].totalHours += t.hours;
      contributorMap[uId].entriesCount += 1;
    });

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        totalHours,
        approvedHours,
        pendingHours,
        progress:
          project.budgetHours > 0
            ? Math.min(100, Math.round((totalHours / project.budgetHours) * 100))
            : 0,
        contributors: Object.values(contributorMap),
        recentTimesheets: timesheets.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/projects
// @desc    Create project (Admin, Manager)
export const createProject = async (req, res) => {
  try {
    const {
      name,
      code,
      clientName,
      description,
      status,
      priority,
      startDate,
      endDate,
      budgetHours,
      manager,
      assignedEmployees,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      code,
      clientName: clientName || 'Internal Project',
      description,
      status: status || 'in-progress',
      priority: priority || 'medium',
      startDate: startDate || new Date(),
      endDate,
      budgetHours: budgetHours ? Number(budgetHours) : 80,
      manager: manager || req.user.id,
      assignedEmployees: assignedEmployees || [],
      createdBy: req.user.id,
    });

    // Notify assigned employees
    if (assignedEmployees && assignedEmployees.length > 0) {
      for (const empId of assignedEmployees) {
        await Notification.create({
          recipient: empId,
          sender: req.user.id,
          title: 'Assigned to New Project',
          message: `You were assigned to project "${name}"`,
          type: 'assignment',
        }).catch(() => {});
      }
    }

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email designation avatar')
      .populate('assignedEmployees', 'name email designation department');

    res.status(201).json({ success: true, project: populatedProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/projects/:id
// @desc    Update project (Admin, Manager)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Managers can only update projects they manage (or Admin can update any)
    if (
      req.user.role === 'manager' &&
      project.manager.toString() !== req.user.id &&
      project.createdBy?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update projects where you are the assigned manager',
      });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'name email designation avatar')
      .populate('assignedEmployees', 'name email designation department');

    res.json({ success: true, project: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/projects/:id
// @desc    Delete project (Admin only)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await Project.findByIdAndDelete(req.params.id);
    // Delete associated timesheets
    await Timesheet.deleteMany({ project: req.params.id });

    res.json({ success: true, message: 'Project and associated timesheets deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
