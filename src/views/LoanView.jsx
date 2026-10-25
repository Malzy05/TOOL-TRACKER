'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { useApp } from '@/components/AppProvider';

const ITEMS_PER_PAGE = 15;

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

function generateEmptyState(msg) {
  return (
    <tr>
      <td colSpan="6">
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-500 fade-in">
          <svg className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          <p className="text-sm font-medium">{msg}</p>
        </div>
      </td>
    </tr>
  );
}

export default function LoanView({ user }) {
  const { showToast, openModal, closeModal } = useApp();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('On Loan');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const currentYear = new Date().getFullYear();
  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');

  const [filterYear, setFilterYear] = useState(currentYear.toString());
  const [filterMonth, setFilterMonth] = useState(currentMonthStr);
  
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const yearList = Array.from({ length: 19 }, (_, i) => 2022 + i).map(String);
  const monthList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [allLoans, setAllLoans] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formCat, setFormCat] = useState('');
  const [formToolId, setFormToolId] = useState('');

  const [staffName, setStaffName] = useState('');
  const [staffNo, setStaffNo] = useState('');
  const [dateLoan, setDateLoan] = useState('');

  useEffect(() => {
    // init date
    const d = new Date();
    const myt = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const currentDateTime = `${myt.getFullYear()}-${String(myt.getMonth() + 1).padStart(2, '0')}-${String(myt.getDate()).padStart(2, '0')}T${String(myt.getHours()).padStart(2, '0')}:${String(myt.getMinutes()).padStart(2, '0')}`;
    setDateLoan(currentDateTime);

    if (!isAdmin) {
      setStaffName(localStorage.getItem('tooltrack_name') || '');
      // fetch staff_no
      const fetchStaffNo = async () => {
        if (user?.email) {
          const data = await api.getStaffByEmail(user.email);
          if (data) setStaffNo(data.staff_no);
        }
      };
      fetchStaffNo();
    }
  }, [isAdmin, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tools = await api.getTools();
      setAvailableTools(tools || []);

      const loans = await api.getLoans();
      const sortedLoans = (loans || []).sort((a, b) => new Date(b.date_loan) - new Date(a.date_loan));

      const formattedLoans = sortedLoans.map(r => ({
        dbId: r.id,
        staffName: r.staff?.name || '-',
        staffNo: r.staff?.staff_no || '-',
        toolId: r.tools?.tool_id || '-',
        toolName: r.tools?.name || '-',
        status: r.status,
        dateLoan: r.date_loan,
        dateReturned: r.date_returned || '-'
      }));
      setAllLoans(formattedLoans);
    } catch (err) {
      console.error(err);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLoan({
        staff_no: isAdmin ? e.target.staffNo.value : staffNo,
        tool_id: formToolId,
        status: 'On Loan',
        date_loan: dateLoan + ':00+08:00'
      });

      await api.updateTool(formToolId, { status: 'On Loan' });
      showToast('Tool successfully loaned!', 'success');

      setFormCat('');
      setFormToolId('');
      fetchData();
    } catch (error) {
      showToast('Error saving record.', 'error');
    }
  };

  const markToolReturned = (dbId, toolId) => {
    const d = new Date();
    const myt = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const currentDateTime = `${myt.getFullYear()}-${String(myt.getMonth() + 1).padStart(2, '0')}-${String(myt.getDate()).padStart(2, '0')}T${String(myt.getHours()).padStart(2, '0')}:${String(myt.getMinutes()).padStart(2, '0')}`;

    let returnDate = currentDateTime;

    const content = (
      <div>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Return Date & Time</label>
        <input
          type="datetime-local"
          onChange={e => returnDate = e.target.value}
          defaultValue={currentDateTime}
          disabled={!isAdmin}
          className={`mt-1 w-full px-3 py-2 text-sm border rounded-lg dark:[color-scheme:dark] ${!isAdmin ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white'}`}
          autoComplete="off"
        />
      </div>
    );

    openModal('Return Tool', content, async () => {
      try {
        await api.updateLoan(dbId, {
          status: 'Returned',
          date_returned: returnDate + ':00+08:00'
        });

        const toolData = availableTools.find(t => t.tool_id === toolId);
        let newStatus = 'Serviceable';

        if (toolData && toolData.next_due) {
          const dueMs = new Date(toolData.next_due).getTime();
          const diffDays = Math.ceil((dueMs - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
          newStatus = diffDays < 0 ? 'Expired' : (diffDays <= 30 ? 'Due Soon' : 'Serviceable');
        }

        await api.updateTool(toolId, { status: newStatus });
        showToast('Tool successfully returned!', 'success');
        fetchData();
      } catch (err) {
        showToast('Error updating record', 'error');
      }
    });
  };

  const deleteLoanRecord = (dbId, toolId, status) => {
    openModal('Confirm Action', 'Delete this loan record from the database?', async () => {
      try {
        await api.deleteLoan(dbId);

        if (status === 'On Loan') {
          await api.updateTool(toolId, { status: 'Serviceable' });
        }
        showToast('Record successfully deleted.', 'success');
        fetchData();
      } catch (e) {
        showToast('Failed to delete record.', 'error');
      }
    }, 'Delete');
  };

  const filteredToolsForCat = useMemo(() => {
    if (!formCat) return [];
    return availableTools.filter(t => t.category === formCat && t.status !== 'On Loan');
  }, [availableTools, formCat]);

  const searchedLoans = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allLoans.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  }, [allLoans, searchQuery]);

  const tabLoans = useMemo(() => {
    let filtered = searchedLoans.filter(r => r.status === activeTab);
    if (activeTab === 'Returned') {
      if (filterYear !== 'All') {
        filtered = filtered.filter(r => r.dateReturned && r.dateReturned.startsWith(filterYear));
      }
      if (filterMonth !== 'All') {
        filtered = filtered.filter(r => r.dateReturned && r.dateReturned.substring(5, 7) === filterMonth);
      }
    }
    return filtered;
  }, [searchedLoans, activeTab, filterYear, filterMonth]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Tool Return History</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #334155; 
              background: #fff;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .header-titles h1 {
              font-size: 26px;
              color: #0f172a;
              margin: 0 0 6px 0;
              font-weight: 700;
              letter-spacing: -0.02em;
            }
            .header-titles p {
              margin: 0;
              color: #64748b;
              font-size: 14px;
              font-weight: 500;
            }
            .stats-bar {
              display: flex;
              gap: 30px;
              background: #f8fafc;
              padding: 14px 24px;
              border-radius: 10px;
              margin-bottom: 30px;
              font-size: 14px;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }
            .stats-bar strong {
              color: #0f172a;
              margin-right: 6px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 13px; 
            }
            th, td { 
              padding: 14px 16px; 
              text-align: left; 
              border-bottom: 1px solid #f1f5f9;
            }
            th { 
              background-color: #f8fafc; 
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.05em;
              border-bottom: 2px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px dashed #cbd5e1;
              font-size: 12px;
              color: #94a3b8;
              text-align: center;
            }
            .empty-state {
              text-align: center;
              padding: 40px;
              color: #94a3b8;
              font-style: italic;
            }
            @media print {
              @page { margin: 1cm; }
              body { padding: 0; }
              .header-container { padding-bottom: 15px; margin-bottom: 20px; }
              .stats-bar { box-shadow: none; border-color: #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-titles">
              <h1>Tool Return History</h1>
              <p>MYCAS Tool Tracking System</p>
            </div>
            <!-- Logo area -->
            <div>
              <img src="/logo.png" alt="MYCAS Logo" style="height: 80px; max-width: 300px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div style="display: none; font-weight: 700; color: #0284c7; font-size: 20px;">MYCAS</div>
            </div>
          </div>
          
          <div class="stats-bar">
            <div><strong>Year:</strong> ${filterYear}</div>
            <div><strong>Month:</strong> ${filterMonth !== 'All' ? monthNames[parseInt(filterMonth) - 1] : 'All'}</div>
            <div><strong>Total Records:</strong> ${tabLoans.length} tools</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Tool ID</th>
                <th>Tool Name</th>
                <th>Time Loan</th>
                <th>Time Returned</th>
              </tr>
            </thead>
            <tbody>
              ${tabLoans.length === 0 ? '<tr><td colspan="5" class="empty-state">No records found for this period.</td></tr>' : ''}
              ${tabLoans.map(r => `
                <tr>
                  <td style="font-weight: 600; color: #1e293b;">${r.staffName}</td>
                  <td style="font-family: monospace; color: #64748b; font-size: 12px;">${r.toolId}</td>
                  <td style="color: #334155;">${r.toolName}</td>
                  <td style="color: #475569;">${formatMYT(r.dateLoan)}</td>
                  <td style="color: #475569;">${formatMYT(r.dateReturned)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Printed on: ${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' })}
          </div>
          
          <script>
            window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const totalPages = Math.ceil(tabLoans.length / ITEMS_PER_PAGE);
  const paginatedData = tabLoans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const staffInputClass = "mt-1 w-full px-3 py-2 text-sm border rounded-lg " +
    (!isAdmin
      ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 cursor-not-allowed'
      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white');

  return (
    <div className="fade-in space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white">New Tool Loan</h3>
        </div>
        <form id="loanForm" onSubmit={handleLoanSubmit} autoComplete="off" className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Staff Name</label>
            <input required name="staffName" value={isAdmin ? staffName : (staffName || localStorage.getItem('tooltrack_name') || '')} onChange={e => setStaffName(e.target.value)} readOnly={!isAdmin} className={staffInputClass} /></div>
          <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Staff No.</label>
            <input required name="staffNo" value={staffNo} onChange={e => setStaffNo(e.target.value)} readOnly={!isAdmin} className={staffInputClass} /></div>

          <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tool Category</label>
            <select value={formCat} onChange={e => { setFormCat(e.target.value); setFormToolId(''); }} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white">
              <option value="">Select Category</option>
              <option value="CM">CM (Mechanical)</option><option value="CA">CA (Avionics)</option>
              <option value="Avionic">Avionic Tool</option><option value="General">General Tool</option>
              <option value="Special">Special Tool</option><option value="GSE">GSE</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Tool</label>
            <select required value={formToolId} onChange={e => setFormToolId(e.target.value)} name="toolId" className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white">
              {!formCat ? <option value=""></option> :
                filteredToolsForCat.length === 0 ? <option value="">No tools available (All on loan)</option> :
                  <>
                    <option value="">Select Tool ID</option>
                    {filteredToolsForCat.map(t => <option key={t.tool_id} value={t.tool_id}>{t.tool_id} - {t.name}</option>)}
                  </>}
            </select>
          </div>

          <div className="lg:col-span-2"><label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date & Time Loan</label>
            <input type="datetime-local" required name="dateLoan" value={dateLoan} onChange={e => setDateLoan(e.target.value)} disabled={!isAdmin} className={`mt-1 w-full px-3 py-2 text-sm border rounded-lg dark:[color-scheme:dark] ${!isAdmin ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-white'}`} /></div>

          <div className="lg:col-span-2 flex items-end"><button type="submit" className="btn-primary w-full py-2 text-sm font-semibold text-white rounded-lg shadow-sm">Loan Tool</button></div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={() => { setActiveTab('On Loan'); setCurrentPage(1); }} className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === 'On Loan' ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Active: On Loan</button>
          <button onClick={() => { setActiveTab('Returned'); setCurrentPage(1); }} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'Returned' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>History: Tool Return</button>
        </div>

        <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{tabLoans.length} records in {activeTab}</p>
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'Returned' && (
              <>
                <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsYearOpen(false); }}>
                  <button type="button" onClick={() => setIsYearOpen(!isYearOpen)} className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg w-32 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white cursor-pointer outline-none transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{filterYear === 'All' ? 'All Years' : filterYear}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isYearOpen && (
                    <div className="absolute left-0 top-full mt-1 w-32 max-h-52 overflow-y-auto scrollbar-thin bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
                      <button type="button" className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${filterYear === 'All' ? 'bg-sky-50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`} onClick={() => { setFilterYear('All'); setCurrentPage(1); setIsYearOpen(false); }}>All Years</button>
                      {yearList.map(y => (
                        <button key={y} type="button" className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${filterYear === y ? 'bg-sky-50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`} onClick={() => { setFilterYear(y); setCurrentPage(1); setIsYearOpen(false); }}>{y}</button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative" tabIndex={0} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsMonthOpen(false); }}>
                  <button type="button" onClick={() => setIsMonthOpen(!isMonthOpen)} className="flex items-center justify-between gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg w-36 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white cursor-pointer outline-none transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{filterMonth === 'All' ? 'All Months' : monthNames[parseInt(filterMonth) - 1]}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {isMonthOpen && (
                    <div className="absolute left-0 top-full mt-1 w-36 max-h-52 overflow-y-auto scrollbar-thin bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
                      <button type="button" className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${filterMonth === 'All' ? 'bg-sky-50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`} onClick={() => { setFilterMonth('All'); setCurrentPage(1); setIsMonthOpen(false); }}>All Months</button>
                      {monthList.map((m, i) => (
                        <button key={m} type="button" className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${filterMonth === m ? 'bg-sky-50 dark:bg-slate-700/50 text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`} onClick={() => { setFilterMonth(m); setCurrentPage(1); setIsMonthOpen(false); }}>{monthNames[i]}</button>
                      ))}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={handlePrint} className="px-3 py-2 text-sm font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition-colors flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print List
                  </button>
                )}
              </>
            )}
            <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} autoComplete="off" placeholder="Search records..." className="pl-3 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-56 dark:bg-slate-900 dark:border-slate-700 dark:text-white outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin" style={{ maxHeight: '500px' }}>
          <table className="w-full text-sm sticky whitespace-nowrap">
            <thead className="sticky top-0 z-10 text-left text-xs uppercase text-slate-500 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3 font-semibold">Staff Name</th><th className="px-5 py-3 font-semibold">Tool ID</th><th className="px-5 py-3 font-semibold">Tool Name</th><th className="px-5 py-3 font-semibold">Time Loan</th><th className="px-5 py-3 font-semibold">Time Returned</th><th className="px-5 py-3 font-semibold text-left pl-[28px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="6" className="text-center py-12"><div className="spinner mx-auto"></div></td></tr> :
                paginatedData.length === 0 ? generateEmptyState(`No tools ${activeTab.toLowerCase()}`) :
                  paginatedData.map(r => (
                    <tr key={r.dbId} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{r.staffName}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{r.toolId}</td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.toolName}</td>
                      <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">{formatMYT(r.dateLoan)}</td>
                      <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-300">{formatMYT(r.dateReturned)}</td>
                      <td className="px-5 py-3 text-left">
                        <div className="flex gap-2 justify-start items-center">
                          {activeTab === 'On Loan'
                            ? <button onClick={() => markToolReturned(r.dbId, r.toolId)} className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-md border border-emerald-200 transition-colors">Return Tool</button>
                            : <span className="badge bg-emerald-100 text-emerald-700">Returned</span>
                          }
                          {isAdmin && (
                            <button onClick={() => deleteLoanRecord(r.dbId, r.toolId, r.status)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Delete">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm transition-colors ${currentPage === p ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
