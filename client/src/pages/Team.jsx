import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Building, DollarSign, ShieldCheck, UserCheck, User, Search, UserX, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Team = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [recordView, setRecordView] = useState('active');
  const [actionUserId, setActionUserId] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async (status = 'active') => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/auth/users', { params: { status } });
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.response?.data?.message || 'Unable to load team records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(recordView);
  }, [fetchUsers, recordView]);

  const handleTerminationAction = async (member) => {
    const isTerminated = recordView === 'terminated';
    const message = isTerminated
      ? `Restore ${member.name} to the active team? They will be able to sign in again.`
      : `Terminate ${member.name}? Their account access will be revoked. Their team record and work history will be retained in Terminated records.`;
    if (!window.confirm(message)) return;

    setActionUserId(member._id);
    setError('');
    try {
      await api.put(`/auth/users/${member._id}/${isTerminated ? 'restore' : 'terminate'}`);
      await fetchUsers(recordView);
    } catch (err) {
      setError(err.response?.data?.message || `Unable to ${isTerminated ? 'restore' : 'terminate'} this team member.`);
    } finally {
      setActionUserId('');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = users.reduce(
    (counts, member) => {
      counts[member.role] = (counts[member.role] || 0) + 1;
      return counts;
    },
    { admin: 0, manager: 0, employee: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="crm-page-title">Team directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your people, roles, and department details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total members', count: users.length, icon: Users, tone: 'text-indigo-600 bg-indigo-50' },
          { label: 'Administrators', count: roleCounts.admin, icon: ShieldCheck, tone: 'text-violet-600 bg-violet-50' },
          { label: 'Managers', count: roleCounts.manager, icon: UserCheck, tone: 'text-blue-600 bg-blue-50' },
          { label: 'Employees', count: roleCounts.employee, icon: User, tone: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, count, icon: Icon, tone }) => (
          <div key={label} className="crm-stat-card rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['all', 'admin', 'manager', 'employee'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {role === 'admin' && (
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {[
              { value: 'active', label: 'Active team' },
              { value: 'terminated', label: 'Terminated records' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRecordView(item.value)}
                aria-pressed={recordView === item.value}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                  recordView === item.value
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400">
            {recordView === 'terminated' ? 'Records are retained; accounts cannot sign in.' : 'Terminate records without deleting work history.'}
          </span>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Loading directory...</p>
        </div>
      ) : (
        <div className="crm-table-shell overflow-hidden">
          <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {recordView === 'terminated' ? 'Terminated records' : 'People'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Showing {filteredUsers.length} of {users.length} team members
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold uppercase">Team member</th>
                  <th className="px-5 py-3 font-semibold uppercase">Department</th>
                  <th className="px-5 py-3 font-semibold uppercase">Role</th>
                  <th className="px-5 py-3 font-semibold uppercase">Hourly rate</th>
                  <th className="px-5 py-3 font-semibold uppercase">Joined</th>
                  {recordView === 'terminated' && <th className="px-5 py-3 font-semibold uppercase">Terminated</th>}
                  {role === 'admin' && <th className="px-5 py-3 text-right font-semibold uppercase">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((member) => (
                  <tr key={member._id}>
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                            <Mail className="h-3 w-3 shrink-0" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {member.department || 'Operations'}
                      </div>
                      <p className="ml-5 mt-0.5 text-xs text-slate-400">{member.designation || 'Team Member'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          member.role === 'admin'
                            ? 'bg-violet-50 text-violet-700'
                            : member.role === 'manager'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        {member.hourlyRate || 40}
                        <span className="text-xs font-normal text-slate-400">/ hour</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {member.createdAt ? new Date(member.createdAt).getFullYear() : '—'}
                    </td>
                    {recordView === 'terminated' && (
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-600">
                          {member.terminatedAt ? new Date(member.terminatedAt).toLocaleDateString() : '—'}
                        </p>
                        {member.terminatedBy?.name && (
                          <p className="mt-0.5 text-xs text-slate-400">by {member.terminatedBy.name}</p>
                        )}
                      </td>
                    )}
                    {role === 'admin' && (
                      <td className="px-5 py-3.5 text-right">
                        {member.role === 'employee' || member.role === 'manager' ? (
                          <button
                            type="button"
                            onClick={() => handleTerminationAction(member)}
                            disabled={actionUserId === member._id}
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                              recordView === 'terminated'
                                ? 'text-indigo-700 hover:bg-indigo-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            {recordView === 'terminated' ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <UserX className="h-3.5 w-3.5" />
                            )}
                            {actionUserId === member._id
                              ? 'Saving...'
                              : recordView === 'terminated'
                                ? 'Restore'
                                : 'Terminate'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Protected</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5 + (recordView === 'terminated' ? 1 : 0) + (role === 'admin' ? 1 : 0)} className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Search className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {recordView === 'terminated' ? 'No terminated records' : 'No team members found'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {recordView === 'terminated' ? 'Terminated manager and employee records will be kept here.' : 'Try another name, email, department, or role.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
