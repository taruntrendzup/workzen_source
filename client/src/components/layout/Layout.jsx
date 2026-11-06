import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { TimesheetModal } from '../modals/TimesheetModal';

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="crm-app-shell mx-auto flex h-screen w-full overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Navbar
          setMobileOpen={setMobileOpen}
          onOpenLogModal={() => setLogModalOpen(true)}
        />

        <main className="crm-main mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-5 lg:p-6">
          <div key={location.pathname} className="crm-page">
            <Outlet context={{ openLogModal: () => setLogModalOpen(true) }} />
          </div>
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
