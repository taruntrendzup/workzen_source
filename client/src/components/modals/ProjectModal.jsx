import React, { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, Users, Hash, Clock, Check } from 'lucide-react';
import api from '../../services/api';

export const ProjectModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    clientName: '',
    description: '',
    status: 'in-progress',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budgetHours: 120,
    manager: '',
    assignedEmployees: [],
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          code: initialData.code || '',
          clientName: initialData.clientName || '',
          description: initialData.description || '',
          status: initialData.status || 'in-progress',
          priority: initialData.priority || 'medium',
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().split('T')[0]
            : '',
          endDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().split('T')[0]
            : '',
          budgetHours: initialData.budgetHours || 120,
          manager: initialData.manager?._id || initialData.manager || '',
          assignedEmployees: initialData.assignedEmployees?.map((e) => e._id || e) || [],
        });
      } else {
        setFormData({
          name: '',
          code: '',
          clientName: '',
          description: '',
          status: 'in-progress',
          priority: 'medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          budgetHours: 120,
          manager: '',
          assignedEmployees: [],
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) {
        const allUsers = res.data.users || [];
        const mgrs = allUsers.filter((u) => u.role === 'manager' || u.role === 'admin');
        const emps = allUsers.filter((u) => u.role === 'employee');
        setManagers(mgrs);
        setEmployees(emps);
        if (!initialData && mgrs.length > 0) {
          setFormData((prev) => ({ ...prev, manager: mgrs[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleToggleEmployee = (empId) => {
    setFormData((prev) => {
      const exists = prev.assignedEmployees.includes(empId);
      if (exists) {
        return {
          ...prev,
          assignedEmployees: prev.assignedEmployees.filter((id) => id !== empId),
        };
      } else {
        return {
          ...prev,
          assignedEmployees: [...prev.assignedEmployees, empId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    try {
      if (initialData?._id) {
        await api.put(`/projects/${initialData._id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialData ? 'Update Project Details' : 'Create New Project'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure timeline, budget hours, manager assignment, and team members
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
          {/* Project Name and Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Workzen Enterprise Portal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Project Code
              </label>
              <input
                type="text"
                placeholder="e.g. WZ-101"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 uppercase focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Client & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Client / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Zenith Global Corp"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Budgeted Allocated Hours
              </label>
              <input
                type="number"
                min="1"
                value={formData.budgetHours}
                onChange={(e) => setFormData({ ...formData, budgetHours: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Timeline Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Assigned Manager */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Project Manager <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:outline-none"
              required
            >
              <option value="">-- Assign Manager --</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.designation || m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Project Scope & Objectives
            </label>
            <textarea
              rows="2"
              placeholder="High-level milestones, client scope, deliverables..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Assigned Employees Multi-Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assign Team Members ({formData.assignedEmployees.length} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {employees.map((emp) => {
                const isSelected = formData.assignedEmployees.includes(emp._id);
                return (
                  <div
                    key={emp._id}
                    onClick={() => handleToggleEmployee(emp._id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {emp.designation || emp.department}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
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
              {loading ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
