'use client';

import React from 'react';

import { Sidebar } from '../Sidebar';
import { TopBar } from '../TopBar';

interface AppLayoutProps {
  readonly children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="relative shrink-0">
        <TopBar />
      </div>
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:p-12 p-6 lg:ml-36 max-lg:ml-16 lg:mr-20 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
