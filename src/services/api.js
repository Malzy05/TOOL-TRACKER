import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const getHeaders = async (additionalHeaders = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { ...additionalHeaders };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
};

export const api = {
  // Tools
  getTools: async (category = '') => {
    const url = category ? `${API_BASE_URL}/tools?category=${encodeURIComponent(category)}` : `${API_BASE_URL}/tools`;
    const res = await fetch(url, { headers: await getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tools');
    return res.json();
  },
  createTool: async (data) => {
    const res = await fetch(`${API_BASE_URL}/tools`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create tool');
    return res.json();
  },
  updateTool: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'PUT',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update tool');
    return res.json();
  },
  deleteTool: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete tool');
    return res.json();
  },

  // Staff
  getStaff: async () => {
    const res = await fetch(`${API_BASE_URL}/staff`, { headers: await getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch staff');
    return res.json();
  },
  getStaffByEmail: async (email) => {
    const res = await fetch(`${API_BASE_URL}/staff/email/${encodeURIComponent(email)}`, { headers: await getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch staff by email');
    return res.json();
  },
  createStaff: async (data) => {
    const res = await fetch(`${API_BASE_URL}/staff`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create staff');
    return res.json();
  },
  updateStaff: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'PUT',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update staff');
    return res.json();
  },
  deleteStaff: async (id) => {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete staff');
    return res.json();
  },

  // Loans
  getLoans: async () => {
    const res = await fetch(`${API_BASE_URL}/loans`, { headers: await getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch loans');
    return res.json();
  },
  createLoan: async (data) => {
    const res = await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create loan');
    return res.json();
  },
  updateLoan: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'PUT',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update loan');
    return res.json();
  },
  deleteLoan: async (id) => {
    const res = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete loan');
    return res.json();
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard-stats`, { headers: await getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }
};
