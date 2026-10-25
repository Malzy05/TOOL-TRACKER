'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';

const navStructure = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'loan', label: 'Tool Loan & Return', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    {
      key: 'tool-category', label: 'Tool Category', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
      children: [
        { key: 'cm', label: 'Calibrated Tool (CM)' },
        { key: 'ca', label: 'Calibrated Tool (CA)' },
        { key: 'avionic', label: 'Avionic Tool' },
        { key: 'general', label: 'General Tool' },
        { key: 'special', label: 'Special Tools' },
        { key: 'gse', label: 'Ground Support Equipment' },
      ]
    },
    { key: 'staff', label: 'Staff Management', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
  ],
  maintenance: [
    { key: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { key: 'loan', label: 'Tool Loan & Return', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    {
      key: 'tool-category', label: 'Tool Category', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
      children: [
        { key: 'cm', label: 'Calibrated Tool (CM)' },
        { key: 'ca', label: 'Calibrated Tool (CA)' },
        { key: 'avionic', label: 'Avionic Tool' },
        { key: 'general', label: 'General Tool' },
        { key: 'special', label: 'Special Tools' },
        { key: 'gse', label: 'Ground Support Equipment' },
      ]
    }
  ]
};

export default function Sidebar({ user, currentPage, setCurrentPage, isOpen, onLogout, isDarkMode, toggleDarkMode, closeSidebar }) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [hasFaceId, setHasFaceId] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const items = navStructure[user?.role] || navStructure['maintenance'];

  useEffect(() => {
    // Check if Face ID was already registered on this specific device
    if (typeof window !== 'undefined') {
      setHasFaceId(localStorage.getItem('tooltrack_face_id_ready') === 'true');
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleDeleteFaceId = async () => {
    try {
      if (supabase.auth.passkey && supabase.auth.passkey.list) {
        const { data: passkeys } = await supabase.auth.passkey.list();
        if (passkeys && passkeys.length > 0) {
          for (const pk of passkeys) {
            await supabase.auth.passkey.delete({ passkeyId: pk.id });
          }
        }
      }
      localStorage.removeItem('tooltrack_face_id_ready');
      setHasFaceId(false);
      showToast('Face Id or Biometric deleted successfully from this device.');
    } catch (err) {
      console.error('Error removing passkey:', err);
      localStorage.removeItem('tooltrack_face_id_ready');
      setHasFaceId(false);
      showToast('Face Id or Biometric deleted from this device locally.');
    }
  };

  const handleNavClick = (key) => {
    setCurrentPage(key);
    if (window.innerWidth < 1024) closeSidebar();
  };

  return (
    <aside className={`w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30 shadow-2xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300`}>
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-[#ffffff] w-full py-3 px-4 rounded-xl flex justify-center items-center shadow-lg">
            <img src="/logo.png" alt="MYCAS Logo" className="h-16 w-auto object-contain" />
          </div>
          <div className="w-full mt-2 flex justify-between items-center text-white font-bold text-[15px] uppercase px-0.5">
            <span>T</span><span>O</span><span>O</span><span>L</span>
            <span className="w-3"></span>
            <span>T</span><span>R</span><span>A</span><span>C</span><span>K</span><span>I</span><span>N</span><span>G</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-4 space-y-1">
        {items.map((item) => {
          if (item.children) {
            return (
              <div key={item.key} className="mb-4">
                <div className="flex items-center gap-3 px-5 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <svg className="icon w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  <span>{item.label}</span>
                </div>
                <div className="space-y-1 mt-1">
                  {item.children.map(c => {
                    const active = currentPage === c.key;
                    return (
                      <button key={c.key} onClick={() => handleNavClick(c.key)}
                        className={`w-full ${active ? 'bg-sky-500/20 text-sky-400 font-semibold border-r-2 border-sky-400' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'} flex items-center gap-3 px-5 py-2.5 text-sm transition-colors`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-slate-400'}`}></span>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          const active = currentPage === item.key;
          return (
            <div key={item.key} className="mb-2">
              <button onClick={() => handleNavClick(item.key)}
                className={`w-full ${active ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-200 hover:bg-slate-700/50 hover:text-white'} flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all`}>
                <svg className="icon w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                <span>{item.label}</span>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 flex flex-col gap-3 bg-[#0f172a]">
        <button onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50">
          <span className="text-sm font-medium transition-all duration-300 ease-in-out">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className="transition-all duration-300 ease-in-out transform">
            {isDarkMode ?
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> :
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            }
          </div>
        </button>

        <button onClick={async () => {
          if (hasFaceId) {
            setShowConfirm(true);
            return;
          }

          try {
            const { error } = await supabase.auth.registerPasskey();
            if (error) throw error;
            localStorage.setItem('tooltrack_face_id_ready', 'true');
            setHasFaceId(true);
            showToast('Face Id or Biometrics registered successfully!');
          } catch (err) {
            console.error(err);
            showToast('Failed to register: ' + err.message, 'error');
          }
        }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors border mb-1 ${hasFaceId ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border-sky-500/20'}`}>
          <span className="text-sm font-medium transition-all duration-300 ease-in-out">
            {hasFaceId ? 'Face Id/Biometrics Registered' : 'Register Face Id/Biometrics'}
          </span>
          {hasFaceId ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
          )}
        </button>

        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
          <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
            <p className="text-[11px] text-slate-400 truncate uppercase">{user?.role || 'Administrator'}</p>
          </div>
          <button onClick={onLogout}
            className="p-1.5 rounded-md text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {showConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100 transition-transform">
            <h3 className="text-lg font-bold text-white mb-2">Delete Face Id or Biometrics?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to delete Face Id or Biometrics for this device? You need to register again if you want to use it again.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleDeleteFaceId();
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Beautiful Toast Notification */}
      {toast.show && typeof document !== 'undefined' && createPortal(
        <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] px-5 py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center gap-3 transform transition-all duration-300 fade-in ${toast.type === 'success' ? 'bg-emerald-600/95 backdrop-blur border border-emerald-500/50 text-white' : 'bg-red-600/95 backdrop-blur border border-red-500/50 text-white'}`}>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          )}
          <span className="font-semibold text-sm drop-shadow-md">{toast.message}</span>
        </div>,
        document.body
      )}
    </aside>
  );
}

