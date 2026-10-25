'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '@/services/api';
import { useApp } from '@/components/AppProvider';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function formatMYT(utcString) {
  if (!utcString) return '-';
  const d = new Date(utcString);
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  });
}

function statusBadge(status) {
  if (status === 'Serviceable') return `<span class="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Serviceable</span>`;
  if (status === 'Expired') return `<span class="badge bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">Expired</span>`;
  if (status === 'On Loan') return `<span class="badge bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400">On Loan</span>`;
  if (status === 'Returned') return `<span class="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Returned</span>`;
  if (status === 'Inactive') return `<span class="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Inactive</span>`;
  return `<span class="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">${status || '-'}</span>`;
}

// Komponen Pembantu Status Badge (React Version)
function StatusBadge({ status }) {
  if (status === 'Serviceable') return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Serviceable</span>;
  if (status === 'Expired') return <span className="badge bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">Expired</span>;
  if (status === 'On Loan') return <span className="badge bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400">On Loan</span>;
  if (status === 'Returned') return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Returned</span>;
  if (status === 'Inactive') return <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Inactive</span>;
  return <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{status || '-'}</span>;
}

export default function DashboardView({ user, onNavigate }) {
  const { showToast, openModal, closeModal } = useApp();
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [allLoansStat, setAllLoansStat] = useState([]);

  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [isCalYearOpen, setIsCalYearOpen] = useState(false);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await api.getDashboardStats();
        setTools(stats.allTools || []);
        setRecentLoans(stats.loans || []);
        setAllLoansStat(stats.allLoans || []);
      } catch (err) {
        console.error(err);
        showToast('Error loading dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [showToast]);

  const dashboardData = useMemo(() => {
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const data = { expired: [], d30: [], d60: [], d90: [] };

    tools.forEach(t => {
      if (!t.next_due) return;
      const dueMs = new Date(t.next_due).getTime();
      const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));

      if (t.status === 'Expired' || diffDays < 0) data.expired.push(t);
      else if (diffDays >= 0 && diffDays <= 30) data.d30.push(t);
      else if (diffDays > 30 && diffDays <= 60) data.d60.push(t);
      else if (diffDays > 60 && diffDays <= 90) data.d90.push(t);
    });
    return data;
  }, [tools]);

  const handleStatClick = (categoryKey, title) => {
    const data = dashboardData[categoryKey] || [];
    if (data.length === 0) return showToast('No tools in this category.', 'info');

    const navigateToTool = (tool) => {
      closeModal();
      localStorage.setItem('searchTool', tool.tool_id);
      if (onNavigate && tool.category) {
        onNavigate(tool.category.toLowerCase());
      }
    };

    const content = (
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 sticky top-0 bg-white dark:bg-slate-800 z-10">
            <tr>
              <th className="py-2">Tool ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map(t => (
              <tr key={t.tool_id} onClick={() => navigateToTool(t)} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <td className="py-3 px-2 font-mono text-xs text-slate-600 dark:text-slate-400">{t.tool_id}</td>
                <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{t.name}</td>
                <td className="py-3 px-2"><span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{t.category || '-'}</span></td>
                <td className="py-3 px-2 font-semibold text-right text-slate-700 dark:text-slate-300">{t.next_due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    openModal(title, content, null);
  };

  const handleDateClick = (dateStr, toolsDue) => {
    if (toolsDue.length === 0) return;
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const navigateToTool = (tool) => {
      closeModal();
      localStorage.setItem('searchTool', tool.tool_id);
      if (onNavigate && tool.category) {
        onNavigate(tool.category.toLowerCase());
      }
    };

    const content = (
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 sticky top-0 bg-white dark:bg-slate-800 z-10">
            <tr>
              <th className="py-2">Tool ID</th>
              <th className="py-2">Tool Name</th>
              <th className="py-2">Category</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {toolsDue.map(t => (
              <tr key={t.tool_id} onClick={() => navigateToTool(t)} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                <td className="py-3 px-2 font-mono text-xs text-slate-600 dark:text-slate-400">{t.tool_id}</td>
                <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{t.name}</td>
                <td className="py-3 px-2"><span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{t.category || '-'}</span></td>
                <td className="py-3 px-2 text-right"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    openModal(`Tools Due on ${formattedDate}`, content, null);
  };

  // Calendar render logic
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ type: 'empty', id: `empty-${i}` });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const toolsDue = tools.filter(t => t.next_due === dateStr);

      let isToday = dateStr === todayStr;
      let hasExpired = toolsDue.some(t => t.status === 'Expired' || new Date(t.next_due).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0));

      days.push({ type: 'day', day, dateStr, toolsDue, isToday, hasExpired });
    }
    return days;
  }, [calYear, calMonth, tools]);

  // Chart configs
  const borderColor = isDark ? '#1e293b' : '#ffffff';
  const donutOptions = { cutout: '75%', responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } };

  // Cal Chart Data
  const expiredCount = dashboardData.expired.length;
  const dueSoonCount = dashboardData.d30.length + dashboardData.d60.length;
  const serviceableCount = tools.length - expiredCount - dueSoonCount;

  const calChartData = {
    labels: ['Expired', 'Due Soon', 'Serviceable'],
    datasets: [{ data: [expiredCount, dueSoonCount, serviceableCount], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], borderColor, borderWidth: 2 }]
  };

  // Loan Chart Data
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(new Date().getFullYear());
  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  const currentMonthLoans = allLoansStat.filter(l => {
    if (!l.date_loan) return false;
    return l.date_loan.startsWith(`${currentYearStr}-${currentMonthStr}`);
  });

  const onLoanCount = currentMonthLoans.filter(l => l.status === 'On Loan').length;
  const returnedCount = currentMonthLoans.filter(l => l.status === 'Returned').length;

  const loanChartData = {
    labels: ['On Loan', 'Returned'],
    datasets: [{ data: [onLoanCount, returnedCount], backgroundColor: ['#0ea5e9', '#10b981'], borderColor, borderWidth: 2 }]
  };

  // Category Chart Data
  const catList = ['CM', 'CA', 'Avionic', 'General', 'Special', 'GSE'];
  const catCounts = catList.map(c => tools.filter(t => t.category === c).length);
  const categoryChartData = {
    labels: catList,
    datasets: [{ data: catCounts, backgroundColor: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'], borderColor, borderWidth: 2 }]
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="spinner"></div></div>;
  }

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="fade-in space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" id="statCardsHorizontal">
        <button onClick={() => handleStatClick('expired', 'Expired Tools')} className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl transition-colors text-left group shadow-sm hover:scale-[1.02]">
          <div><p className="text-xs font-semibold text-red-500 uppercase">Expired</p><p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">{dashboardData.expired.length}</p></div>
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white transition-colors">›</div>
        </button>
        <button onClick={() => handleStatClick('d30', 'Due in < 30 Days')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left group shadow-sm hover:scale-[1.02]">
          <div><p className="text-xs font-semibold text-orange-500 uppercase">&lt; 30 Days</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 group-hover:text-orange-600">{dashboardData.d30.length}</p></div>
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">›</div>
        </button>
        <button onClick={() => handleStatClick('d60', 'Due in < 60 Days')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left group shadow-sm hover:scale-[1.02]">
          <div><p className="text-xs font-semibold text-amber-500 uppercase">&lt; 60 Days</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 group-hover:text-amber-600">{dashboardData.d60.length}</p></div>
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">›</div>
        </button>
        <button onClick={() => handleStatClick('d90', 'Due in < 90 Days')} className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-yellow-200 dark:border-yellow-900/50 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left group shadow-sm hover:scale-[1.02]">
          <div><p className="text-xs font-semibold text-yellow-500 uppercase">&lt; 90 Days</p><p className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5 group-hover:text-yellow-600">{dashboardData.d90.length}</p></div>
          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">›</div>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        <div className="xl:col-span-1 space-y-4">

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">Calibration Overview</h3>
            <div className="relative w-full flex justify-center" style={{ maxHeight: '150px' }}>
              <Doughnut data={calChartData} options={donutOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">Loan Status: {currentMonthName}</h3>
            <div className="relative w-full flex justify-center" style={{ maxHeight: '150px' }}>
              <Doughnut data={loanChartData} options={donutOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2 text-sm">Tool Distribution</h3>
            <div className="relative w-full flex justify-center" style={{ maxHeight: '150px' }}>
              <Doughnut data={categoryChartData} options={donutOptions} />
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl w-full text-center mt-4 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tools</p>
              <p className="text-2xl font-bold text-slate-700 dark:text-white mt-1">{tools.length}</p>
            </div>
          </div>

        </div>

        <div className="space-y-6 xl:col-span-3">

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white">Recent Loan Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="text-left text-xs uppercase text-slate-500 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Staff</th>
                    <th className="px-5 py-3 font-semibold">Tool</th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                    <th className="px-5 py-3 font-semibold">Date Loan</th>
                    <th className="px-5 py-3 font-semibold">Date Return</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4 text-slate-500">No activity.</td></tr>
                  ) : (
                    recentLoans.map((l, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{l.staff?.name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{l.tools?.name || 'Unknown'}</td>
                        <td className="px-5 py-3 text-center"><StatusBadge status={l.status} /></td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-medium">{formatMYT(l.date_loan)}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300 font-medium">{l.date_returned ? formatMYT(l.date_returned) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Calendar</h3>
                <p className="text-xs text-slate-500">Track equipment due dates</p>
              </div>

              <div className="flex items-center gap-4 px-4 py-2 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 shadow-sm">
                <button onClick={() => {
                  let m = calMonth - 1;
                  let y = calYear;
                  if (m < 0) { m = 11; y--; }
                  setCalMonth(m); setCalYear(y);
                }} className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider w-12 text-center text-sm">{months[calMonth]}</span>
                <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsCalYearOpen(false); }}>
                  <button type="button" onClick={() => setIsCalYearOpen(!isCalYearOpen)} className="font-bold bg-transparent border-none text-slate-800 dark:text-white rounded-lg pl-3 pr-8 py-1 cursor-pointer outline-none shadow-sm text-sm relative w-full text-left">
                    {calYear}
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {isCalYearOpen && (
                    <div className="absolute right-0 top-full mt-1 w-24 max-h-52 overflow-y-auto scrollbar-thin bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 font-normal">
                      {Array.from({ length: 19 }, (_, i) => 2022 + i).map(y => (
                        <button key={y} type="button" className={`w-full text-center px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${calYear === y ? 'bg-sky-50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'}`} onClick={() => { setCalYear(y); setIsCalYearOpen(false); }}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => {
                  let m = calMonth + 1;
                  let y = calYear;
                  if (m > 11) { m = 0; y++; }
                  setCalMonth(m); setCalYear(y);
                }} className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((d, i) => {
                if (d.type === 'empty') return <div key={d.id} className="p-2 bg-transparent rounded-lg"></div>;

                let bgClass = 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300';
                let borderClass = 'border border-slate-50 dark:border-slate-700 shadow-sm';
                let indicator = null;

                if (d.isToday) {
                  borderClass = 'border border-emerald-500 shadow-sm';
                  bgClass = 'bg-white dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold';
                }

                if (d.toolsDue.length > 0) {
                  bgClass = d.hasExpired ? 'bg-[#ef4444] text-white font-bold hover:bg-red-600' : 'bg-amber-400 text-slate-900 font-bold hover:bg-amber-500';
                  borderClass = 'border-none';
                  indicator = <span className={`block text-[9px] ${d.hasExpired ? 'bg-red-700' : 'bg-amber-600 text-white'} px-1 rounded mt-0.5 shadow-sm`}>{d.toolsDue.length} Tool</span>;
                  bgClass += ' hover:scale-105 hover:z-10 cursor-pointer shadow-md';
                } else {
                  bgClass += ' cursor-default';
                }

                return (
                  <div key={d.dateStr} onClick={() => handleDateClick(d.dateStr, d.toolsDue)} className={`p-2 ${bgClass} ${borderClass} rounded-lg flex flex-col items-center justify-between min-h-[50px] transition-all duration-200 overflow-hidden`}>
                    <span>{d.day}</span>
                    {indicator}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

}

