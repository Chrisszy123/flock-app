import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

export function NotificationPopup() {
  const { latestNotification, clearNotification } = useWebSocket();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      // Auto-dismiss after 15 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        clearNotification();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification, clearNotification]);

  const handleClose = () => {
    setIsVisible(false);
    clearNotification();
  };

  if (!isVisible || !latestNotification) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-primary-500/30 rounded-2xl shadow-2xl shadow-primary-500/10 max-w-md w-full mx-4 overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-b border-secondary-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <Bell className="w-5 h-5 text-primary-400" />
            </div>
            <span className="text-sm font-medium text-primary-300">Admin Broadcast</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-secondary-400 hover:text-white hover:bg-secondary-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <h3 className="text-xl font-display font-semibold text-white mb-3">
            {latestNotification.title}
          </h3>
          <p className="text-secondary-300 leading-relaxed">
            {latestNotification.message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-secondary-800/50">
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
