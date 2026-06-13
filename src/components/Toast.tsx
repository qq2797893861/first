import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore, ToastType } from '@/store/uiStore';

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} className="text-green-500" />,
  error: <XCircle size={20} className="text-red-500" />,
  warning: <AlertCircle size={20} className="text-yellow-500" />,
  info: <Info size={20} className="text-blue-500" />
};

const bgMap: Record<ToastType, string> = {
  success: 'bg-white border-green-100',
  error: 'bg-white border-red-100',
  warning: 'bg-white border-yellow-100',
  info: 'bg-white border-blue-100'
};

const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-in ${bgMap[toast.type]}`}
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {iconMap[toast.type]}
          <span className="text-gray-700 font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
