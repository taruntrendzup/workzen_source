import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Reports = () => {
  const { role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'projects'

  const fetchReports = async () => {
    try {
      setLoading(true);
      let query = '';
      if (startDate) query += `?startDate=${startDate}`;
      if (endDate) query += `${query ? '&' : '?'}endDate=${endDate}`;

      const res = await api.get(`/reports/summary${query}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'employees') {
      csvContent += 'Name,Email,Department,Designation,Hourly Rate,Total Hours,Billable Hours,Approved Hours,Estimated Cost\n';
      data.employeeReport?.forEach((row) => {
        csvContent += `"${row.name}","${row.email}","${row.department}","${row.designation}",$${row.hourlyRate},${row.totalHours},${row.billableHours},${row.approvedHours},$${row.estimatedCost}\n`;
      });
    } else {
      csvContent += 'Project Code,Project Name,Client,Status,Budget Hours,Total Logged Hours,Approved Hours,Contributors\n';
      data.projectReport?.forEach((row) => {
        csvContent += `"${row.code}","${row.name}","${row.clientName}","${row.status}",${row.budgetHours},${row.totalHours},${row.approvedHours},${row.contributorCount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workzen_${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = data?.summary || { totalHours: 0, totalBillable: 0, billableRate: 0, totalCost: 0 };
  const employeeReport = data?.employeeReport || [];
  const projectReport = data?.projectReport || [];

  // Pie chart data for Billable vs Non-Billable
  const pieData = [
    { name: 'Billable Hours', value: summary.totalBillable, color: '#0d9488' },
    { name: 'Non-Billable', value: Math.max(0, summary.totalHours - summary.totalBillable), color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Workforce Intelligence & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Productivity aggregates, project budget consumption, and payroll estimates
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-teal-600" /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'employees'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Employee Summary
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'projects'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Project Summary
          </button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Recorded Time</span>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{summary.totalHours || 0} hrs</p>
          <p className="text-xs text-slate-500 mt-1">Across all logged tasks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billable Ratio</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieIcon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{summary.billableRate || 0}%</p>
          <p className="text-xs text-slate-500 mt-1">{summary.totalBillable || 0} billable hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Payroll Cost</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">${summary.totalCost?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Based on member hourly rates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contributing Members</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{employeeReport.length || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Active contributors</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Hours Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Hours Breakdown</h3>
              <p className="text-xs text-slate-500">Billable vs total hours delivered per initiative</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {projectReport.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Briefcase className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No project data for report</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Projects with logged hours will be visualized here</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectReport}>
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="totalHours" name="Total Hours" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="billableHours" name="Billable Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Billable vs Non-Billable Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Billable Efficiency</h3>
            <p className="text-xs text-slate-500">Client-billable vs internal allocation</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {summary.totalHours === 0 ? (
              <div className="text-center text-slate-400">
                <Clock className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No time recorded</p>
                <p className="text-[10px] text-slate-400">Billable ratio will calculate once hours are logged</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-teal-600" />
              <span>Billable ({summary.billableRate}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-slate-400" />
              <span>Non-billable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {activeTab === 'employees' ? 'Employee Performance Ledger' : 'Project Budget Audit Ledger'}
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {activeTab === 'employees' ? `${employeeReport.length} records` : `${projectReport.length} records`}
          </span>
        </div>

        {activeTab === 'employees' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Total Hours</th>
                  <th className="py-3 px-4">Billable Hours</th>
                  <th className="py-3 px-4">Approved Hours</th>
                  <th className="py-3 px-4 text-right">Est. Payroll Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeeReport.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      No employee timesheet logs recorded yet. Once team logs hours, summaries will populate here.
                    </td>
                  </tr>
                ) : (
                  employeeReport.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {emp.department} • {emp.designation}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        ${emp.hourlyRate}/h
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{emp.totalHours} hrs</td>
                      <td className="py-3.5 px-4 font-semibold text-teal-600">
                        {emp.billableHours} hrs
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        {emp.approvedHours} hrs
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                        ${emp.estimatedCost?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Budget Hours</th>
                  <th className="py-3 px-4">Logged Hours</th>
                  <th className="py-3 px-4">Approved Hours</th>
                  <th className="py-3 px-4 text-right">Team Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectReport.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                      No project budget audit records yet. Create projects and record hours to inspect budget performance.
                    </td>
                  </tr>
                ) : (
                  projectReport.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-700 bg-teal-50/50">
                        {proj.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{proj.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{proj.clientName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{proj.budgetHours} hrs</td>
                      <td className="py-3.5 px-4 font-black text-slate-900">{proj.totalHours} hrs</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{proj.approvedHours} hrs</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                        {proj.contributorCount} members
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
