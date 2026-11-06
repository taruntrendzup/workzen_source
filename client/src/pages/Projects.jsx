import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Layers,
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
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects?status=${statusFilter}&search=${search}`);
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
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
        fetchProjects();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting project');
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setSelectedProjectDetails(res.data.project);
      }
    } catch (err) {
      alert('Failed to load project details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'planning':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'on-hold':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Project Governance</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track milestones, budgets, assigned team capacity, and logged hour burns
          </p>
        </div>

        {(role === 'admin' || role === 'manager') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create New Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'in-progress', 'planning', 'on-hold', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search filter or create a new project</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const isOverBudget = p.totalLoggedHours > p.budgetHours;
            return (
              <div
                key={p._id}
                className="flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top tags row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                      {p.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          p.priority
                        )}`}
                      >
                        {p.priority}
                      </span>
                    </div>
                  </div>

                  {/* Project Title and Client */}
                  <h3
                    onClick={() => handleViewDetails(p._id)}
                    className="text-base font-bold text-slate-900 hover:text-teal-600 cursor-pointer transition-colors"
                  >
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Client: <span className="text-slate-600 font-semibold">{p.clientName}</span>
                  </p>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {p.description || 'Enterprise deliverable in active development cycle.'}
                  </p>

                  {/* Progress Bar & Budget Hours */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Logged / Budget:</span>
                      <span className="font-extrabold text-slate-800">
                        <span className={isOverBudget ? 'text-rose-600' : 'text-teal-600'}>
                          {p.totalLoggedHours || 0}h
                        </span>{' '}
                        / {p.budgetHours}h
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget ? 'bg-rose-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, p.progress || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Team Footer and Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Assigned Team Avatars */}
                  <div className="flex items-center -space-x-2">
                    {p.assignedEmployees?.slice(0, 3).map((emp, idx) => (
                      <div
                        key={emp._id || idx}
                        title={emp.name}
                        className="h-7 w-7 rounded-full bg-slate-800 text-teal-300 ring-2 ring-white flex items-center justify-center text-[10px] font-bold"
                      >
                        {emp.name?.charAt(0) || 'E'}
                      </div>
                    ))}
                    {p.assignedEmployees?.length > 3 && (
                      <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 ring-2 ring-white flex items-center justify-center text-[10px] font-bold">
                        +{p.assignedEmployees.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewDetails(p._id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Overview
                    </button>

                    {(role === 'admin' || role === 'manager') && (
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    {role === 'admin' && (
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
        onSuccess={() => fetchProjects()}
      />
    </div>
  );
};
