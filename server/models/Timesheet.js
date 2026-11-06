import mongoose from 'mongoose';

const timesheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required for timesheet entry'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required for timesheet entry'],
    },
    taskTitle: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Work date is required'],
      default: Date.now,
    },
    hours: {
      type: Number,
      required: [true, 'Work hours are required'],
      min: [0.25, 'Minimum time logged is 15 minutes (0.25h)'],
      max: [24, 'Cannot log more than 24 hours in a single entry'],
    },
    billable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewComment: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Timesheet = mongoose.model('Timesheet', timesheetSchema);
