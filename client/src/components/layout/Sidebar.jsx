import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  CheckSquare,
  BarChart3,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserCircle,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (role === 'admin' || role === 'manager') {
      const fetchPending = async () => {
        try {
          const res = await api.get('/timesheets?status=pending');
          if (res.data.success) {
            setPendingCount(res.data.count || 0);
          }
        } catch (e) {
          // ignore
        }
      };
      fetchPending();
      const interval = setInterval(fetchPending, 30000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const navItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Projects',
      to: '/projects',
      icon: Briefcase,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Timesheets',
      to: '/timesheets',
      icon: Clock,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Approvals',
      to: '/approvals',
      icon: CheckSquare,
      roles: ['admin', 'manager'],
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      name: 'Reports & Analytics',
      to: '/reports',
      icon: BarChart3,
      roles: ['admin', 'manager', 'employee'],
    },
    {
      name: 'Team Directory',
      to: '/team',
      icon: Users,
      roles: ['admin', 'manager'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
          <Logo size="md" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workforce Portal
          </p>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || 'Administrator'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase border ${getRoleBadgeStyle(
                    role
                  )}`}
                >
                  {role}
                </span>
                <span className="truncate text-[11px] text-slate-400">
                  {user?.department || 'Operations'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
