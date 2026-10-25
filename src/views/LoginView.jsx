'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('name, role, email')
        .eq('email', email)
        .maybeSingle();

      if (staffError) throw staffError;

      if (staffData) {
        const userRole = staffData.role.trim().toLowerCase();
        const user = { email: staffData.email, role: userRole, name: staffData.name };

        localStorage.setItem('tooltrack_user', JSON.stringify(user));
        localStorage.setItem('tooltrack_name', staffData.name);

        onLoginSuccess(user);
      } else {
        setErrorMsg('Account verified, but staff profile not found.');
      }
    } catch (error) {
      setErrorMsg('Access Denied: Invalid Email or Password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 50%, #4c1d95 100%)' }}>
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #38bdf8 0%, transparent 40%), radial-gradient(circle at 80% 70%, #a855f7 0%, transparent 40%)' }}>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tool Tracking</h1>
          <p className="text-sky-200 text-sm mt-1">Mycopter Aviation Services Sdn. Bhd.</p>
        </div>

        <div className="glass rounded-2xl shadow-2xl p-8 fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome</h2>
          <p className="text-slate-500 text-sm mb-6">Please sign in to your account</p>

          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMsg}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
                  placeholder="you@company.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm"
                  placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary text-white font-semibold py-2.5 rounded-lg mt-4 disabled:opacity-50">
              {loading ? 'Confirming...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={async () => {
                setLoading(true);
                setErrorMsg('');
                try {
                  const { data: authData, error: authError } = await supabase.auth.signInWithPasskey();
                  if (authError) throw authError;

                  // Once authenticated, get the user info to fetch staff data
                  const { data: sessionData } = await supabase.auth.getSession();
                  const email = sessionData?.session?.user?.email;

                  if (email) {
                    const { data: staffData, error: staffError } = await supabase
                      .from('staff')
                      .select('name, role, email')
                      .eq('email', email)
                      .maybeSingle();

                    if (staffError) throw staffError;

                    if (staffData) {
                      const userRole = staffData.role.trim().toLowerCase();
                      const user = { email: staffData.email, role: userRole, name: staffData.name };

                      localStorage.setItem('tooltrack_user', JSON.stringify(user));
                      localStorage.setItem('tooltrack_name', staffData.name);

                      onLoginSuccess(user);
                    } else {
                      setErrorMsg('Passkey verified, but staff profile not found.');
                    }
                  } else {
                    setErrorMsg('Unable to fetch user email after Face ID / Biometrics login.');
                  }
                } catch (error) {
                  setErrorMsg('Face ID / Biometrics Login Failed: ' + error.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
              Face ID / Biometrics
            </button>
          </div>
        </div>
        <p className="text-center text-sky-200/60 text-xs mt-6">Tool Tracking Mycopter Aviation</p>
      </div>
    </div>
  );
}
