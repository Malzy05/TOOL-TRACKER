'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { useApp } from '@/components/AppProvider';

const ITEMS_PER_PAGE = 15;

function generateEmptyState(msg) {
  return (
    <tr>
      <td colSpan="5">
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

export default function StaffView() {
  const { showToast, openModal, closeModal } = useApp();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.getStaff();
      const mapped = res.map(s => ({
        name: s.name,
        no: s.staff_no,
        email: s.email,
        role: s.role
      }));
      setData(mapped);
    } catch (err) {
      showToast('Failed to load staff data from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return data.filter(s => Object.values(s).some(v => String(v).toLowerCase().includes(q)));
  }, [data, searchQuery]);

  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const addStaff = () => {
    const values = { name: '', no: '', email: '', role: 'Maintenance' };

    const content = (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</label>
          <input onChange={e => values.name = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white" placeholder="John Doe" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Staff No.</label>
          <input onChange={e => values.no = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white" placeholder="ST010" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</label>
          <input type="email" onChange={e => values.email = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white" placeholder="john@tooltrack.com" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Role</label>
          <select onChange={e => values.role = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white">
            <option>Maintenance</option>
            <option>Admin</option>
          </select>
        </div>
      </div>
    );

    openModal('Add New Staff', content, async () => {
      if (!values.name || !values.no || !values.email) {
        showToast('Please fill in all details.', 'warn');
        return;
      }

      try {
        await api.createStaff({ name: values.name, staff_no: values.no, email: values.email, role: values.role });
        showToast('New staff successfully recorded!', 'success');
        fetchStaff();
      } catch (err) {
        showToast('Failed to register staff.', 'error');
      }
    }, 'Saving...');
  };

  const editStaff = (no) => {
    const staff = data.find(s => s.no === no);
    if (!staff) return;

    const values = { name: staff.name, email: staff.email, role: staff.role };

    const content = (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</label>
          <input defaultValue={staff.name} onChange={e => values.name = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email</label>
          <input type="email" defaultValue={staff.email} onChange={e => values.email = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white" autoComplete="off" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Role</label>
          <select defaultValue={staff.role} onChange={e => values.role = e.target.value} className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-900 rounded-lg dark:text-white">
            <option>Maintenance</option>
            <option>Admin</option>
          </select>
        </div>
      </div>
    );

    openModal(`Edit Staff: ${no}`, content, async () => {
      try {
        await api.updateStaff(no, { name: values.name, email: values.email, role: values.role });
        showToast('Update successful!', 'success');
        fetchStaff();
      } catch (e) {
        showToast('Failed to update staff record.', 'error');
      }
    }, 'Confirm');
  };

  const deleteStaff = (no) => {
    openModal('Confirm Delete', `Delete staff with No: ${no} from the database?`, async () => {
      try {
        await api.deleteStaff(no);
        showToast('Staff record deleted.', 'success');
        fetchStaff();
      } catch (error) {
        showToast('Failed to delete.', 'error');
      }
    }, 'Delete');
  };

  return (
    <div className="fade-in bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Staff Directory</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400" id="staffItemCount">{loading ? 'Loading staff...' : `${filteredData.length} staff found`}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} autoComplete="off" placeholder="Search staff..." className="pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg w-56 dark:bg-slate-900 dark:text-white" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <button onClick={addStaff} className="btn-primary px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Staff
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm sticky whitespace-nowrap">
          <thead className="sticky top-0 z-10 text-left text-xs uppercase text-slate-500 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-5 py-3 font-semibold">Staff Name</th><th className="px-5 py-3 font-semibold">Staff No.</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="text-center py-4 text-slate-500">Loading data...</td></tr> :
              paginatedData.length === 0 ? generateEmptyState('No staff found') :
                paginatedData.map(s => (
                  <tr key={s.no} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-xs">
                          {s.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{s.no}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.email}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${s.role.trim().toLowerCase() === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.role}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => editStaff(s.no)} className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                        <button onClick={() => deleteStaff(s.no)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-1 text-sm">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 rounded-md ${p === currentPage ? 'bg-sky-500 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-3 py-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}>›</button>
        </div>
      )}
    </div>
  );
}

