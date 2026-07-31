import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import Header from '@/components/shared/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white relative p-6">
          <div className="absolute inset-0 pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
