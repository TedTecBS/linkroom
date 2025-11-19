import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardNav } from '../DashboardNav';
import { Sidebar } from '../Sidebar';

/**
 * Dashboard layout for authenticated users (job seekers, employers, admins)
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
