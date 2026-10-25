'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    content: null,
    onConfirm: null,
    confirmText: 'Confirm'
  });

  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const openModal = useCallback((title, content, onConfirm = null, confirmText = 'Confirm') => {
    setModalState({
      isOpen: true,
      title,
      content,
      onConfirm,
      confirmText
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AppContext.Provider value={{ showToast, openModal, closeModal }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map(toast => {
          let bgClass = 'bg-slate-800 text-white';
          if (toast.type === 'success') bgClass = 'bg-emerald-500 text-white';
          if (toast.type === 'warn') bgClass = 'bg-amber-500 text-white';
          if (toast.type === 'error') bgClass = 'bg-red-500 text-white';

          return (
            <div key={toast.id} className={`p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[250px] max-w-sm pointer-events-auto fade-in ${bgClass}`}>
              <span className="text-sm font-medium">{toast.msg}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL CONTAINER */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{modalState.title}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto text-slate-700 dark:text-slate-300">
              {modalState.content}
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                Cancel
              </button>
              {modalState.onConfirm && (
                <button onClick={() => { modalState.onConfirm(); closeModal(); }} className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors shadow-sm">
                  {modalState.confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

