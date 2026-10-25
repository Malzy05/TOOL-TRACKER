'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { useApp } from '@/components/AppProvider';

const ITEMS_PER_PAGE = 15;

const dbCategoryMap = {
  cm: 'CM',
  ca: 'CA',
  avionic: 'Avionic',
  general: 'General',
  special: 'Special',
  gse: 'GSE',
};

const pageTitles = {
  cm: ['Calibrated Tool — Mechanical (CM)', 'Track mechanical calibrated tools'],
  ca: ['Calibrated Tool — Avionics (CA)', 'Track avionics calibrated tools'],
  avionic: ['Avionic Tool', 'Avionic tool inventory'],
  general: ['General Tool', 'General tool inventory'],
  special: ['Special Tools', 'Special tools by aircraft/component'],
  gse: ['Ground Support Equipment', 'GSE inventory and maintenance status'],
};

function statusBadge(status) {
  if (status === 'Serviceable') return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Serviceable</span>;
  if (status === 'Expired') return <span className="badge bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">Expired</span>;
  if (status === 'On Loan') return <span className="badge bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400">On Loan</span>;
  if (status === 'Returned') return <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Returned</span>;
  if (status === 'Inactive') return <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">Inactive</span>;
  return <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{status || '-'}</span>;
}

function dueCell(d) {
  if (!d) return <span className="text-slate-600 dark:text-slate-400">-</span>;
  const today = new Date().setHours(0, 0, 0, 0);
  const diff = Math.ceil((new Date(d).getTime() - today) / (1000 * 60 * 60 * 24));
  let cls = 'text-slate-600 dark:text-slate-400';
  let badge = null;
  if (diff < 0) { cls = 'text-red-600 font-semibold'; badge = <span className="badge bg-red-100 text-red-700 ml-2">Expired</span>; }
  else if (diff <= 30) { cls = 'text-orange-600 font-semibold'; badge = <span className="badge bg-orange-100 text-orange-700 ml-2">&lt;30d</span>; }
  else if (diff <= 60) { cls = 'text-amber-600'; badge = <span className="badge bg-amber-100 text-amber-700 ml-2">&lt;60d</span>; }
  else if (diff <= 90) { badge = <span className="badge bg-yellow-100 text-yellow-700 ml-2">&lt;90d</span>; }
  return <><span className={cls}>{d}</span>{badge}</>;
}

