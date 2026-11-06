import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, CheckSquare, Briefcase, FileText } from 'lucide-react';
import api from '../../services/api';

export const TimesheetModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    project: '',
    taskTitle: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    hours: '8',
    billable: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchAvailableProjects();
      if (initialData) {
        setFormData({
          project: initialData.project?._id || initialData.project || '',
          taskTitle: initialData.taskTitle || '',
          description: initialData.description || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
          hours: String(initialData.hours || '8'),
          billable: initialData.billable !== undefined ? initialData.billable : true,
        });
      } else {
        setFormData({
          project: '',
          taskTitle: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          hours: '8',
          billable: true,
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const fetchAvailableProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjects(res.data.projects || []);
        if (!initialData && res.data.projects?.length > 0) {
          setFormData((prev) => ({ ...prev, project: res.data.projects[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.project) {
      setError('Please select a project');
      return;
    }
    if (!formData.taskTitle.trim()) {
      setError('Please enter a task title');
      return;
    }
    const numHours = parseFloat(formData.hours);
    if (isNaN(numHours) || numHours <= 0 || numHours > 24) {
      setError('Hours must be between 0.25 and 24');
      return;
    }

    setLoading(true);
    try {
      if (initialData?._id) {
        await api.put(`/timesheets/${initialData._id}`, formData);
      } else {
        await api.post('/timesheets', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Timesheet Entry' : 'Log Daily Work Hours'}
              </h3>
              <p className="text-xs text-slate-500">
                Record your hours accurately for manager review & productivity
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Project <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    [{p.code || 'WZ'}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Task or Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implemented OAuth2 & Dashboard Charts"
              value={formData.taskTitle}
              onChange={(e) => setFormData({ ...formData, taskTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              required
            />
          </div>

          {/* Date and Hours row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Work Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Hours Logged <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                placeholder="8"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Detailed Work Summary / Notes
            </label>
            <textarea
              rows="3"
              placeholder="Describe deliverables completed, pull requests, blockers solved..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Billable toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Billable to Client</p>
              <p className="text-[11px] text-slate-500">
                Mark whether this work counts towards client invoice hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.billable}
                onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? 'Submitting...' : initialData ? 'Update Timesheet' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
