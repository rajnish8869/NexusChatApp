import React from 'react';
import { AppTheme } from '../types';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  appTheme?: AppTheme;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  isDestructive = false,
  appTheme = 'glass'
}) => {
  if (!isOpen) return null;

  const isPastel = appTheme === 'pastel';
  const isHybrid = appTheme === 'hybrid';

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl transform transition-all scale-100 ${isPastel ? 'bg-white text-gray-900' : isHybrid ? 'bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white shadow-hybrid' : 'bg-gray-900 border border-white/10 text-white'}`}>
        <div className="text-center mb-6">
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/10 text-red-500' : isPastel ? 'bg-purple-100 text-purple-600' : isHybrid ? 'bg-white/5 text-cyan-400 shadow-neon-cyan' : 'bg-white/10 text-emerald-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isDestructive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className={`text-sm mt-2 leading-relaxed ${isPastel ? 'text-gray-500' : 'text-gray-300'}`}>{message}</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium transition ${isPastel ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition shadow-lg transform hover:scale-105 ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
