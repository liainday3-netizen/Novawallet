import React, { useState, useEffect, useMemo } from 'react';
import { Asset, PriceAlert, Transaction } from '../types';
import OmniChainQuantumCore3D from './OmniChainQuantumCore3D';
import { playAlertChime } from './NotificationComponents';
import {
  RefreshCw,
  ArrowDownUp,
  TrendingUp,
  Zap,
  ShieldCheck,
  Search,
  CheckCircle2,
  Copy,
  ChevronDown,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Globe,
  Flame,
  Check,
  QrCode,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Clock,
  Compass
} from 'lucide-react';

interface SwapScreenProps {
  assets: Asset[];
  updateBalance: (id: string, amount: number) => void;
  alerts?: PriceAlert[];
  setAlerts?: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  onAddTransaction?: (tx: Transaction) => void;
}

export interface OmniChain {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  badgeColor: string;
  neonColor: string;
  tps: string;
  finality: string;
}

export interface OmniToken {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  icon: string;
  priceUSD: number;
  decimals: number;
  verified: boolean;
  contract?: string;
}

export const OMNI_CHAINS: OmniChain[] = [
  { id: 'ALL', name: 'All Chains', symbol: 'ALL', icon: '🌌', badgeColor: 'bg-cyan-500/20 text-cyan-400', neonColor: '#00f0ff', tps: '428k', finality: '0.4s' },
  { id: 'TON', name: 'TON Network', symbol: 'TON', icon: '💎', badgeColor: 'bg-blue-500/20 text-blue-400', neonColor: '#0098ea', tps: '100k+', finality: '0.3s' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL', icon: '⚡', badgeColor: 'bg-purple-500/20 text-purple-400', neonColor: '#a855f7', tps: '65k', finality: '0.4s' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH', icon: '⟠', badgeColor: 'bg-indigo-500/20 text-indigo-400', neonColor: '#6366f1', tps: '120k L2', finality: '0.8s' },
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', icon: '₿', badgeColor: 'bg-amber-500/20 text-amber-400', neonColor: '#f59e0b', tps: 'Lightning', finality: '0.2s' },
  { id: 'BASE', name: 'Base L2', symbol: 'BASE', icon: '🔵', badgeColor: 'bg-blue-600/20 text-blue-300', neonColor: '#2563eb', tps: '45k', finality: '0.5s' },
  { id: 'BSC', name: 'BNB Chain', symbol: 'BSC', icon: '🟡', badgeColor: 'bg-yellow-500/20 text-yellow-400', neonColor: '#eab308', tps: '35k', finality: '0.9s' },
  { id: 'POLY', name: 'Polygon ZK', symbol: 'POL', icon: '🟣', badgeColor: 'bg-purple-600/20 text-purple-300', neonColor: '#9333ea', tps: '50k', finality: '0.6s' },
  { id: 'NOVA', name: 'Nova Ledger', symbol: 'NOVA', icon: '💜', badgeColor: 'bg-pink-500/20 text-pink-400', neonColor: '#ec4899', tps: '500k', finality: '0.001s' }
];

export const OMNI_TOKENS: OmniToken[] = [
  // TON Ecosystem
  { id: 'ton-ton', symbol: 'TON', name: 'Toncoin', chain: 'TON', icon: '💎', priceUSD: 5.24, decimals: 2, verified: true, contract: 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA' },
  { id: 'ton-not', symbol: 'NOT', name: 'Notcoin', chain: 'TON', icon: '🪙', priceUSD: 0.00784, decimals: 5, verified: true, contract: 'EQAvlWFDxGF2l_ky4PtGS2yNxdpEFAXpdQ_t13' },
  { id: 'ton-dogs', symbol: 'DOGS', name: 'DOGS', chain: 'TON', icon: '🦴', priceUSD: 0.000645, decimals: 6, verified: true, contract: 'EQCvxJy4eG8hyHBFsZQi_OG' },
  { id: 'ton-major', symbol: 'MAJOR', name: 'Major Token', chain: 'TON', icon: '🎖️', priceUSD: 1.15, decimals: 2, verified: true },
  { id: 'ton-usdt', symbol: 'USDT (TON)', name: 'Tether USD', chain: 'TON', icon: '💵', priceUSD: 1.00, decimals: 2, verified: true },

  // Solana Ecosystem
  { id: 'sol-sol', symbol: 'SOL', name: 'Solana', chain: 'SOL', icon: '◎', priceUSD: 154.20, decimals: 2, verified: true },
  { id: 'sol-jup', symbol: 'JUP', name: 'Jupiter', chain: 'SOL', icon: '🪐', priceUSD: 1.08, decimals: 3, verified: true },
  { id: 'sol-bonk', symbol: 'BONK', name: 'Bonk', chain: 'SOL', icon: '🐕', priceUSD: 0.0000224, decimals: 7, verified: true },
  { id: 'sol-usdc', symbol: 'USDC (SOL)', name: 'USD Coin', chain: 'SOL', icon: '💲', priceUSD: 1.00, decimals: 2, verified: true },

  // Ethereum & Layer 2s
  { id: 'eth-eth', symbol: 'ETH', name: 'Ethereum', chain: 'ETH', icon: '⟠', priceUSD: 2645.00, decimals: 2, verified: true },
  { id: 'eth-usdt', symbol: 'USDT (ERC20)', name: 'Tether USD', chain: 'ETH', icon: '💵', priceUSD: 1.00, decimals: 2, verified: true },
  { id: 'eth-arb', symbol: 'ARB', name: 'Arbitrum', chain: 'ETH', icon: '🔴', priceUSD: 0.58, decimals: 3, verified: true },

  // Bitcoin
  { id: 'btc-btc', symbol: 'BTC', name: 'Bitcoin', chain: 'BTC', icon: '₿', priceUSD: 67850.00, decimals: 2, verified: true },
  { id: 'btc-sats', symbol: 'SATS', name: 'Sats (Ordinals)', chain: 'BTC', icon: '⚡', priceUSD: 0.00028, decimals: 5, verified: true },

  // Nova Internal Ecosystem & Fiat
  { id: 'nova-gem', symbol: 'GEM', name: 'Nova Gems', chain: 'NOVA', icon: '💜', priceUSD: 0.0104, decimals: 4, verified: true },
  { id: 'nova-star', symbol: '⭐️', name: 'Telegram Stars', chain: 'TON', icon: '⭐️', priceUSD: 0.015, decimals: 3, verified: true },
  { id: 'fiat-usd', symbol: 'USD', name: 'US Dollar', chain: 'NOVA', icon: '🇺🇸', priceUSD: 1.00, decimals: 2, verified: true },
  { id: 'fiat-aud', symbol: 'AUD', name: 'AU Dollar', chain: 'NOVA', icon: '🇦🇺', priceUSD: 0.65, decimals: 2, verified: true }
];

export const SwapScreen: React.FC<SwapScreenProps> = ({
  assets,
  updateBalance,
  onAddTransaction
}) => {
  // Navigation tabs: Instant Swap, Multi-Chain Deposit, Quantum Transfer
  const [activeTab, setActiveTab] = useState<'swap' | 'deposit' | 'transfer'>('swap');

  // Token Selection State
  const [fromToken, setFromToken] = useState<OmniToken>(OMNI_TOKENS[0]); // TON
  const [toToken, setToToken] = useState<OmniToken>(OMNI_TOKENS[5]); // SOL
  const [amountStr, setAmountStr] = useState<string>('10');
  const [selectedChainFilter, setSelectedChainFilter] = useState<string>('ALL');
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>('');
  const [tokenSelectorTarget, setTokenSelectorTarget] = useState<'from' | 'to' | null>(null);

  // Transfer & Deposit Destination State
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [depositChain, setDepositChain] = useState<string>('TON');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // 3D Visualizer & Telemetry State
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [liveTPS, setLiveTPS] = useState<number>(428520);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [executionReceipt, setExecutionReceipt] = useState<{
    txId: string;
    fromText: string;
    toText: string;
    speedMs: number;
    route: string;
  } | null>(null);

  // Dynamic TPS counter animation
  useEffect(() => {
    const tpsInterval = setInterval(() => {
      setLiveTPS(prev => Math.floor(420000 + Math.random() * 25000));
    }, 2000);
    return () => clearInterval(tpsInterval);
  }, []);

  // Compute live exchange rate
  const exchangeRate = useMemo(() => {
    if (!fromToken.priceUSD || !toToken.priceUSD) return 1;
    return fromToken.priceUSD / toToken.priceUSD;
  }, [fromToken, toToken]);

  const outputAmount = useMemo(() => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return '0.00';
    const result = amt * exchangeRate;
    return result < 0.001 ? result.toFixed(6) : result < 1 ? result.toFixed(4) : result.toFixed(2);
  }, [amountStr, exchangeRate]);

  // Filtered Tokens for Selector Modal
  const filteredTokens = useMemo(() => {
    return OMNI_TOKENS.filter(t => {
      const matchChain = selectedChainFilter === 'ALL' || t.chain === selectedChainFilter;
      const matchSearch =
        t.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
        t.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase());
      return matchChain && matchSearch;
    });
  }, [selectedChainFilter, tokenSearchQuery]);

  // Execute Instant Swap
  const handleExecuteSwap = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return;

    setIsProcessing(true);
    setPulseCount(p => p + 1);
    playAlertChime();

    setTimeout(() => {
      setIsProcessing(false);

      // Check if fromToken matches user wallet asset
      const matchingFromAsset = assets.find(a => a.symbol === fromToken.symbol);
      const matchingToAsset = assets.find(a => a.symbol === toToken.symbol);

      if (matchingFromAsset && matchingFromAsset.balance >= amt) {
        updateBalance(matchingFromAsset.id, -amt);
      }
      if (matchingToAsset) {
        updateBalance(matchingToAsset.id, parseFloat(outputAmount));
      }

      // Log transaction record
      const newTx: Transaction = {
        id: `swap-${Date.now()}`,
        type: 'swap',
        assetSymbol: `${fromToken.symbol} ➔ ${toToken.symbol}`,
        amount: amt,
        status: 'completed',
        timestamp: Date.now()
      };
      if (onAddTransaction) {
        onAddTransaction(newTx);
      }

      setExecutionReceipt({
        txId: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        fromText: `${amt} ${fromToken.symbol} (${fromToken.chain})`,
        toText: `${outputAmount} ${toToken.symbol} (${toToken.chain})`,
        speedMs: Math.floor(180 + Math.random() * 120),
        route: `AI Hyper-Mesh: ${fromToken.chain} ➔ Nova Quantum ZK Relayer ➔ ${toToken.chain}`
      });

      // Clear input
      setAmountStr('');
    }, 900);
  };

  // Execute Instant Transfer
  const handleExecuteTransfer = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return;

    setIsProcessing(true);
    setPulseCount(p => p + 1);
    playAlertChime();

    setTimeout(() => {
      setIsProcessing(false);
      const targetAsset = assets.find(a => a.symbol === fromToken.symbol);
      if (targetAsset && targetAsset.balance >= amt) {
        updateBalance(targetAsset.id, -amt);
      }

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'send',
        assetSymbol: fromToken.symbol,
        amount: -amt,
        status: 'completed',
        timestamp: Date.now()
      };
      if (onAddTransaction) {
        onAddTransaction(newTx);
      }

      setExecutionReceipt({
        txId: `0x${Math.random().toString(16).substring(2, 12)}`,
        fromText: `${amt} ${fromToken.symbol}`,
        toText: recipientAddress || '@telegram_user',
        speedMs: 140,
        route: `Instant Quantum Pipeline: Direct ${fromToken.chain} Relayer`
      });

      setAmountStr('');
      setRecipientAddress('');
    }, 700);
  };

  // Swap Token Positions
  const handleReverseTokens = () => {
    setPulseCount(p => p + 1);
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const handleCopyDepositAddress = () => {
    navigator.clipboard?.writeText('EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* 3D QUANTUM OMNI-CORE VISUALIZATION */}
      <OmniChainQuantumCore3D
        tps={liveTPS}
        pulseTrigger={pulseCount}
        activeChain={fromToken.chain}
      />

      {/* Stainless Steel Navigation Modes */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-1.5 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between text-xs font-bold font-mono">
        <button
          onClick={() => setActiveTab('swap')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'swap'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> All-Chain Swap
        </button>

        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'deposit'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" /> Instant Deposit
        </button>

        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'transfer'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> Quantum Send
        </button>
      </div>

      {/* SWAP MODE INTERFACE */}
      {activeTab === 'swap' && (
        <div className="bg-gradient-to-b from-slate-900/90 to-black/95 rounded-[2.5rem] p-5 border border-slate-700/80 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-xl">
          {/* Stainless Steel Chamfer Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 opacity-80" />

          {/* From Token Card */}
          <div className="bg-black/60 rounded-3xl p-4 border border-slate-800 focus-within:border-cyan-500/80 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> You Pay
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Network: <strong className="text-cyan-400">{fromToken.chain}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-3xl font-black text-white font-mono outline-none w-1/2 placeholder-slate-700"
              />

              <button
                onClick={() => setTokenSelectorTarget('from')}
                className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 py-2 px-3 rounded-2xl flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                <span className="text-xl">{fromToken.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                    {fromToken.symbol}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </p>
                  <p className="text-[8px] text-slate-400 font-mono">{fromToken.chain}</p>
                </div>
              </button>
            </div>

            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
              <span>≈ ${(parseFloat(amountStr || '0') * fromToken.priceUSD).toFixed(2)} USD</span>
              <div className="flex gap-1.5">
                {['25%', '50%', 'MAX'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      const base = p === 'MAX' ? 100 : p === '50%' ? 50 : 25;
                      setAmountStr(base.toString());
                    }}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[9px] font-bold"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reverse Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleReverseTokens}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-slate-900 active:rotate-180 transition-all hover:scale-110"
              title="Reverse Swap Direction"
            >
              <ArrowDownUp className="w-5 h-5 font-black" />
            </button>
          </div>

          {/* To Token Card */}
          <div className="bg-black/60 rounded-3xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> You Receive (Instant)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Network: <strong className="text-purple-400">{toToken.chain}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-3xl font-black text-emerald-400 font-mono truncate w-1/2">
                {outputAmount}
              </span>

              <button
                onClick={() => setTokenSelectorTarget('to')}
                className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 py-2 px-3 rounded-2xl flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                <span className="text-xl">{toToken.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                    {toToken.symbol}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </p>
                  <p className="text-[8px] text-slate-400 font-mono">{toToken.chain}</p>
                </div>
              </button>
            </div>

            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
              <span>≈ ${(parseFloat(outputAmount || '0') * toToken.priceUSD).toFixed(2)} USD</span>
              <span className="text-emerald-400 font-bold">0% Slippage Guaranteed</span>
            </div>
          </div>

          {/* AI Superintelligence Routing Matrix */}
          <div className="bg-slate-900/60 rounded-2xl p-3 border border-slate-800 space-y-2 text-[10px] font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Cpu className="w-3 h-3" /> AI Pathfinder Route:
              </span>
              <span className="text-white">
                {fromToken.chain} ➔ Nova ZK-Mesh ➔ {toToken.chain}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Slippage & Protocol Fee:</span>
              <span className="text-emerald-400 font-bold">0.00% (Subsidized by Nova)</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span>Latency to Finality:</span>
              <span className="text-cyan-300 font-bold">~320ms Instant</span>
            </div>
          </div>

          {/* Main Action Button */}
          <button
            onClick={handleExecuteSwap}
            disabled={isProcessing || !amountStr || parseFloat(amountStr) <= 0}
            className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-black shadow-xl shadow-cyan-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Executing Cross-Chain Swap...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Instant Swap {fromToken.symbol} ➔ {toToken.symbol}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* DEPOSIT MODE INTERFACE */}
      {activeTab === 'deposit' && (
        <div className="bg-slate-900/90 rounded-[2.5rem] p-5 border border-slate-700/80 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <ArrowDownLeft className="w-4 h-4 text-cyan-400" /> Multi-Chain Instant Deposit
              </h3>
              <p className="text-[10px] text-slate-400">Deposit from any blockchain with instant arrival</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              10+ Chains Live
            </span>
          </div>

          {/* Chain Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
              Select Inbound Chain
            </label>
            <div className="grid grid-cols-3 gap-2">
              {OMNI_CHAINS.filter(c => c.id !== 'ALL').slice(0, 6).map(chain => (
                <button
                  key={chain.id}
                  onClick={() => setDepositChain(chain.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    depositChain === chain.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{chain.icon}</span>
                  <span className="text-xs font-bold block">{chain.symbol}</span>
                  <span className="text-[8px] text-slate-500 block font-mono">{chain.finality}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Unified Deposit Address */}
          <div className="bg-black/50 p-4 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-[10px]">Your {depositChain} Deposit Address:</span>
              <span className="text-emerald-400 text-[10px] font-bold">Auto-Detected</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-slate-200">
              <span className="truncate pr-2 text-[10px]">
                EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA
              </span>
              <button
                onClick={handleCopyDepositAddress}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3 h-3" /> {copiedAddress ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Funds sent to this address credit in &lt; 0.4s to your universal portfolio.</span>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODE INTERFACE */}
      {activeTab === 'transfer' && (
        <div className="bg-slate-900/90 rounded-[2.5rem] p-5 border border-slate-700/80 shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Send className="w-4 h-4 text-cyan-400" /> Quantum Multi-Chain Transfer
              </h3>
              <p className="text-[10px] text-slate-400">Send instantly to any address or @username</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Token to Send
              </label>
              <button
                onClick={() => setTokenSelectorTarget('from')}
                className="w-full bg-black/50 border border-slate-800 p-3 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{fromToken.icon}</span>
                  <div className="text-left font-mono">
                    <p className="text-xs font-bold text-white">{fromToken.name} ({fromToken.symbol})</p>
                    <p className="text-[9px] text-slate-400">{fromToken.chain} Network</p>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Recipient (Wallet Address or Telegram @username)
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={e => setRecipientAddress(e.target.value)}
                placeholder="e.g. @alexwalker or UQBQv... or 0x71C..."
                className="w-full bg-black/60 border border-slate-800 rounded-2xl py-3 px-4 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Amount ({fromToken.symbol})
              </label>
              <input
                type="number"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/60 border border-slate-800 rounded-2xl py-3 px-4 text-base font-black text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleExecuteTransfer}
              disabled={isProcessing || !amountStr || parseFloat(amountStr) <= 0}
              className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-blue-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? 'Routing Transfer...' : `Transfer ${amountStr || '0'} ${fromToken.symbol}`}
            </button>
          </div>
        </div>
      )}

      {/* BILLIONS OF TRANSACTIONS INFRASTRUCTURE TELEMETRY CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Global Super-Mesh Status
              </h4>
              <p className="text-[9px] text-slate-400">High-Throughput Parallel Quantum Engine</p>
            </div>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 100% Online
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 font-mono text-[10px]">
          <div className="bg-black/50 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[9px]">Peak Bandwidth</p>
            <p className="font-black text-cyan-300">1.48B Tx/Day</p>
          </div>
          <div className="bg-black/50 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[9px]">Live TPS</p>
            <p className="font-black text-emerald-400">{liveTPS.toLocaleString()}</p>
          </div>
          <div className="bg-black/50 p-2.5 rounded-2xl border border-slate-800">
            <p className="text-slate-500 text-[9px]">ZK Verification</p>
            <p className="font-black text-purple-400">&lt; 0.0001s</p>
          </div>
        </div>
      </div>

      {/* EXECUTION SUCCESS RECEIPT OVERLAY */}
      {executionReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="font-black text-lg text-white">Instant Finality Confirmed!</h3>
              <p className="text-xs text-slate-400 mt-0.5">Execution speed: {executionReceipt.speedMs}ms</p>
            </div>

            <div className="bg-black/60 p-3.5 rounded-2xl border border-slate-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">From:</span>
                <span className="text-white font-bold">{executionReceipt.fromText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To:</span>
                <span className="text-emerald-400 font-bold">{executionReceipt.toText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tx Hash:</span>
                <span className="text-cyan-400">{executionReceipt.txId}</span>
              </div>
            </div>

            <button
              onClick={() => setExecutionReceipt(null)}
              className="w-full py-3.5 rounded-2xl font-black bg-cyan-500 hover:bg-cyan-400 text-black text-xs transition-all active:scale-95 shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED TOKEN & CHAIN SELECTOR MODAL */}
      {tokenSelectorTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Select Any Token</h3>
                <p className="text-[10px] text-slate-400">Accessible across all connected chains</p>
              </div>
              <button
                onClick={() => setTokenSelectorTarget(null)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tokenSearchQuery}
                  onChange={e => setTokenSearchQuery(e.target.value)}
                  placeholder="Search token name, symbol, or contract..."
                  className="w-full bg-black/60 border border-slate-800 rounded-2xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Chain Pills */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-2.5 pb-0.5">
                {OMNI_CHAINS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChainFilter(c.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all shrink-0 font-mono ${
                      selectedChainFilter === c.id
                        ? 'bg-cyan-500 text-black border-cyan-400'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Token List */}
            <div className="overflow-y-auto p-3 space-y-1.5 hide-scrollbar flex-1">
              {filteredTokens.map(tok => (
                <button
                  key={tok.id}
                  onClick={() => {
                    if (tokenSelectorTarget === 'from') {
                      setFromToken(tok);
                    } else {
                      setToToken(tok);
                    }
                    setTokenSelectorTarget(null);
                    setTokenSearchQuery('');
                  }}
                  className="w-full p-3 rounded-2xl flex items-center justify-between border border-slate-800 bg-black/30 hover:bg-slate-800/50 hover:border-slate-700 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tok.icon}</span>
                    <div>
                      <p className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                        {tok.name}
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded font-mono font-normal">
                          {tok.chain}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{tok.symbol}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-white">
                      ${tok.priceUSD >= 1 ? tok.priceUSD.toFixed(2) : tok.priceUSD.toFixed(tok.decimals > 2 ? 4 : 2)}
                    </p>
                    <span className="text-[9px] text-emerald-400">Instant</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapScreen;
