import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Plus, CheckCircle2, AlertCircle, Clock, Check, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Navbar = ({ setMobileOpen, onOpenLogModal }) => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  return (
    <header className="crm-topbar sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b px-4 sm:px-8">
      {/* Left side: Hamburger (mobile) + Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div>
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">Workzen / Workspace</p>
          <h1 className="font-display text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {role === 'admin'
              ? 'Administrator Overview • Enterprise Monitoring'
              : role === 'manager'
              ? 'Team Productivity • Timesheet Approvals'
              : 'Daily Timesheet • Project Tracking'}
          </p>
        </div>
      </div>

      {/* Right side: Quick Log Time + Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Log Hours Button */}
        <button
          onClick={onOpenLogModal}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Log Hours</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`py-3 px-1 transition-colors ${
                        !n.read ? 'bg-teal-50/50 -mx-1 px-2 rounded-lg' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'approval' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        ) : n.type === 'rejection' ? (
                          <AlertCircle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <Link
            to="/account"
            aria-label="Open account settings"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 ring-2 ring-white shadow-sm hover:shadow-md"
          >
            {user?.name?.charAt(0) || 'U'}
            <ArrowUpRight className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-teal-700 opacity-0 shadow transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </header>
  );
};
