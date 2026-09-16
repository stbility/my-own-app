import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'info':
        return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'info':
        return 'border-sky-500/40 bg-sky-950/90 text-sky-100';
      case 'warn':
        return 'border-amber-500/40 bg-amber-950/90 text-amber-100';
      case 'success':
      default:
        return 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100';
    }
  };

  return (
    <div
      id="global-toast-notification"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
      role="status"
    >
      <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border ${getBorderColor()}`}>
        {getIcon()}
        <span className="text-sm font-medium tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
};
