'use client';

import { useState, useEffect } from 'react';
import LoginView from '@/views/LoginView';
import DashboardLayout from '@/components/DashboardLayout';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('tooltrack_user');
      if (savedUser && savedUser !== 'undefined') {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      localStorage.removeItem('tooltrack_user');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  return <DashboardLayout user={user} onLogout={() => {
    localStorage.removeItem('tooltrack_user');
    localStorage.removeItem('tooltrack_name');
    setUser(null);
  }} />;
}
