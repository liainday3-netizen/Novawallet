
import React, { useState, useEffect } from 'react';
import { Asset, Task, ExternalApp, Transaction, QuantificationReport, Achievement, PriceAlert, PushNotificationPayload } from '../types';
import { ChevronRight, CreditCard, TrendingUp, Info, DollarSign, Activity, Zap, BarChart3, Search, CloudLightning, Newspaper, BrainCircuit, ExternalLink, Sparkles, ArrowDownLeft, ArrowUpRight, RefreshCcw, History, Shield, ShieldCheck, Target, PieChart, LineChart, Quote, Upload, MessageSquare, Boxes, Code, Rocket, Palette, Flame, Globe } from 'lucide-react';
import { getQuantificationReport, getLiveMarketNews, getDeepMarketAnalysis, getDailyInspiration } from '../services/geminiService';
import PriceAlertsWidget from './PriceAlertsWidget';
import SecureAssetConfirmModal from './SecureAssetConfirmModal';
import DepositWithdrawModal from './DepositWithdrawModal';

interface DashboardProps {
  assets: Asset[];
  tasks: Task[];
  lastQuantification: number;
  onQuantify: () => void;
  updateBalance: (id: string, amount: number) => void;
  transactions: Transaction[];
  onOpenTon: () => void;
  onOpenTrade?: (pairSymbol?: string) => void;
  onOpenSwap?: () => void;
  onOpenEngineering?: () => void;
  alerts: PriceAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  onTriggerPushNotification: (notification: PushNotificationPayload) => void;
  onAddTransaction?: (tx: Transaction) => void;
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', user: 'Alex', title: 'Reached Tier 4 Miner!', type: 'mine', timestamp: Date.now() - 3600000 },
  { id: 'a2', user: 'NovaFan', title: '500% Profit on TON/USD!', type: 'trade', timestamp: Date.now() - 10000000 },
  { id: 'a3', user: 'CyberPunker', title: 'Generated Viral AI Video', type: 'creative', timestamp: Date.now() - 20000000 },
];

