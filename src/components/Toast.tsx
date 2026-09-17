import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss, onRemove }) => {
  if (toasts.length === 0) return null;

  const handleDismiss = (id: string) => {
    if (onDismiss) onDismiss(id);
    if (onRemove) onRemove(id);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900 shadow-emerald-500/10'
              : t.type === 'error'
              ? 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-rose-500/10'
              : 'bg-blue-50/95 border-blue-300 text-blue-900 shadow-blue-500/10'
          }`}
        >
          <div className="flex items-center gap-3">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            <span className="text-sm font-semibold">{t.message}</span>
          </div>
          <button
            onClick={() => handleDismiss(t.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const Toast = ToastContainer;
