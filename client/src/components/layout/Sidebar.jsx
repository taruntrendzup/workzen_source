import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  CheckSquare,
  BarChart3,
  Users,
  LogOut,
  Settings,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout, role } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (role === 'admin' || role === 'manager') {
      const fetchPending = async () => {
        try {
          const res = await api.get('/timesheets?status=pending');
          if (res.data.success) {
            setPendingCount(res.data.count || 0);
          }
        } catch {
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
      name: 'Account Settings',
      to: '/account',
      icon: Settings,
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
  const sections = [
    { title: 'Overview', paths: ['/dashboard'] },
    { title: 'Tasks', paths: ['/projects', '/timesheets', '/approvals'] },
    { title: 'Tools', paths: ['/reports', '/account'] },
    { title: 'Metrics', paths: ['/team'] },
  ];

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
        className={`crm-sidebar fixed top-0 bottom-0 left-0 z-50 flex w-[196px] shrink-0 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="crm-brand-row flex h-14 items-center justify-between border-b px-4">
          <Logo size="sm" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {sections.map((section) => {
            const items = filteredNavItems.filter((item) => section.paths.includes(item.to));
            if (!items.length) return null;
            return (
              <div key={section.title} className="mb-4">
                <p className="crm-sidebar-label px-2 py-1.5 text-[10px] font-semibold">{section.title}</p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `crm-nav-link flex items-center justify-between rounded-md px-2 py-2 text-[12px] font-medium transition-all ${
                            isActive ? 'font-semibold' : ''
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.name === 'Timesheets' ? 'Calendar & time' : item.name}</span>
                        </div>
                        {item.badge ? (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded bg-rose-500 px-1 text-[9px] font-bold text-white">
                            {item.badge}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-slate-100 p-3">
          <div className="crm-user-panel flex items-center gap-2 rounded-lg border p-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-900">
                {user?.name || 'Administrator'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center rounded px-1 py-0.5 text-[8px] font-semibold uppercase border ${getRoleBadgeStyle(
                    role
                  )}`}
                >
                  {role}
                </span>
                <span className="truncate text-[9px] text-slate-400">
                  {user?.department || 'Operations'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
