import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, Calendar, User, Briefcase, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';

export const ApprovalModal = ({ isOpen, onClose, onSuccess, timesheet }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !timesheet) return null;

  const handleAction = async (status) => {
    if (status === 'rejected' && !comment.trim()) {
      setError('Please provide feedback explaining why this timesheet requires revision');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/timesheets/${timesheet._id}/approve`, {
        status,
        reviewComment: comment,
      });

      if (res.data.success) {
        if (status === 'approved') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update approval status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Review Timesheet Entry</h3>
              <p className="text-xs text-slate-500">
                Verify logged hours and deliverables before approving
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Timesheet Details Summary */}
        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-900">
                {timesheet.user?.name || 'Employee'}
              </span>
              <span className="text-[11px] text-slate-500">
                ({timesheet.user?.designation || 'Team Member'})
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                timesheet.billable
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {timesheet.billable ? 'Billable' : 'Non-Billable'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>
                [{timesheet.project?.code || 'WZ'}] {timesheet.project?.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(timesheet.date).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80">
            <p className="text-xs font-semibold text-slate-800">
              Task: {timesheet.taskTitle}
            </p>
            {timesheet.description && (
              <p className="text-xs text-slate-600 mt-1 italic">
                "{timesheet.description}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
            <span className="text-xs font-semibold text-slate-500">Total Logged Time:</span>
            <span className="text-lg font-extrabold text-teal-600">
              {timesheet.hours} hrs
            </span>
          </div>
        </div>

        {/* Manager Review Feedback input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Manager Feedback / Approval Comment
          </label>
          <textarea
            rows="2"
            placeholder="Add an optional praise note or explain reasons if requesting changes..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Decision Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('rejected')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm font-semibold hover:bg-rose-100 active:scale-95 disabled:opacity-50 transition-all"
            >
              <XCircle className="h-4 w-4" />
              Reject / Request Revision
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleAction('approved')}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold shadow-sm hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
