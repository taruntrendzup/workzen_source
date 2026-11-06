import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Info,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TimesheetModal } from '../components/modals/TimesheetModal';

export const Timesheets = () => {
  const { user, role } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [stats, setStats] = useState({ totalHours: 0, approvedHours: 0, pendingHours: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectsList, setProjectsList] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      let query = `?status=${statusFilter}&project=${projectFilter}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const res = await api.get(`/timesheets${query}`);
      if (res.data.success) {
        setTimesheets(res.data.timesheets || []);
        setStats(res.data.stats || { totalHours: 0, approvedHours: 0, pendingHours: 0 });
      }
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data.success) {
        setProjectsList(res.data.projects || []);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchTimesheets();

    const handleRefresh = () => fetchTimesheets();
    window.addEventListener('workzen_refresh_data', handleRefresh);
    return () => window.removeEventListener('workzen_refresh_data', handleRefresh);
  }, [statusFilter, projectFilter, startDate, endDate]);

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleDelete = async (id, taskTitle) => {
    if (window.confirm(`Delete timesheet entry "${taskTitle}"?`)) {
      try {
        await api.delete(`/timesheets/${id}`);
        fetchTimesheets();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete timesheet');
      }
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="h-3 w-3" /> Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <AlertCircle className="h-3 w-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Timesheets & Work Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Log working hours, view approval history, and manage timesheet records
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Log Work Hours
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Time Logged</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalHours || 0} hrs</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Time</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedHours || 0} hrs</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingHours || 0} hrs</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Project Dropdown */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projectsList.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.code}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date pickers */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Timesheet Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-medium">Fetching timesheets...</p>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No timesheet entries found</h3>
            <p className="text-xs text-slate-400 mt-1">Click "Log Work Hours" to record your time</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  {(role === 'admin' || role === 'manager') && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Task & Work Summary</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Billable</th>
                  <th className="py-3 px-4">Status & Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timesheets.map((t) => {
                  const canModify = t.status !== 'approved' || role === 'admin';
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString()}
                      </td>

                      {(role === 'admin' || role === 'manager') && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                              {t.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-semibold text-slate-900">{t.user?.name}</span>
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {t.project?.code}
                        </span>
                        <span className="ml-2 font-medium text-slate-700">{t.project?.name}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{t.taskTitle}</p>
                        {t.description && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.description}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-sm text-slate-800 whitespace-nowrap">
                        {t.hours} hrs
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            t.billable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.billable ? 'Billable' : 'Non-Billable'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(t.status)}
                          {t.reviewComment && (
                            <p className="text-[10px] text-slate-500 italic max-w-xs">
                              Note: "{t.reviewComment}"
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {canModify ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Entry"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id, t.taskTitle)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <TimesheetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingEntry}
        onSuccess={() => fetchTimesheets()}
      />
    </div>
  );
};