export default function ToolTableView({ category, user }) {
  const { showToast, openModal, closeModal } = useApp();
  const isAdmin = user?.role === 'admin';
  const dbCat = dbCategoryMap[category];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getTools(dbCat);
      const mapped = res.map(r => ({
        id: r.tool_id, name: r.name, model: r.model || '-', serial: r.serial_no || '-',
        lastCheck: r.last_check || '-', nextDue: r.next_due, certNo: r.cert_no || '-',
        location: r.location || '-', centre: r.centre || '-', remarks: r.remarks || '-',
        aircraft: r.aircraft || '-', partNo: r.part_no || '-', status: r.status || '-',
        category: r.category
      }));
      setData(mapped);
    } catch (err) {
      showToast('Error loading table data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedSearch = localStorage.getItem('searchTool');
    if (savedSearch) {
      setSearchQuery(savedSearch);
      localStorage.removeItem('searchTool');
    } else {
      setSearchQuery('');
    }
    setCurrentPage(1);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const config = {
    cm: {
      headers: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Next Due', 'Location', 'Remarks'],
      row: r => <><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.model}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.serial}</td><td className="px-4 py-3">{dueCell(r.nextDue)}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.remarks}</td></>
    },
    ca: {
      headers: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Next Due', 'Location', 'Remarks'],
      row: r => <><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.model}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.serial}</td><td className="px-4 py-3">{dueCell(r.nextDue)}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.remarks}</td></>
    },
    avionic: {
      headers: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Category', 'Location', 'Remarks'],
      row: r => <><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.model}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.serial}</td><td className="px-4 py-3"><span className="badge bg-violet-100 text-violet-700">{r.category}</span></td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.remarks}</td></>
    },
    general: {
      headers: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Location', 'Remarks'],
      row: r => <><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.model}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.serial}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.remarks}</td></>
    },
    special: {
      headers: ['Aircraft / Component', 'Tool ID', 'Tool Name', 'Part No.', 'Location'],
      row: r => <><td className="px-4 py-3"><span className="badge bg-sky-100 text-sky-700">{r.aircraft}</span></td><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.partNo}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td></>
    },
    gse: {
      headers: ['Tool ID', 'GSE Name', 'Model', 'Serial No.', 'Last Check', 'Next Due', 'Status', 'Location'],
      row: r => <><td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{r.id}</td><td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.name}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.model}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{r.serial}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.lastCheck}</td><td className="px-4 py-3">{dueCell(r.nextDue)}</td><td className="px-4 py-3">{statusBadge(r.status)}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.location}</td></>
    }
  };

  const currConfig = config[category];

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
  }, [data, searchQuery]);

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const viewTool = (id) => {
    const tool = data.find(t => t.id === id);
    if (!tool) return;
    const content = (
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(tool).map(([k, v]) => {
          if (v === '-' || v === null || k === 'category' || v === undefined) return null;
          return (
            <div key={k} className="mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
              <p className="font-medium text-sm text-slate-800 dark:text-slate-200 mt-0.5">{v}</p>
            </div>
          );
        })}
      </div>
    );
    openModal(`Tool Information: ${id}`, content, null);
  };

  const addTool = () => {
    const fields = {
      cm: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Last Check', 'Next Due', 'Certificate No.', 'Location', 'Calibration Centre', 'Remarks'],
      ca: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Last Check', 'Next Due', 'Certificate No.', 'Location', 'Calibration Centre', 'Remarks'],
      avionic: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Location', 'Remarks'],
      general: ['Tool ID', 'Tool Name', 'Model', 'Serial No.', 'Location', 'Remarks'],
      special: ['Aircraft', 'Tool ID', 'Tool Name', 'Part No.', 'Location'],
      gse: ['Tool ID', 'GSE Name', 'Model', 'Serial No.', 'Last Check', 'Next Due', 'Location']
    };
    const dbMap = { 'Tool ID': 'tool_id', 'Tool Name': 'name', 'GSE Name': 'name', 'Model': 'model', 'Serial No.': 'serial_no', 'Last Check': 'last_check', 'Next Due': 'next_due', 'Certificate No.': 'cert_no', 'Location': 'location', 'Calibration Centre': 'centre', 'Remarks': 'remarks', 'Aircraft': 'aircraft', 'Part No.': 'part_no' };
    const fs = fields[category];

    const values = {};

    const content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fs.map(f => {
          const colName = dbMap[f];
          const isDate = f.includes('Check') || f.includes('Due');
          return (
            <div key={f}>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{f}</label>
              <input type={isDate ? 'date' : 'text'} onChange={e => values[colName] = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:[color-scheme:dark]" autoComplete="off" />
            </div>
          );
        })}
      </div>
    );

    openModal(`Add New Tool (${dbCat})`, content, async () => {
      const insertData = { category: dbCat, ...values };
      if (insertData.next_due) {
        const dueMs = new Date(insertData.next_due).getTime();
        const diffDays = Math.ceil((dueMs - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
        insertData.status = diffDays < 0 ? 'Expired' : (diffDays <= 30 ? 'Due Soon' : 'Serviceable');
      } else { insertData.status = 'Serviceable'; }

      try {
        await api.createTool(insertData);
        showToast('Tool recorded!', 'success');
        fetchData();
      } catch (err) {
        showToast('Failed: Tool ID already exists.', 'error');
      }
    }, 'Save');
  };

  const editTool = (id) => {
    const tool = data.find(t => t.id === id);
    if (!tool) return;
    const dbMapRev = { name: 'name', model: 'model', serial: 'serial_no', lastCheck: 'last_check', nextDue: 'next_due', certNo: 'cert_no', location: 'location', centre: 'centre', remarks: 'remarks', aircraft: 'aircraft', partNo: 'part_no' };

    const values = {};
    const content = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(tool).map(k => {
          if (['id', 'category', 'status'].includes(k)) return null;
          if (tool[k] !== undefined && tool[k] !== '-') {
            const dbCol = dbMapRev[k] || k;
            values[dbCol] = tool[k];
            const isDate = k.toLowerCase().includes('check') || k.toLowerCase().includes('due');
            return (
              <div key={k}>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input type={isDate ? 'date' : 'text'} defaultValue={tool[k]} onChange={e => values[dbCol] = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:[color-scheme:dark]" autoComplete="off" />
              </div>
            );
          }
          return null;
        })}
      </div>
    );

    openModal(`Edit Tool: ${id}`, content, async () => {
      const updateData = { ...values };
      if (updateData.next_due) {
        const dueMs = new Date(updateData.next_due).getTime();
        const diffDays = Math.ceil((dueMs - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
        updateData.status = diffDays < 0 ? 'Expired' : (diffDays <= 30 ? 'Due Soon' : 'Serviceable');
      }

      try {
        await api.updateTool(id, updateData);
        showToast('Updated!', 'success');
        fetchData();
      } catch (e) {
        showToast('Failed to update.', 'error');
      }
    }, 'Confirm');
  };

  const deleteTool = (id) => {
    openModal('Delete', `Delete tool ${id} from database?`, async () => {
      try {
        await api.deleteTool(id);
        showToast('Tool deleted.', 'success');
        fetchData();
      } catch (error) {
        showToast('Failed to delete. Tool might be on loan.', 'error');
      }
    }, 'Delete');
  };

  return (
    <div className="fade-in bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">{pageTitles[category]?.[0] || 'Tool Category'}</h3>
          <p className="text-xs text-slate-500" id="tableItemCount">{filteredData.length} items {searchQuery ? 'found' : 'total'}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} autoComplete="off" placeholder="Search..." className="pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg w-56 dark:bg-slate-900 dark:text-white" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          {isAdmin && (
            <button onClick={addTool} className="btn-primary px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Tool
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin" style={{ maxHeight: '520px' }}>
        <table className="w-full text-sm sticky whitespace-nowrap">
          <thead className="sticky top-0 z-10 text-left text-xs uppercase text-slate-500 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {currConfig.headers.map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={currConfig.headers.length + 1} className="text-center py-12"><div className="spinner mx-auto"></div></td></tr> :
              paginatedData.length === 0 ?
                <tr>
                  <td colSpan={currConfig.headers.length + 1}>
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400 dark:text-slate-500 fade-in">
                      <svg className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                      </svg>
                      <p className="text-sm font-medium">No records match your search</p>
                    </div>
                  </td>
                </tr> :
                paginatedData.map(r => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    {currConfig.row(r)}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => viewTool(r.id)} className="p-1.5 rounded-md hover:bg-sky-50 text-sky-600" title="View"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button>
                        {isAdmin && (
                          <>
                            <button onClick={() => editTool(r.id)} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                            <button onClick={() => deleteTool(r.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" /></svg></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between text-sm gap-4">
          <p className="text-slate-500">Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 rounded-md ${p === currentPage ? 'bg-sky-500 text-white' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
