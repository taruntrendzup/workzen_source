import { Timesheet } from '../models/Timesheet.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

// @route   GET /api/dashboard/stats
// @desc    Role-specific dashboard statistics & analytics
export const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    // Current week (Monday to Sunday)
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (role === 'admin') {
      // 1. ADMIN DASHBOARD
      const totalUsers = await User.countDocuments();
      const totalEmployees = await User.countDocuments({ role: 'employee' });
      const totalManagers = await User.countDocuments({ role: 'manager' });
      const totalProjects = await Project.countDocuments();
      const activeProjects = await Project.countDocuments({ status: 'in-progress' });

      // Timesheet metrics
      const totalTimesheets = await Timesheet.countDocuments();
      const pendingApprovals = await Timesheet.countDocuments({ status: 'pending' });

      const allHoursAgg = await Timesheet.aggregate([
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$hours' },
            billableHours: {
              $sum: { $cond: [{ $eq: ['$billable', true] }, '$hours', 0] },
            },
            nonBillableHours: {
              $sum: { $cond: [{ $eq: ['$billable', false] }, '$hours', 0] },
            },
          },
        },
      ]);
      const hoursStats = allHoursAgg[0] || { totalHours: 0, billableHours: 0, nonBillableHours: 0 };

      // Hours this week
      const weekHoursAgg = await Timesheet.aggregate([
        { $match: { date: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ]);
      const weekHours = weekHoursAgg[0]?.total || 0;

      // Hours this month
      const monthHoursAgg = await Timesheet.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ]);
      const monthHours = monthHoursAgg[0]?.total || 0;

      // 7-day trend
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const dailyTrend = await Timesheet.aggregate([
        { $match: { date: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            totalHours: { $sum: '$hours' },
            approvedHours: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Project breakdown
      const projectBreakdown = await Timesheet.aggregate([
        {
          $group: {
            _id: '$project',
            loggedHours: { $sum: '$hours' },
            entries: { $sum: 1 },
          },
        },
        { $sort: { loggedHours: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            name: '$project.name',
            code: '$project.code',
            budgetHours: '$project.budgetHours',
            loggedHours: 1,
            entries: 1,
          },
        },
      ]);

      // Recent pending approvals
      const recentPending = await Timesheet.find({ status: 'pending' })
        .populate('user', 'name email designation avatar')
        .populate('project', 'name code')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        role: 'admin',
        stats: {
          totalUsers,
          totalEmployees,
          totalManagers,
          totalProjects,
          activeProjects,
          pendingApprovals,
          totalHours: hoursStats.totalHours,
          billableHours: hoursStats.billableHours,
          nonBillableHours: hoursStats.nonBillableHours,
          weekHours,
          monthHours,
        },
        dailyTrend,
        projectBreakdown,
        recentPending,
      });
    } else if (role === 'manager') {
      // 2. MANAGER DASHBOARD
      const managedProjects = await Project.find({ manager: userId });
      const managedIds = managedProjects.map((p) => p._id);

      const pendingCount = await Timesheet.countDocuments({
        project: { $in: managedIds },
        status: 'pending',
      });

      const totalTeamHoursAgg = await Timesheet.aggregate([
        { $match: { project: { $in: managedIds } } },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$hours' },
            approvedHours: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
            },
          },
        },
      ]);
      const teamStats = totalTeamHoursAgg[0] || { totalHours: 0, approvedHours: 0 };

      // Pending entries for review
      const pendingReviewList = await Timesheet.find({
        project: { $in: managedIds },
        status: 'pending',
      })
        .populate('user', 'name email designation avatar')
        .populate('project', 'name code')
        .sort({ date: -1 })
        .limit(8);

      // Team productivity breakdown
      const teamProductivity = await Timesheet.aggregate([
        { $match: { project: { $in: managedIds } } },
        {
          $group: {
            _id: '$user',
            totalHours: { $sum: '$hours' },
            approvedHours: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
            },
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            designation: '$user.designation',
            totalHours: 1,
            approvedHours: 1,
          },
        },
      ]);

      // 7-day trend for managed projects
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const dailyTrend = await Timesheet.aggregate([
        { $match: { project: { $in: managedIds }, date: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            totalHours: { $sum: '$hours' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json({
        success: true,
        role: 'manager',
        stats: {
          managedProjectsCount: managedProjects.length,
          pendingApprovals: pendingCount,
          totalTeamHours: teamStats.totalHours,
          approvedTeamHours: teamStats.approvedHours,
        },
        managedProjects,
        pendingReviewList,
        teamProductivity,
        dailyTrend,
      });
    } else {
      // 3. EMPLOYEE DASHBOARD
      // Today's hours
      const todayAgg = await Timesheet.aggregate([
        { $match: { user: req.user._id, date: { $gte: today, $lte: endToday } } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ]);
      const todayHours = todayAgg[0]?.total || 0;

      // This week's hours
      const weekAgg = await Timesheet.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfWeek } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$hours' },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$hours', 0] },
            },
          },
        },
      ]);
      const weekStats = weekAgg[0] || { total: 0, approved: 0, pending: 0 };

      // Monthly hours
      const monthAgg = await Timesheet.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$hours' } } },
      ]);
      const monthHours = monthAgg[0]?.total || 0;

      // Assigned projects
      const assignedProjects = await Project.find({ assignedEmployees: userId })
        .populate('manager', 'name email designation avatar')
        .sort({ createdAt: -1 });

      // Recent timesheets
      const recentTimesheets = await Timesheet.find({ user: userId })
        .populate('project', 'name code')
        .sort({ date: -1 })
        .limit(6);

      // Last 7 days breakdown for chart
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      const dailyTrend = await Timesheet.aggregate([
        { $match: { user: req.user._id, date: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            totalHours: { $sum: '$hours' },
            status: { $first: '$status' },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return res.json({
        success: true,
        role: 'employee',
        stats: {
          todayHours,
          weekHours: weekStats.total,
          weekApproved: weekStats.approved,
          weekPending: weekStats.pending,
          monthHours,
          assignedProjectsCount: assignedProjects.length,
        },
        assignedProjects,
        recentTimesheets,
        dailyTrend,
      });
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
