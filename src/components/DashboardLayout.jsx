'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from '../views/DashboardView';
import ToolTableView from '../views/ToolTableView';
import LoanView from '../views/LoanView';
import StaffView from '../views/StaffView';

export default function DashboardLayout({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardView user={user} onNavigate={setCurrentPage} />;
      case 'loan': return <LoanView user={user} />;
      case 'staff': return <StaffView user={user} />;
      case 'cm': 
      case 'ca':
      case 'avionic':
      case 'general':
      case 'special':
      case 'gse':
        return <ToolTableView category={currentPage} user={user} />;
      default: return <DashboardView user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
        />
      )}

      <Sidebar 
        user={user} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        onLogout={onLogout}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col min-h-screen transition-all duration-300">
        <Header 
          currentPage={currentPage}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="p-4 lg:p-6 flex-1 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

