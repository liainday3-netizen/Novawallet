
import React, { useState } from 'react';
import { Asset, Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Copy, Check, ExternalLink, Shield, Wallet, RefreshCcw, History, Send, QrCode } from 'lucide-react';

interface TonWalletScreenProps {
  tonAsset: Asset;
  transactions: Transaction[];
  onBack: () => void;
  updateBalance: (id: string, amount: number) => void;
}

const TonWalletScreen: React.FC<TonWalletScreenProps> = ({ tonAsset, transactions, onBack, updateBalance }) => {
  const [view, setView] = useState<'main' | 'send' | 'receive'>('main');
  const [address] = useState('EQD...v8n2'); // Mock TON address
  const [copied, setCopied] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const tonTransactions = transactions.filter(tx => tx.assetSymbol === 'TON');

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    if (!sendAddress || !sendAmount) return;
    setIsProcessing(true);
    setTimeout(() => {
      updateBalance(tonAsset.id, -parseFloat(sendAmount));
      setIsProcessing(false);
      setView('main');
      setSendAddress('');
      setSendAmount('');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-slate-900 rounded-xl border border-slate-800">
          <ArrowDownLeft className="w-5 h-5 rotate-45" />
        </button>
        <h2 className="text-xl font-bold">TON Wallet</h2>
      </header>

      {view === 'main' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Wallet className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Secure TON Storage</p>
              </div>
              <h3 className="text-4xl font-black text-white mb-1">{tonAsset.balance.toFixed(2)} TON</h3>
              <p className="text-blue-200 text-sm font-medium">≈ ${(tonAsset.balance * 5.24).toFixed(2)} USD</p>
              
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setView('send')}
                  className="flex-1 bg-white text-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ArrowUpRight className="w-5 h-5" /> Send
                </button>
                <button 
                  onClick={() => setView('receive')}
                  className="flex-1 bg-blue-500/30 text-white font-bold py-4 rounded-2xl border border-white/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <ArrowDownLeft className="w-5 h-5" /> Receive
                </button>
              </div>
            </div>
          </div>

          {/* Address Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">My Address</p>
                <p className="text-xs font-mono text-slate-300">{address}</p>
              </div>
            </div>
            <button onClick={copyAddress} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> History
              </h4>
              <button className="text-[10px] font-bold text-blue-400 uppercase">View All</button>
            </div>
            <div className="space-y-2">
              {tonTransactions.length > 0 ? tonTransactions.map(tx => (
                <div key={tx.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'receive' || tx.type === 'reward' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.type === 'receive' || tx.type === 'reward' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize">{tx.type}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === 'receive' || tx.type === 'reward' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'receive' || tx.type === 'reward' ? '+' : '-'}{Math.abs(tx.amount).toFixed(2)} TON
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{tx.status}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center">
                  <p className="text-slate-600 text-sm italic">No TON transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'send' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase ml-2">Recipient Address</label>
              <input 
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                placeholder="Enter TON address (EQ...)"
                className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase ml-2">Amount (TON)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 pr-16"
                />
                <button 
                  onClick={() => setSendAmount(tonAsset.balance.toString())}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-400 uppercase"
                >
                  Max
                </button>
              </div>
              <p className="text-[10px] text-slate-500 ml-2">Available: {tonAsset.balance.toFixed(2)} TON</p>
            </div>
          </div>

          <button 
            onClick={handleSend}
            disabled={isProcessing || !sendAddress || !sendAmount}
            className="w-full py-5 bg-blue-600 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-5 h-5" /> Confirm Send</>}
          </button>
          
          <button onClick={() => setView('main')} className="w-full text-center text-slate-500 text-xs font-bold uppercase">Cancel</button>
        </div>
      )}

      {view === 'receive' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
          <div className="bg-white p-8 rounded-[2.5rem] inline-block mx-auto shadow-2xl">
            <QrCode className="w-48 h-48 text-black" />
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-2">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Your TON Address</p>
              <p className="text-sm font-mono text-blue-400 break-all">{address}</p>
              <button 
                onClick={copyAddress}
                className="mt-4 w-full py-3 bg-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
            </div>
            
            <p className="text-xs text-slate-500 px-8">
              Only send <span className="text-blue-400 font-bold">TON</span> and TON-based tokens to this address. Sending other assets may result in permanent loss.
            </p>
          </div>

          <button onClick={() => setView('main')} className="w-full text-center text-slate-500 text-xs font-bold uppercase">Back</button>
        </div>
      )}
    </div>
  );
};

export default TonWalletScreen;
