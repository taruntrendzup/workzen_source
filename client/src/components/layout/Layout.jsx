import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TimesheetModal } from '../modals/TimesheetModal';

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Navbar
          setMobileOpen={setMobileOpen}
          onOpenLogModal={() => setLogModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openLogModal: () => setLogModalOpen(true) }} />
        </main>
      </div>

      {/* Global Quick Log Hours Modal */}
      <TimesheetModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onSuccess={() => {
          // Trigger a window event so current page refetches its data
          window.dispatchEvent(new Event('workzen_refresh_data'));
        }}
      />
    </div>
  );
};
