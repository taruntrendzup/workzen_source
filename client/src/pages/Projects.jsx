import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProjectModal } from '../components/modals/ProjectModal';

export const Projects = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);

  const fetchProjects = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/projects?status=all&search=${encodeURIComponent(searchTerm)}`);
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects(search);
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects(search);
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting project');
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setSelectedProjectDetails(res.data.project);
      }
    } catch (err) {
      alert('Failed to load project details');
    }
  };

  const getPriorityBadge = (pr) => {
    switch (pr) {
      case 'critical':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const projectColumns = [
    { status: 'planning', title: 'Backlog', marker: 'bg-violet-500' },
    { status: 'in-progress', title: 'In progress', marker: 'bg-amber-500' },
    { status: 'on-hold', title: 'On hold', marker: 'bg-rose-500' },
    { status: 'completed', title: 'Done', marker: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="crm-page-title">Projects report</h2>
          <p className="text-xs text-slate-500 mt-1">
            Stay on top of active work, team capacity, and project budgets.
          </p>
        </div>

        {(role === 'admin' || role === 'manager') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 active:scale-95 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create New Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-sm">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex w-full items-center gap-1 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          {['all', 'in-progress', 'planning', 'on-hold', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {status === 'all' ? 'All projects' : status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project Status Board */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectColumns.map((column) => {
            const columnProjects = projects.filter(
              (project) => project.status === column.status &&
                (statusFilter === 'all' || project.status === statusFilter)
            );
            return (
              <section key={column.status} className="min-w-0">
                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <span className={`h-2 w-2 rounded-full ${column.marker}`} />
                    {column.title}
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {columnProjects.length}
                    </span>
                  </h3>
                  {(role === 'admin' || role === 'manager') && (
                    <button
                      onClick={handleOpenCreate}
                      title={`Create project in ${column.title}`}
                      className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {columnProjects.map((p) => {
                    const isOverBudget = p.totalLoggedHours > p.budgetHours;
                    return (
                      <article key={p._id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <Briefcase className="h-3 w-3" /> {p.code}
                          </span>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${getPriorityBadge(p.priority)}`}>
                            {p.priority}
                          </span>
                        </div>
                        <h4
                          onClick={() => handleViewDetails(p._id)}
                          className="mt-2 cursor-pointer text-[13px] font-semibold leading-snug text-slate-800 transition-colors hover:text-indigo-600"
                        >
                          {p.name}
                        </h4>
                        <p className="mt-1 truncate text-[10px] text-slate-500">{p.clientName || 'No client'} · {p.manager?.name || 'Unassigned'}</p>
                        <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                          {p.description || 'No project description provided.'}
                        </p>
                        <div className="mt-3 border-t border-slate-100 pt-2">
                          <div className="mb-1.5 flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">Logged / budget</span>
                            <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                              {p.totalLoggedHours || 0} / {p.budgetHours || 0}h
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-400'}`}
                              style={{ width: `${Math.min(100, p.progress || 0)}%` }}
                            />
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center -space-x-1.5">
                            {p.assignedEmployees?.slice(0, 3).map((emp, idx) => (
                              <span
                                key={emp._id || idx}
                                title={emp.name}
                                className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-700"
                              >
                                {emp.name?.charAt(0) || 'E'}
                              </span>
                            ))}
                            {p.assignedEmployees?.length > 3 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[8px] font-bold text-slate-600">
                                +{p.assignedEmployees.length - 3}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewDetails(p._id)}
                              className="rounded px-1.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                              Details
                            </button>
                            {(role === 'admin' || role === 'manager') && (
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="rounded p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit Project"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            )}
                            {role === 'admin' && (
                              <button
                                onClick={() => handleDelete(p._id, p.name)}
                                className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Delete Project"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {columnProjects.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-[10px] text-slate-400">
                      No projects in this stage
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Project Details Modal / Drawer */}
      {selectedProjectDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {selectedProjectDetails.code}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedProjectDetails.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Client: {selectedProjectDetails.clientName} • Manager:{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedProjectDetails.manager?.name || 'Unassigned'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectDetails(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Hours Logged</span>
                <p className="text-xl font-extrabold text-teal-600 mt-1">
                  {selectedProjectDetails.totalHours || 0} hrs
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Allocated Budget</span>
                <p className="text-xl font-extrabold text-slate-800 mt-1">
                  {selectedProjectDetails.budgetHours || 0} hrs
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Approved Time</span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {selectedProjectDetails.approvedHours || 0} hrs
                </p>
              </div>
            </div>

            {/* Team Contributors breakdown */}
            <div className="mt-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Team Contributors & Capacity
              </h4>
              <div className="space-y-2">
                {selectedProjectDetails.contributors?.length === 0 ? (
                  <p className="text-xs text-slate-400">No time logged by team members yet</p>
                ) : (
                  selectedProjectDetails.contributors?.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center font-bold text-xs">
                          {c.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{c.user?.name}</p>
                          <p className="text-[10px] text-slate-400">{c.user?.designation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-teal-600">{c.totalHours} hrs</span>
                        <p className="text-[10px] text-slate-400">{c.entriesCount} entries</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Timesheet entries */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Recent Work Log Entries
              </h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                {selectedProjectDetails.recentTimesheets?.map((t) => (
                  <div key={t._id} className="p-3 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{t.taskTitle}</p>
                      <p className="text-slate-400 text-[11px]">
                        By {t.user?.name} on {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-teal-600">{t.hours} hrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingProject}
        onSuccess={() => fetchProjects(search)}
      />
    </div>
  );
};
