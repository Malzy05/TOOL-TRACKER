'use client';

import { useState, useEffect } from 'react';

const pageTitles = {
  dashboard: ['Dashboard', 'Overview of MYCAS Tool Management System'],
  loan: ['Tool Loan & Return', 'Manage tool check-out and return activities'],
  cm: ['Calibrated Tool — Mechanical (CM)', 'Track mechanical calibrated tools'],
  ca: ['Calibrated Tool — Avionics (CA)', 'Track avionics calibrated tools'],
  avionic: ['Avionic Tool', 'Avionic tool inventory'],
  general: ['General Tool', 'General tool inventory'],
  special: ['Special Tools', 'Special tools by aircraft/component'],
  gse: ['Ground Support Equipment', 'GSE inventory and maintenance status'],
  staff: ['Staff Management', 'Manage staff accounts and roles'],
};

export default function Header({ currentPage, toggleSidebar }) {
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const today = new Date();
    setDateStr(today.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
  }, []);

  const [title, subtitle] = pageTitles[currentPage] || ['Page', ''];

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 lg:px-6 py-6 mt-2">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>
          </div>
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-lg whitespace-nowrap">
            {dateStr}
          </span>
        </div>
      </div>
    </header>
  );
}

