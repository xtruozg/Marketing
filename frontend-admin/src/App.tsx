import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { AdminScreen } from './components/AdminScreen';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const AdminAppContent: React.FC = () => {
  const { isAdminLoggedIn, toast } = useAdmin();

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 font-sans transition-colors duration-300 relative">
      {isAdminLoggedIn ? <AdminScreen /> : <AdminLoginScreen />}

      {/* REAL-TIME GLOBAL ADMIN TOASTS */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'success' 
              ? 'bg-emerald-500 border-emerald-600 text-white' 
              : toast.type === 'error' 
                ? 'bg-rose-500 border-rose-600 text-white' 
                : 'bg-blue-600 border-blue-700 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <AdminAppContent />
    </AdminProvider>
  );
}
