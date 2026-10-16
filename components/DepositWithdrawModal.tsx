import React, { useState } from 'react';
import { Asset, Transaction } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  QrCode,
  Copy,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { playAlertChime } from './NotificationComponents';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  mode: 'deposit' | 'withdraw';
  onClose: () => void;
  assets: Asset[];
  updateBalance: (id: string, amount: number) => void;
  onAddTransaction: (tx: Transaction) => void;
  initialAssetSymbol?: string;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  mode,
  onClose,
  assets,
  updateBalance,
  onAddTransaction,
  initialAssetSymbol = 'USD'
}) => {
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>(mode);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => {
    const found = assets.find(a => a.symbol === initialAssetSymbol);
    return found ? found.id : assets[0]?.id || '1';
  });

  const [amountStr, setAmountStr] = useState<string>('50');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const maxAvailable = currentAsset?.balance || 0;

  const handleCopyMockAddress = () => {
    navigator.clipboard?.writeText('EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return;

    if (activeMode === 'withdraw' && amt > maxAvailable) {
      alert(`Insufficient balance! You only have ${maxAvailable.toFixed(2)} ${currentAsset.symbol}`);
      return;
    }

    setIsProcessing(true);
    playAlertChime();

    setTimeout(() => {
      setIsProcessing(false);
      const isDep = activeMode === 'deposit';

      // Update actual asset balance
      updateBalance(currentAsset.id, isDep ? amt : -amt);

      // Record transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: isDep ? 'receive' : 'send',
        assetSymbol: currentAsset.symbol,
        amount: isDep ? amt : -amt,
        status: 'completed',
        timestamp: Date.now()
      };
      onAddTransaction(newTx);

      const successText = isDep
        ? `Successfully deposited ${amt.toFixed(2)} ${currentAsset.symbol} into your wallet!`
        : `Successfully processed withdrawal of ${amt.toFixed(2)} ${currentAsset.symbol}!`;

      setSuccessMessage(successText);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2200);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
        {/* Header Tabs */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
          <div className="flex gap-1 bg-black/50 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setActiveMode('deposit');
                setSuccessMessage(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'deposit'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit
            </button>
            <button
              onClick={() => {
                setActiveMode('withdraw');
                setSuccessMessage(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'withdraw'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4 hide-scrollbar flex-1">
          {successMessage ? (
            <div className="py-10 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Transfer Confirmed!</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                {successMessage}
              </p>
            </div>
          ) : (
            <>
              {/* Asset Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Select Asset
                </label>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {assets.map(a => {
                    const isSel = a.id === currentAsset.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAssetId(a.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 ${
                          isSel
                            ? 'bg-cyan-950/40 border-cyan-500 text-white'
                            : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{a.icon}</span>
                        <div className="text-left font-mono">
                          <p className="text-xs font-bold leading-tight">{a.symbol}</p>
                          <p className="text-[9px] text-slate-500">{a.balance.toFixed(a.type === 'gem' ? 0 : 2)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Amount ({currentAsset.symbol})
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Available: {maxAvailable.toFixed(2)} {currentAsset.symbol}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    value={amountStr}
                    onChange={e => setAmountStr(e.target.value)}
                    placeholder="50"
                    className="w-full bg-black/60 border border-slate-800 rounded-2xl py-3 pl-4 pr-16 text-white font-mono font-bold focus:outline-none focus:border-cyan-500 text-lg"
                  />
                  {activeMode === 'withdraw' && (
                    <button
                      onClick={() => setAmountStr(maxAvailable.toString())}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold rounded-lg font-mono"
                    >
                      MAX
                    </button>
                  )}
                </div>

                {/* Quick preset chips */}
                <div className="flex gap-2 mt-2">
                  {['25', '50', '100', '250'].map(val => (
                    <button
                      key={val}
                      onClick={() => setAmountStr(val)}
                      className={`flex-1 py-1 text-xs font-bold rounded-xl border transition-all ${
                        amountStr === val
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Selector for Deposit */}
              {activeMode === 'deposit' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Deposit Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-cyan-500/20 border-cyan-500 text-white'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                      <span className="text-[10px] font-bold block">Credit/Debit</span>
                      <span className="text-[8px] text-emerald-400 font-mono">Instant</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'crypto'
                          ? 'bg-cyan-500/20 border-cyan-500 text-white'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                      <span className="text-[10px] font-bold block">TON / On-Chain</span>
                      <span className="text-[8px] text-cyan-400 font-mono">0% Fee</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        paymentMethod === 'bank'
                          ? 'bg-cyan-500/20 border-cyan-500 text-white'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                      <span className="text-[10px] font-bold block">Bank Wire</span>
                      <span className="text-[8px] text-slate-500 font-mono">ACH</span>
                    </button>
                  </div>

                  {paymentMethod === 'crypto' && (
                    <div className="mt-2.5 p-3 bg-black/50 border border-slate-800 rounded-2xl text-[10px] space-y-1.5 font-mono">
                      <p className="text-slate-400">Deposit Address (TON Network):</p>
                      <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl text-slate-300">
                        <span className="truncate pr-2 text-[9px]">EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA</span>
                        <button
                          onClick={handleCopyMockAddress}
                          className="text-cyan-400 hover:text-cyan-300 shrink-0 font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Withdrawal Destination */
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                    Withdrawal Destination
                  </label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={e => setDestinationAddress(e.target.value)}
                    placeholder="Enter TON wallet address or bank account"
                    className="w-full bg-black/60 border border-slate-800 rounded-2xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1.5 px-1">
                    <span>Network Fee: $0.00 (Nova Sponsored)</span>
                    <span className="text-emerald-400 font-bold">Estimated: ~15s</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleExecute}
                  disabled={isProcessing}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                    activeMode === 'deposit'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-cyan-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing Blockchain Transfer...</span>
                    </>
                  ) : activeMode === 'deposit' ? (
                    <>
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Confirm Deposit (+{amountStr || '0'} {currentAsset.symbol})</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Confirm Withdrawal (-{amountStr || '0'} {currentAsset.symbol})</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositWithdrawModal;
