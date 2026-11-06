import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Briefcase,
  Calendar,
  Sparkles,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApprovalModal } from '../components/modals/ApprovalModal';

export const Approvals = () => {
  const { role } = useAuth();
  const [tab, setTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reviewModalEntry, setReviewModalEntry] = useState(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/timesheets?status=${tab}`);
      if (res.data.success) {
        setEntries(res.data.timesheets || []);
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('Error fetching approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [tab]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(entries.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickApprove = async (id) => {
    try {
      await api.put(`/timesheets/${id}/approve`, {
        status: 'approved',
        reviewComment: 'Approved by manager',
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.post('/timesheets/bulk-approve', {
        ids: selectedIds,
        status: 'approved',
        reviewComment: 'Batch approved by manager',
      });
      if (res.data.success) {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
        });
        fetchEntries();
      }
    } catch (err) {
      alert('Bulk approval failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Timesheet Approval Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted work hours, evaluate deliverables, and provide constructive feedback
          </p>
        </div>

        {tab === 'pending' && selectedIds.length > 0 && (
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" /> Approve Selected ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            tab === 'pending'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" /> Pending Approvals
          {tab === 'pending' && entries.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {entries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('approved')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            tab === 'approved'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" /> Approved History
        </button>

        <button
          onClick={() => setTab('rejected')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            tab === 'rejected'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="h-4 w-4" /> Revisions Requested
        </button>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-medium">Loading approval queue...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No {tab} timesheets</h3>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'pending'
                ? 'All team submissions have been processed!'
                : `No ${tab} entries on record.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  {tab === 'pending' && (
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === entries.length && entries.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                  )}
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Task Title & Details</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Billable</th>
                  <th className="py-3 px-4">Feedback / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    {tab === 'pending' && (
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => handleToggleSelect(item._id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                    )}

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-900 text-teal-300 font-bold flex items-center justify-center text-xs">
                          {item.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.user?.name}</p>
                          <p className="text-[10px] text-slate-400">{item.user?.designation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {item.project?.code}
                      </span>
                      <p className="text-slate-600 font-medium text-xs mt-0.5">{item.project?.name}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{item.taskTitle}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-black text-sm text-teal-700 whitespace-nowrap">
                      {item.hours} hrs
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.billable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.billable ? 'Billable' : 'Non-Billable'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {item.reviewComment ? (
                        <p className="text-[11px] text-slate-600 italic truncate">
                          "{item.reviewComment}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {tab === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReviewModalEntry(item)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                          >
                            Review / Note
                          </button>
                          <button
                            onClick={() => handleQuickApprove(item._id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                          >
                            <Check className="h-3 w-3" /> Approve
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewModalEntry(item)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ApprovalModal
        isOpen={Boolean(reviewModalEntry)}
        timesheet={reviewModalEntry}
        onClose={() => setReviewModalEntry(null)}
        onSuccess={() => fetchEntries()}
      />
    </div>
  );
};
