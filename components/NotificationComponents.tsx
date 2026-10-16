import React, { useEffect, useState } from 'react';
import { PushNotificationPayload } from '../types';
import {
  Bell,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  Volume2
} from 'lucide-react';

// Web Audio API Chime simulation (2-tone harmonic chime: 880Hz -> 1320Hz)
export const playAlertChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Second tone (E6 - 1320Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.42);
  } catch (e) {
    // Graceful fallback if autoplay is restricted
  }
};

interface PushNotificationBannerProps {
  notification: PushNotificationPayload | null;
  onDismiss: () => void;
  onAction?: (notification: PushNotificationPayload) => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  notification,
  onDismiss,
  onAction
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    // Play simulated push notification sound
    playAlertChime();

    // Auto-dismiss countdown timer (6 seconds)
    const duration = 6000;
    const interval = 50;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(timer);
        onDismiss();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [notification]);

  if (!notification) return null;

  const isAbove = notification.direction === 'above';

  return (
    <div className="fixed top-3 left-0 right-0 max-w-md mx-auto px-3 z-[100] animate-in slide-in-from-top-6 duration-300 pointer-events-auto">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-3xl p-4 shadow-2xl shadow-cyan-500/20 text-white relative overflow-hidden ring-1 ring-white/10">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

        {/* Top header line */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-[10px] font-black text-black">NW</span>
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400">
              NovaWallet • Price Alert
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">now</span>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification body */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
              isAbove ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {notification.icon || (isAbove ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-white leading-tight truncate">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
              {notification.body}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <Volume2 className="w-3 h-3 text-cyan-400" /> Simulated Push
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onAction) onAction(notification);
                onDismiss();
              }}
              className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              View Chart <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress bar countdown */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
          <div
            className="h-full bg-cyan-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationPayload[];
  onClearAll: () => void;
  onOpenTrade?: (symbol?: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onOpenTrade
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Notifications</h3>
              <p className="text-[10px] text-slate-400">Price Alerts & System Events</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-2.5 hide-scrollbar flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Bell className="w-10 h-10 mx-auto opacity-20 text-slate-400" />
              <p className="text-xs font-bold">No notifications yet</p>
              <p className="text-[10px] text-slate-600 max-w-[200px] mx-auto">
                Set price alerts on the Dashboard to get notified when assets hit your target thresholds.
              </p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                className="bg-black/40 border border-slate-800 p-3.5 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon || '🔔'}</span>
                    <div>
                      <p className="font-bold text-xs text-white leading-tight">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {item.assetSymbol && onOpenTrade && (
                    <button
                      onClick={() => {
                        onOpenTrade(`${item.assetSymbol}/USD`);
                        onClose();
                      }}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded-lg text-[10px] font-bold transition-all"
                    >
                      Trade
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-snug">{item.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
