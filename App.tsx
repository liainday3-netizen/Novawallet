
import React, { useState, useEffect } from 'react';
import { Wallet, Trophy, Cpu, RefreshCcw, User, Bell, Shield, MessageCircle, Zap, Menu, CandlestickChart, TrendingUp, Code, Boxes, FileCode } from 'lucide-react';
import { INITIAL_ASSETS, DAILY_TASKS, NAV_ITEMS } from './constants';
import { Asset, Task, Trade, MinerState, PriceAlert, Transaction, PushNotificationPayload } from './types';
import Dashboard from './components/Dashboard';
import EarnScreen from './components/EarnScreen';
import TradeScreen from './components/TradeScreen';
import SwapScreen from './components/SwapScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatScreen from './components/ChatScreen';
import MinerScreen from './components/MinerScreen';
import AILabScreen from './components/AILabScreen';
import TonWalletScreen from './components/TonWalletScreen';
import EngineeringHubScreen from './components/EngineeringHubScreen';
import { PushNotificationBanner, NotificationCenterModal } from './components/NotificationComponents';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tradePairSymbol, setTradePairSymbol] = useState('TON/USD');
  const [isViewingTon, setIsViewingTon] = useState(false);
  const [activePushNotification, setActivePushNotification] = useState<PushNotificationPayload | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<PushNotificationPayload[]>(() => {
    const saved = localStorage.getItem('nova_notif_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('nova_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('nova_tasks');
    return saved ? JSON.parse(saved) : DAILY_TASKS;
  });
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('nova_trades');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastQuantification, setLastQuantification] = useState<number>(() => {
    const saved = localStorage.getItem('nova_last_quant');
    return saved ? parseInt(saved) : 0;
  });
  const [miner, setMiner] = useState<MinerState>(() => {
    const saved = localStorage.getItem('nova_miner');
    return saved ? JSON.parse(saved) : { isActive: false, hashRate: 1.5, level: 1, energy: 100, totalMined: 0, efficiency: 1.0 };
  });
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('nova_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nova_transactions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tx1', type: 'reward', assetSymbol: 'GEM', amount: 5, status: 'completed', timestamp: Date.now() - 3600000 },
      { id: 'tx2', type: 'swap', assetSymbol: 'TON', amount: -10.5, status: 'completed', timestamp: Date.now() - 86400000 },
      { id: 'tx3', type: 'receive', assetSymbol: 'USD', amount: 0.50, status: 'completed', timestamp: Date.now() - 172800000 },
    ];
  });

  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          setHasApiKey(true);
        }
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('nova_assets', JSON.stringify(assets));
    localStorage.setItem('nova_tasks', JSON.stringify(tasks));
    localStorage.setItem('nova_trades', JSON.stringify(trades));
    localStorage.setItem('nova_last_quant', lastQuantification.toString());
    localStorage.setItem('nova_miner', JSON.stringify(miner));
    localStorage.setItem('nova_alerts', JSON.stringify(alerts));
    localStorage.setItem('nova_transactions', JSON.stringify(transactions));
  }, [assets, tasks, trades, lastQuantification, miner, alerts, transactions]);

  // Passive Mining Logic
  useEffect(() => {
    let interval: number;
    if (miner.isActive && miner.energy > 0) {
      interval = window.setInterval(() => {
        const earnings = miner.hashRate / 10000;
        updateBalance('4', earnings);
        setMiner(prev => ({
          ...prev,
          totalMined: prev.totalMined + earnings,
          energy: Math.max(0, prev.energy - (0.05 * (prev.efficiency || 1.0)))
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [miner.isActive, miner.energy, miner.hashRate, miner.efficiency]);

  const unlock = () => {
    if (pin === '1234') {
      setIsLocked(false);
    } else {
      alert('Demo PIN is 1234');
    }
  };

  const updateBalance = (id: string, amount: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, balance: a.balance + amount } : a));
  };

  const onQuantify = () => {
    const now = Date.now();
    setLastQuantification(now);
    updateBalance('4', 2.0);
    setTransactions(prev => [{
      id: `q-${Date.now()}`,
      type: 'reward',
      assetSymbol: 'GEM',
      amount: 2.0,
      status: 'completed',
      timestamp: Date.now()
    }, ...prev]);
  };

  const openTradeWithPair = (pairSymbol?: string) => {
    if (pairSymbol) {
      setTradePairSymbol(pairSymbol);
    }
    setIsViewingTon(false);
    setActiveTab('trade');
  };

  const triggerPushNotification = (notif: PushNotificationPayload) => {
    setActivePushNotification(notif);
    setNotificationHistory(prev => {
      const updated = [notif, ...prev.filter(n => n.id !== notif.id)].slice(0, 30);
      localStorage.setItem('nova_notif_history', JSON.stringify(updated));
      return updated;
    });
  };

  const renderContent = () => {
    if (isViewingTon) {
      const tonAsset = assets.find(a => a.symbol === 'TON') || assets[2];
      return (
        <TonWalletScreen 
          tonAsset={tonAsset} 
          transactions={transactions} 
          onBack={() => setIsViewingTon(false)} 
          updateBalance={updateBalance} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            assets={assets}
            tasks={tasks}
            lastQuantification={lastQuantification}
            onQuantify={onQuantify}
            updateBalance={updateBalance}
            transactions={transactions}
            onOpenTon={() => setIsViewingTon(true)}
            onOpenTrade={openTradeWithPair}
            onOpenSwap={() => {
              setIsViewingTon(false);
              setActiveTab('swap');
            }}
            onOpenEngineering={() => {
              setIsViewingTon(false);
              setActiveTab('engineering');
            }}
            alerts={alerts}
            setAlerts={setAlerts}
            onTriggerPushNotification={triggerPushNotification}
            onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
          />
        );
      case 'swap':
        return (
          <SwapScreen
            assets={assets}
            updateBalance={updateBalance}
            alerts={alerts}
            setAlerts={setAlerts}
            onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
          />
        );
      case 'engineering':
        return (
          <EngineeringHubScreen
            onOpenTrade={openTradeWithPair}
            onOpenSwap={() => {
              setIsViewingTon(false);
              setActiveTab('swap');
            }}
            updateBalance={updateBalance}
          />
        );
      case 'trade':
        return (
          <TradeScreen
            trades={trades}
            setTrades={setTrades}
            assets={assets}
            updateBalance={updateBalance}
            onNavigateToTon={() => setIsViewingTon(true)}
            initialPairSymbol={tradePairSymbol}
          />
        );
      case 'ailab': return <AILabScreen />;
      case 'mine': return <MinerScreen miner={miner} setMiner={setMiner} updateBalance={updateBalance} assets={assets} />;
      case 'earn': return <EarnScreen tasks={tasks} setTasks={setTasks} updateBalance={updateBalance} />;
      case 'profile': return <ProfileScreen assets={assets} />;
      default:
        return (
          <Dashboard
            assets={assets}
            tasks={tasks}
            lastQuantification={lastQuantification}
            onQuantify={onQuantify}
            updateBalance={updateBalance}
            transactions={transactions}
            onOpenTon={() => setIsViewingTon(true)}
            onOpenTrade={openTradeWithPair}
            onOpenSwap={() => {
              setIsViewingTon(false);
              setActiveTab('swap');
            }}
            onOpenEngineering={() => {
              setIsViewingTon(false);
              setActiveTab('engineering');
            }}
            alerts={alerts}
            setAlerts={setAlerts}
            onTriggerPushNotification={triggerPushNotification}
            onAddTransaction={(tx) => setTransactions(prev => [tx, ...prev])}
          />
        );
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mb-6 ai-pulse">
          <Zap className="w-10 h-10 text-black" />
        </div>
        <h1 className="text-2xl font-bold mb-4">API Key Required</h1>
        <p className="text-slate-400 mb-8 max-w-xs">
          To use advanced AI features like high-quality image and video generation, you must select a paid Gemini API key from a Google Cloud project with billing enabled.
        </p>
        <button 
          onClick={handleOpenKeySelector}
          className="bg-cyan-500 text-black font-bold py-4 px-8 rounded-2xl hover:bg-cyan-400 transition-colors mb-4 w-full max-w-xs"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-500 text-sm underline"
        >
          Learn about Gemini API billing
        </a>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8">
        <div className="mb-12 text-center">
            <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 ai-pulse">
                <Shield className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">NovaWallet</h1>
            <p className="text-slate-400">Encrypted All-in-One AI Mobile Hub</p>
        </div>
        <div className="w-full max-w-xs space-y-6">
            <div className="flex justify-center gap-4 mb-8">
                {[1,2,3,4].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 border-cyan-500 ${pin.length > i ? 'bg-cyan-500' : 'bg-transparent'}`} />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3,4,5,6,7,8,9].map(n => (
                    <button 
                        key={n} 
                        onClick={() => pin.length < 4 && setPin(p => p + n)}
                        className="h-16 w-16 rounded-full bg-slate-900 text-white text-2xl font-semibold hover:bg-slate-800 flex items-center justify-center"
                    >
                        {n}
                    </button>
                ))}
                <button onClick={() => setPin('')} className="h-16 w-16 text-slate-400 font-medium">Clear</button>
                <button onClick={() => pin.length < 4 && setPin(p => p + '0')} className="h-16 w-16 rounded-full bg-slate-900 text-white text-2xl font-semibold flex items-center justify-center">0</button>
                <button onClick={unlock} className="h-16 w-16 text-cyan-500 font-bold">Go</button>
            </div>
            <p className="text-center text-slate-500 text-xs mt-4">Demo PIN: 1234</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col max-w-md mx-auto relative overflow-hidden">
      <header className="p-5 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="font-bold text-black">NW</span>
            </div>
            <div>
                <p className="text-xs text-slate-500">Multimodal Hub</p>
                <p className="text-sm font-semibold">NovaWallet Lab v2</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button
              onClick={() => setShowNotifModal(true)}
              className="relative p-1 hover:bg-white/5 rounded-xl transition-colors"
              title="Notifications"
            >
                <Bell className="w-6 h-6 text-slate-300" />
                {notificationHistory.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                    {notificationHistory.length}
                  </span>
                )}
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-24 p-5">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 py-2.5 px-1.5 flex justify-around items-center z-50">
        {NAV_ITEMS.map((item) => {
            const Icon = { Wallet, Trophy, Cpu, RefreshCcw, User, MessageCircle, Zap, Menu, CandlestickChart, TrendingUp, Code, Boxes, FileCode }[item.icon as any] || Code;
            const isActive = activeTab === item.id;
            return (
                <button 
                    key={item.id}
                    onClick={() => {
                      setIsViewingTon(false);
                      setActiveTab(item.id);
                    }}
                    className={`flex flex-col items-center gap-0.5 transition-all duration-200 px-1 ${isActive ? 'text-cyan-400 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-cyan-400/15 text-cyan-400' : ''}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-medium tracking-tight leading-none">{item.label}</span>
                </button>
            );
        })}
      </nav>

      {/* Simulated Mobile Push Notification Banner */}
      <PushNotificationBanner
        notification={activePushNotification}
        onDismiss={() => setActivePushNotification(null)}
        onAction={(n) => {
          if (n.assetSymbol) openTradeWithPair(`${n.assetSymbol}/USD`);
        }}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={notificationHistory}
        onClearAll={() => {
          setNotificationHistory([]);
          localStorage.removeItem('nova_notif_history');
        }}
        onOpenTrade={openTradeWithPair}
      />
    </div>
  );
};

export default App;