const Dashboard: React.FC<DashboardProps> = ({
  assets,
  tasks,
  lastQuantification,
  onQuantify,
  updateBalance,
  transactions,
  onOpenTon,
  onOpenTrade,
  onOpenSwap,
  onOpenEngineering,
  alerts,
  setAlerts,
  onTriggerPushNotification,
  onAddTransaction
}) => {
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [quantStep, setQuantStep] = useState<'idle' | 'scanning' | 'analyzing' | 'upscaling'>('idle');
  const [report, setReport] = useState<QuantificationReport | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [viewCurrency, setViewCurrency] = useState<'USD' | 'AUD'>('USD');
  const [quote, setQuote] = useState("Your portfolio is your story...");
  
  // Secure Asset Confirmation State
  const [secureModalAsset, setSecureModalAsset] = useState<Asset | null>(null);
  const [confirmedAssets, setConfirmedAssets] = useState<string[]>(() => {
    const saved = localStorage.getItem('nova_confirmed_assets');
    return saved ? JSON.parse(saved) : ['TON'];
  });

  const handleAssetConfirmed = (symbol: string) => {
    setConfirmedAssets(prev => {
      const updated = Array.from(new Set([...prev, symbol]));
      localStorage.setItem('nova_confirmed_assets', JSON.stringify(updated));
      return updated;
    });
  };

  // Deposit & Withdrawal Modal State
  const [depWithModal, setDepWithModal] = useState<{
    isOpen: boolean;
    mode: 'deposit' | 'withdraw';
    initialAssetSymbol?: string;
  }>({
    isOpen: false,
    mode: 'deposit',
    initialAssetSymbol: 'USD'
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [foundApps, setFoundApps] = useState<ExternalApp[]>([]);
  const [showSyncResult, setShowSyncResult] = useState(false);

  // Intelligence States
  const [isSearching, setIsSearching] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [liveNews, setLiveNews] = useState<{text: string, sources: any[]} | null>(null);
  const [deepInsight, setDeepInsight] = useState<string | null>(null);

  useEffect(() => {
    getDailyInspiration().then(setQuote);
    const timer = setInterval(() => {
      const diff = 24 * 60 * 60 * 1000 - (Date.now() - lastQuantification);
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [lastQuantification]);

  const totalBalanceUSD = assets.reduce((acc, curr) => {
    if (curr.symbol === 'USD') return acc + curr.balance;
    if (curr.symbol === 'AUD') return acc + (curr.balance / 1.54);
    if (curr.symbol === 'TON') return acc + (curr.balance * 5.24);
    if (curr.symbol === '⭐️') return acc + (curr.balance * 0.015);
    if (curr.symbol === 'GEM') return acc + (curr.balance * 0.01);
    return acc;
  }, 0);

  const displayBalance = viewCurrency === 'USD' ? totalBalanceUSD : totalBalanceUSD * 1.54;

  const handleQuantification = async () => {
    if (timeLeft > 0) return;
    setIsQuantifying(true);
    setQuantStep('scanning');
    setTimeout(() => setQuantStep('analyzing'), 1500);
    const portfolioSummary = assets.map(a => `${a.balance} ${a.symbol}`).join(', ');
    const aiReport = await getQuantificationReport(portfolioSummary);
    setTimeout(() => {
        setQuantStep('upscaling');
        setTimeout(() => {
            setIsQuantifying(false);
            setQuantStep('idle');
            setReport(aiReport);
            onQuantify();
        }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Inspiration Widget */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Quote className="w-12 h-12 text-white" />
        </div>
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Nova Inspo
        </p>
        <p className="text-lg font-medium leading-tight text-slate-100 pr-8">
            "{quote}"
        </p>
        <div className="mt-3 flex gap-2">
            <button className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-white/50 hover:bg-white/20">Refuel</button>
            <button className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-white/50 hover:bg-white/20">Share</button>
        </div>
      </div>

      {/* Achievement Wall */}
      <section className="bg-slate-900/60 rounded-3xl border border-slate-800 p-5 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" /> Success Wall
            </h3>
            <button className="bg-cyan-500 text-black p-1.5 rounded-full hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
            </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {MOCK_ACHIEVEMENTS.map(ach => (
                <div key={ach.id} className="min-w-[140px] bg-black/40 border border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
                        {ach.type === 'mine' ? '⛏️' : ach.type === 'trade' ? '📈' : ach.type === 'creative' ? '🎨' : '🏆'}
                    </div>
                    <p className="text-[10px] font-bold text-cyan-400 mb-1">{ach.user}</p>
                    <p className="text-[9px] text-slate-400 leading-none">{ach.title}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1">
            <p className="text-slate-400 text-sm font-medium">Net Worth</p>
            <button onClick={() => setViewCurrency(v => v === 'USD' ? 'AUD' : 'USD')} className="bg-black/40 px-2 py-0.5 rounded-lg text-[10px] font-bold text-cyan-400 border border-slate-700 uppercase">
                {viewCurrency} View
            </button>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {viewCurrency === 'USD' ? '$' : 'A$'}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onOpenTrade && onOpenTrade('TON/USD')}
              className="bg-cyan-500 text-black font-bold py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all hover:bg-cyan-400"
            >
              <TrendingUp className="w-4 h-4" /> Trade
            </button>
            <button
              onClick={() => onOpenSwap && onOpenSwap()}
              className="bg-slate-800 text-white font-bold py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] border border-slate-700 hover:bg-slate-700/80 transition-colors active:scale-95"
            >
              <RefreshCcw className="w-4 h-4 text-cyan-400" /> OmniSwap
            </button>
            <button
              onClick={() => setDepWithModal({ isOpen: true, mode: 'deposit', initialAssetSymbol: 'USD' })}
              className="bg-slate-800 text-white font-bold py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] border border-slate-700 hover:bg-slate-700/80 transition-colors active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Deposit
            </button>
            <button
              onClick={() => setDepWithModal({ isOpen: true, mode: 'withdraw', initialAssetSymbol: 'USD' })}
              className="bg-slate-800 text-white font-bold py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] border border-slate-700 hover:bg-slate-700/80 transition-colors active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-blue-400" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* ENGINEERING HUB & NEW ECONOMY SHOWCASE BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-3xl border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
              Project Engineering Hub & Launchpad
            </span>
          </div>
          <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            All Ages
          </span>
        </div>

        <h3 className="text-base font-black text-white mb-1">
          Smart Contracts & Autonomous New Economy
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Deploy audited smart contracts across TON, Solana & Base, generate AI token emblems with preset themes, launch viral social referral kits, and master the new economy infrastructure.
        </p>

        {/* 4 Interactive Feature Chips */}
        <div className="grid grid-cols-2 gap-2 mb-3 font-mono text-[11px]">
          <button
            onClick={() => onOpenEngineering && onOpenEngineering()}
            className="p-2.5 bg-black/50 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/50 rounded-2xl flex items-center gap-2 text-left transition-all active:scale-95"
          >
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Deploy Contract</p>
              <p className="text-[9px] text-slate-500">TON · SOL · EVM · Sui</p>
            </div>
          </button>

          <button
            onClick={() => onOpenEngineering && onOpenEngineering()}
            className="p-2.5 bg-black/50 hover:bg-purple-500/20 border border-slate-800 hover:border-purple-500/50 rounded-2xl flex items-center gap-2 text-left transition-all active:scale-95"
          >
            <Palette className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Token Pic AI</p>
              <p className="text-[9px] text-slate-500">8 Preset Themes</p>
            </div>
          </button>

          <button
            onClick={() => onOpenEngineering && onOpenEngineering()}
            className="p-2.5 bg-black/50 hover:bg-amber-500/20 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex items-center gap-2 text-left transition-all active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">Go Viral Machine</p>
              <p className="text-[9px] text-slate-500">1-Click Launch Kit</p>
            </div>
          </button>

          <button
            onClick={() => onOpenEngineering && onOpenEngineering()}
            className="p-2.5 bg-black/50 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center gap-2 text-left transition-all active:scale-95"
          >
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-xs">New Economy</p>
              <p className="text-[9px] text-slate-500">Old Way vs New Way</p>
            </div>
          </button>
        </div>

        <button
          onClick={() => onOpenEngineering && onOpenEngineering()}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Open Full Engineering Hub</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Assets List */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <PieChart className="w-4 h-4 text-slate-500" /> My Assets
            </h3>
            <button
              onClick={() => onOpenTrade && onOpenTrade()}
              className="text-[10px] font-bold text-cyan-400 uppercase hover:underline flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" /> Trade Pairs
            </button>
        </div>
        <div className="space-y-2">
            {assets.map(asset => {
              const pairMap: Record<string, string> = {
                'TON': 'TON/USD',
                'GEM': 'GEM/USD',
                'USD': 'TON/USD'
              };
              const targetPair = pairMap[asset.symbol];
              const isConfirmed = confirmedAssets.includes(asset.symbol);

              return (
                <div 
                    key={asset.id} 
                    className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group transition-all hover:border-slate-700"
                >
                    <div 
                      onClick={asset.symbol === 'TON' ? onOpenTon : () => onOpenTrade && onOpenTrade(targetPair)}
                      className="flex items-center gap-4 cursor-pointer flex-1"
                    >
                        <div className={`w-12 h-12 ${asset.color} rounded-2xl flex items-center justify-center text-xl shadow-lg`}>
                            {asset.icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm text-white">{asset.name}</p>
                              {isConfirmed && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Secure Digital Asset Confirmed" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{asset.symbol}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="text-right">
                            <p className="font-black text-sm">{asset.balance.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500 font-bold">
                                {asset.symbol === 'TON' ? `$${(asset.balance * 5.24).toFixed(2)}` : 
                                 asset.symbol === 'USD' ? `$${asset.balance.toFixed(2)}` :
                                 asset.symbol === 'GEM' ? `$${(asset.balance * 0.01).toFixed(2)}` :
                                 asset.symbol === '⭐️' ? `$${(asset.balance * 0.015).toFixed(2)}` : ''}
                            </p>
                        </div>

                        {/* Security Confirmation Badge / Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSecureModalAsset(asset);
                          }}
                          className={`px-2 py-1 text-[9px] font-bold rounded-xl border flex items-center gap-1 transition-all ${
                            isConfirmed
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title="Confirm secure digital asset verification"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{isConfirmed ? 'Secure' : 'Verify'}</span>
                        </button>

                        {targetPair && (
                          <button
                            onClick={() => onOpenTrade && onOpenTrade(targetPair)}
                            title={`Trade ${targetPair}`}
                            className="p-2 bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 rounded-xl transition-all border border-slate-700/60"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {asset.symbol === 'TON' && (
                          <button
                            onClick={onOpenTon}
                            title="Open TON Wallet"
                            className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/30"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Price Alerts & Push Notification Triggers */}
      <PriceAlertsWidget
        alerts={alerts}
        setAlerts={setAlerts}
        onTriggerPushNotification={onTriggerPushNotification}
        onOpenTrade={onOpenTrade}
      />

      {/* AI Intelligence Hub */}
      <section className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> NovaPulse</h3>
            <div className="flex gap-2">
                <button onClick={() => setIsSearching(true)} className="bg-slate-800 p-2 rounded-xl border border-slate-700"><Newspaper className="w-4 h-4 text-cyan-400" /></button>
                <button onClick={() => setIsThinking(true)} className="bg-slate-800 p-2 rounded-xl border border-slate-700"><BrainCircuit className="w-4 h-4 text-purple-400" /></button>
            </div>
        </div>
      </section>

      {/* Quantification */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
        {isQuantifying ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest">{quantStep}...</p>
            </div>
        ) : (
            <div className="space-y-4">
                {report && (
                    <div className="bg-black/40 p-5 rounded-[2rem] border border-slate-800 animate-in fade-in zoom-in-95">
                        <p className="text-sm text-cyan-100 italic leading-relaxed">"{report.summary}"</p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Efficiency</p>
                                <p className="text-xl font-black">{report.efficiencyScore}%</p>
                            </div>
                            <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50">
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Risk</p>
                                <p className="text-xl font-black text-yellow-400">{report.riskLevel}</p>
                            </div>
                        </div>
                    </div>
                )}
                <button 
                    onClick={handleQuantification}
                    disabled={timeLeft > 0}
                    className="w-full py-5 rounded-[1.5rem] font-black bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                    {timeLeft > 0 ? `LOCKED (${Math.floor(timeLeft/1000)}s)` : 'START QUANTIFICATION'}
                </button>
            </div>
        )}
      </section>

      {/* Secure Digital Asset Confirmation Modal */}
      <SecureAssetConfirmModal
        asset={secureModalAsset}
        onClose={() => setSecureModalAsset(null)}
        onConfirmed={handleAssetConfirmed}
        isConfirmed={secureModalAsset ? confirmedAssets.includes(secureModalAsset.symbol) : false}
      />

      {/* Deposit & Withdrawal Modal */}
      <DepositWithdrawModal
        isOpen={depWithModal.isOpen}
        mode={depWithModal.mode}
        onClose={() => setDepWithModal(prev => ({ ...prev, isOpen: false }))}
        assets={assets}
        updateBalance={updateBalance}
        onAddTransaction={onAddTransaction || (() => {})}
        initialAssetSymbol={depWithModal.initialAssetSymbol || 'USD'}
      />
    </div>
  );
};

export default Dashboard;
