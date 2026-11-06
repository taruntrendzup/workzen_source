import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Plus,
  Check,
  X,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ApprovalModal } from '../components/modals/ApprovalModal';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const { openLogModal } = useOutletContext() || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedForReview, setSelectedForReview] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to global data refresh event
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('workzen_refresh_data', handleRefresh);
    return () => window.removeEventListener('workzen_refresh_data', handleRefresh);
  }, []);

  const handleQuickApprove = async (timesheetId) => {
    try {
      await api.put(`/timesheets/${timesheetId}/approve`, {
        status: 'approved',
        reviewComment: 'Quick approved from dashboard',
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving entry');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Crunching workforce metrics...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 1. ADMIN DASHBOARD VIEW
  // ==========================================
  if (role === 'admin') {
    const stats = data?.stats || {};
    const dailyTrend = data?.dailyTrend || [];
    const projectBreakdown = data?.projectBreakdown || [];
    const recentPending = data?.recentPending || [];

    return (
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 ring-1 ring-teal-500/30">
              <ShieldCheck className="h-3.5 w-3.5" /> Administrator Operations Center
            </div>
            <h2 className="text-2xl font-black tracking-tight">Organization Snapshot</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Live telemetry on timesheet submissions, ongoing projects, billable ratios, and team utilization.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur transition-all"
            >
              Executive Report
            </Link>
            <button
              onClick={openLogModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-teal-500/25 transition-all"
            >
              <Plus className="h-4 w-4" /> Log Hours
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Workforce</span>
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.totalUsers || 0}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-purple-600">{stats.totalEmployees || 0} Employees</span>
              <span>•</span>
              <span>{stats.totalManagers || 0} Managers</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
              <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.activeProjects || 0}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>{stats.totalProjects || 0} Total Projects tracked</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hours Logged</span>
              <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.totalHours || 0} hrs</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="text-teal-600 font-bold">{stats.billableHours || 0}h billable</span>
              <span>({Math.round(((stats.billableHours || 0) / (stats.totalHours || 1)) * 100)}%)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.pendingApprovals || 0}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-amber-600 font-semibold">
              <Link to="/approvals" className="hover:underline flex items-center gap-1">
                Needs manager action <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Hours Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">7-Day Hours Velocity</h3>
                <p className="text-xs text-slate-500">Hours recorded across company by date</p>
              </div>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">
                This Week: {stats.weekHours || 0}h
              </span>
            </div>
            <div className="h-64 w-full">
              {dailyTrend.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Clock className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No hours logged this week</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Time logged across projects will appear here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend}>
                    <defs>
                      <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalHours"
                      name="Logged Hours"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#hourGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Project Distribution Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Project Hours Distribution</h3>
                <p className="text-xs text-slate-500">Top projects by consumed workforce hours</p>
              </div>
              <Link to="/projects" className="text-xs font-bold text-teal-600 hover:text-teal-700">
                All Projects →
              </Link>
            </div>
            <div className="h-64 w-full">
              {projectBreakdown.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Briefcase className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No project hours tracked yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Project hour distributions will show once team logs time</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="loggedHours" name="Hours Logged" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Recent Pending Approvals Action Widget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Timesheets Awaiting Review</h3>
              <p className="text-xs text-slate-500">Quickly review and approve pending employee submissions</p>
            </div>
            <Link
              to="/approvals"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View Full Approval Queue ({stats.pendingApprovals || 0}) <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPending.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                🎉 All timesheet submissions have been reviewed and approved!
              </div>
            ) : (
              recentPending.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {item.user?.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.user?.name}</span>
                        <span className="text-[10px] text-slate-400">[{item.project?.code}] {item.project?.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.taskTitle}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-bold text-teal-600">{item.hours} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedForReview(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Inspect / Note
                    </button>
                    <button
                      onClick={() => handleQuickApprove(item._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. MANAGER DASHBOARD VIEW
  // ==========================================
  if (role === 'manager') {
    const stats = data?.stats || {};
    const managedProjects = data?.managedProjects || [];
    const pendingReviewList = data?.pendingReviewList || [];
    const teamProductivity = data?.teamProductivity || [];
    const dailyTrend = data?.dailyTrend || [];

    return (
      <div className="space-y-6">
        {/* Manager Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-slate-900 to-teal-900 p-6 rounded-3xl text-white shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 ring-1 ring-blue-500/30">
              <UserCheck className="h-3.5 w-3.5" /> Project Manager Dashboard
            </div>
            <h2 className="text-2xl font-black tracking-tight">Team Operations & Timesheet Review</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Monitor deliverable progress, track team workloads, and conduct prompt approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/approvals"
              className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-lg transition-all"
            >
              Review Timesheets ({stats.pendingApprovals || 0})
            </Link>
          </div>
        </div>

        {/* Manager Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Managed Projects</span>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.managedProjectsCount || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Direct project governance</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            <p className="mt-2 text-2xl font-extrabold text-amber-600">{stats.pendingApprovals || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Waiting for your sign-off</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Team Hours</span>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{stats.totalTeamHours || 0} hrs</p>
            <p className="text-xs text-teal-600 font-semibold mt-1">{stats.approvedTeamHours || 0} hrs approved</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Rate</span>
            <p className="mt-2 text-2xl font-extrabold text-teal-600">
              {stats.totalTeamHours > 0
                ? Math.round((stats.approvedTeamHours / stats.totalTeamHours) * 100)
                : 100}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Quality verification index</p>
          </div>
        </div>

        {/* Pending Approvals Quick Action List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Urgent Pending Timesheets</h3>
              <p className="text-xs text-slate-500">Entries logged on your assigned projects</p>
            </div>
            <Link to="/approvals" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Open Full Approvals Center →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingReviewList.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                ✨ No pending timesheets waiting for your review. Great job!
              </div>
            ) : (
              pendingReviewList.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.user?.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {item.project?.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">{item.taskTitle}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(item.date).toLocaleDateString()} • <span className="font-bold text-teal-600">{item.hours}h</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedForReview(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Inspect / Reject
                    </button>
                    <button
                      onClick={() => handleQuickApprove(item._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Team Productivity Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team Workload & Output</h3>
              <p className="text-xs text-slate-500">Logged hours breakdown across engineers & designers</p>
            </div>
            <Award className="h-5 w-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamProductivity.map((member) => (
              <div key={member.name} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.designation}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500">Logged Output:</span>
                  <span className="text-xs font-extrabold text-teal-600">{member.totalHours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. EMPLOYEE DASHBOARD VIEW
  // ==========================================
  const stats = data?.stats || {};
  const assignedProjects = data?.assignedProjects || [];
  const recentTimesheets = data?.recentTimesheets || [];
  const dailyTrend = data?.dailyTrend || [];

  return (
    <div className="space-y-6">
      {/* Employee Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 ring-1 ring-teal-500/30">
            <Clock className="h-3.5 w-3.5" /> Workzen Daily Workspace
          </div>
          <h2 className="text-2xl font-black tracking-tight">Track Your Productivity & Impact</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Keep your hours up to date, check manager review statuses, and stay on top of sprint deliverables.
          </p>
        </div>
        <div>
          <button
            onClick={openLogModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-extrabold shadow-lg shadow-teal-500/30 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Log Work Hours
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Hours</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.todayHours || 0} hrs</p>
          <p className="text-xs text-slate-500 mt-1">Logged today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Week</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.weekHours || 0} hrs</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">{stats.weekApproved || 0}h approved</span>
            <span>•</span>
            <span className="text-amber-600">{stats.weekPending || 0}h pending</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.monthHours || 0} hrs</p>
          <p className="text-xs text-slate-500 mt-1">Monthly total to date</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Projects</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{stats.assignedProjectsCount || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Active initiatives</p>
        </div>
      </div>

      {/* Main Grid: Recent Timesheet Entries & Assigned Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent Logged Entries */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Timesheets</h3>
              <p className="text-xs text-slate-500">Entries logged by you and their approval status</p>
            </div>
            <Link to="/timesheets" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              View All Entries →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTimesheets.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No timesheets logged yet. Click "Log Work Hours" to record your first entry!
              </div>
            ) : (
              recentTimesheets.map((entry) => (
                <div key={entry._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {entry.taskTitle}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {entry.project?.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(entry.date).toLocaleDateString()} • {entry.project?.name}
                    </p>
                    {entry.reviewComment && (
                      <p className="text-[11px] text-slate-600 mt-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 inline-block">
                        Manager note: "{entry.reviewComment}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <span className="text-sm font-extrabold text-slate-800">
                      {entry.hours}h
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        entry.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 col: Assigned Projects */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Your Assigned Projects</h3>
            <Link to="/projects" className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Details
            </Link>
          </div>

          <div className="space-y-3">
            {assignedProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No projects assigned yet</p>
            ) : (
              assignedProjects.map((p) => (
                <div key={p._id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-bold">
                      {p.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.description || 'Sprint deliverable'}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                    <span>Manager: {p.manager?.name || 'Assigned Lead'}</span>
                    <span className="font-semibold text-slate-600">{p.budgetHours}h budget</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal if clicked */}
      <ApprovalModal
        isOpen={Boolean(selectedForReview)}
        timesheet={selectedForReview}
        onClose={() => setSelectedForReview(null)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
};
