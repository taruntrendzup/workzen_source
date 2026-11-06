import { Timesheet } from '../models/Timesheet.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';

// @route   GET /api/reports/summary
// @desc    Get aggregate reports by employee, project, or monthly timeline
export const getReportsSummary = async (req, res) => {
  try {
    const { startDate, endDate, project, employee, groupBy } = req.query;

    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchQuery.date.$lte = end;
      }
    }

    if (project && project !== 'all') {
      matchQuery.project = project;
    }

    if (employee && employee !== 'all') {
      matchQuery.user = employee;
    }

    // Role safety: employees can only generate reports on themselves
    if (req.user.role === 'employee') {
      matchQuery.user = req.user._id;
    }

    // 1. Employee Report Summary
    const employeeReport = await Timesheet.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$user',
          totalHours: { $sum: '$hours' },
          billableHours: {
            $sum: { $cond: [{ $eq: ['$billable', true] }, '$hours', 0] },
          },
          nonBillableHours: {
            $sum: { $cond: [{ $eq: ['$billable', false] }, '$hours', 0] },
          },
          approvedHours: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
          },
          pendingHours: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$hours', 0] },
          },
          rejectedHours: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$hours', 0] },
          },
          entriesCount: { $sum: 1 },
        },
      },
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
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          department: '$user.department',
          designation: '$user.designation',
          hourlyRate: '$user.hourlyRate',
          totalHours: 1,
          billableHours: 1,
          nonBillableHours: 1,
          approvedHours: 1,
          pendingHours: 1,
          rejectedHours: 1,
          entriesCount: 1,
          estimatedCost: { $multiply: ['$totalHours', '$user.hourlyRate'] },
        },
      },
      { $sort: { totalHours: -1 } },
    ]);

    // 2. Project Report Summary
    const projectReport = await Timesheet.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$project',
          totalHours: { $sum: '$hours' },
          billableHours: {
            $sum: { $cond: [{ $eq: ['$billable', true] }, '$hours', 0] },
          },
          approvedHours: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$hours', 0] },
          },
          pendingHours: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$hours', 0] },
          },
          contributors: { $addToSet: '$user' },
          entriesCount: { $sum: 1 },
        },
      },
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
          _id: 1,
          name: '$project.name',
          code: '$project.code',
          clientName: '$project.clientName',
          status: '$project.status',
          budgetHours: '$project.budgetHours',
          totalHours: 1,
          billableHours: 1,
          approvedHours: 1,
          pendingHours: 1,
          entriesCount: 1,
          contributorCount: { $size: '$contributors' },
        },
      },
      { $sort: { totalHours: -1 } },
    ]);

    // Overall Totals
    const totalHours = employeeReport.reduce((acc, c) => acc + c.totalHours, 0);
    const totalBillable = employeeReport.reduce((acc, c) => acc + c.billableHours, 0);
    const totalCost = employeeReport.reduce((acc, c) => acc + (c.estimatedCost || 0), 0);

    res.json({
      success: true,
      summary: {
        totalHours,
        totalBillable,
        billableRate: totalHours > 0 ? Math.round((totalBillable / totalHours) * 100) : 0,
        totalCost,
      },
      employeeReport,
      projectReport,
    });
  } catch (error) {
    console.error('Error generating report summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
