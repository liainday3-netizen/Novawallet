
import React, { useState } from 'react';
import { Asset } from '../types';
import { User, Shield, Lock, CreditCard, ChevronRight, LogOut, Settings, HelpCircle, ExternalLink, Bell, ArrowLeft, TrendingUp, Zap, ShieldAlert } from 'lucide-react';

interface ProfileScreenProps {
  assets: Asset[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ assets }) => {
  const [currentView, setCurrentView] = useState<'main' | 'notifications'>('main');
  const [notifSettings, setNotifSettings] = useState({
    rewards: true,
    priceAlerts: true,
    security: true,
    marketing: false
  });

  const usdBalance = assets.find(a => a.id === '1')?.balance || 0;
  const progress = Math.min((usdBalance / 10) * 100, 100);

  const toggleNotif = (key: keyof typeof notifSettings) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (currentView === 'notifications') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <h2 className="text-xl font-bold">Notification Settings</h2>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-6 space-y-6">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Alert Preferences</p>
            
            {/* Task Rewards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Task Rewards</p>
                  <p className="text-[10px] text-slate-500">Alerts for completed tasks & gems</p>
                </div>
              </div>
              <button 
                onClick={() => toggleNotif('rewards')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifSettings.rewards ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifSettings.rewards ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Price Changes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Price Alerts</p>
                  <p className="text-[10px] text-slate-500">Major market swings & TON updates</p>
                </div>
              </div>
              <button 
                onClick={() => toggleNotif('priceAlerts')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifSettings.priceAlerts ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifSettings.priceAlerts ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {/* Security Events */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Security Alerts</p>
                  <p className="text-[10px] text-slate-500">Logins, withdrawals & sync events</p>
                </div>
              </div>
              <button 
                onClick={() => toggleNotif('security')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifSettings.security ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifSettings.security ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl flex items-start gap-3 border border-slate-800/50">
          <Bell className="w-5 h-5 text-slate-500 mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-tight">NovaWallet uses priority-based push notifications. Critical security alerts cannot be fully disabled to protect your assets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-300">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 p-1 mb-4 shadow-xl border border-slate-700">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
        </div>
        <h2 className="text-2xl font-bold">Alex Walker</h2>
        <p className="text-slate-500 text-sm">Level 4 Nova Expert</p>
      </div>

      {/* Withdrawal Progress */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> PayPal Withdrawal
            </h3>
            <span className="text-xs text-slate-400">$10.00 Minimum</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium">${usdBalance.toFixed(2)} saved</p>
            {usdBalance >= 10 ? (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Withdraw Now</button>
            ) : (
                <p className="text-[10px] text-slate-500 italic">Earn ${(10 - usdBalance).toFixed(2)} more to cash out</p>
            )}
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2">Account Security</p>
        {[
            { icon: <Shield className="w-5 h-5" />, label: "Security & Encryption", sub: "AES-256 Enabled" },
            { icon: <Lock className="w-5 h-5" />, label: "Biometric Lock", sub: "Face ID / PIN" },
            { icon: <ExternalLink className="w-5 h-5" />, label: "Connected Apps", sub: "TON, PayPal, Telegram" }
        ].map((item, i) => (
            <button key={i} className="w-full bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:bg-slate-900 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="text-slate-400">{item.icon}</div>
                    <div className="text-left">
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4 mb-2">Preferences</p>
        {[
            { id: 'notifs', icon: <Bell className="w-5 h-5" />, label: "Notification Settings", sub: "Rewards, Prices, Security" },
            { id: 'prefs', icon: <Settings className="w-5 h-5" />, label: "App Preferences", sub: "Dark Mode, Privacy" },
            { id: 'help', icon: <HelpCircle className="w-5 h-5" />, label: "Support & Help", sub: "24/7 AI Assistance" }
        ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => item.id === 'notifs' && setCurrentView('notifications')}
              className="w-full bg-slate-900/50 p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:bg-slate-900 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="text-slate-400">{item.icon}</div>
                    <div className="text-left">
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
        ))}
      </div>

      <button className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/5 rounded-2xl transition-colors">
        <LogOut className="w-5 h-5" /> Logout Session
      </button>

      <p className="text-center text-[10px] text-slate-700">NovaWallet v1.0.4. All connections encrypted via Zero-Knowledge proofs.</p>
    </div>
  );
};

export default ProfileScreen;
