import React, { useState, useMemo } from 'react';
import { PriceAlert, PushNotificationPayload } from '../types';
import { CRYPTO_PAIRS } from '../constants';
import {
  Bell,
  BellRing,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  Play,
  Zap,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { playAlertChime } from './NotificationComponents';

interface PriceAlertsWidgetProps {
  alerts: PriceAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  onTriggerPushNotification: (notification: PushNotificationPayload) => void;
  onOpenTrade?: (symbol?: string) => void;
}

// Current asset market prices map for calculations
export const ASSET_MARKET_PRICES: Record<string, { price: number; name: string; icon: string; decimals: number }> = {
  TON: { price: 5.24, name: 'Toncoin', icon: '💎', decimals: 2 },
  BTC: { price: 67850, name: 'Bitcoin', icon: '₿', decimals: 2 },
  ETH: { price: 2645, name: 'Ethereum', icon: '⟠', decimals: 2 },
  SOL: { price: 154.20, name: 'Solana', icon: '◎', decimals: 2 },
  NOT: { price: 0.00784, name: 'Notcoin', icon: '🪙', decimals: 5 },
  DOGS: { price: 0.000645, name: 'DOGS', icon: '🦴', decimals: 6 },
  GEM: { price: 0.0104, name: 'Nova Gems', icon: '💜', decimals: 4 },
  USD: { price: 1.00, name: 'US Dollar', icon: '🇺🇸', decimals: 2 }
};

export const PriceAlertsWidget: React.FC<PriceAlertsWidgetProps> = ({
  alerts,
  setAlerts,
  onTriggerPushNotification,
  onOpenTrade
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('TON');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPriceStr, setTargetPriceStr] = useState<string>('5.50');
  const [alertNote, setAlertNote] = useState<string>('');

  const selectedAssetInfo = useMemo(() => {
    return ASSET_MARKET_PRICES[selectedAssetSymbol] || ASSET_MARKET_PRICES['TON'];
  }, [selectedAssetSymbol]);

  // When asset symbol changes, set default target price to +5% or -5%
  const handleSelectAsset = (symbol: string) => {
    setSelectedAssetSymbol(symbol);
    const info = ASSET_MARKET_PRICES[symbol] || ASSET_MARKET_PRICES['TON'];
    const multiplier = direction === 'above' ? 1.05 : 0.95;
    const computed = (info.price * multiplier).toFixed(info.decimals > 2 ? info.decimals : 2);
    setTargetPriceStr(computed);
  };

  // Quick percentage offset handlers
  const handleApplyOffset = (pct: number) => {
    const info = selectedAssetInfo;
    const computed = (info.price * (1 + pct / 100)).toFixed(info.decimals > 2 ? info.decimals : 2);
    setTargetPriceStr(computed);
  };

  // Helper to format price strings
  const formatVal = (val: number, decimals: number = 2) => {
    if (val >= 1000) return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val < 0.001) return '$' + val.toFixed(decimals >= 6 ? decimals : 6);
    if (val < 1) return '$' + val.toFixed(decimals >= 4 ? decimals : 4);
    return '$' + val.toFixed(decimals);
  };

  // Create new alert
  const handleCreateAlert = () => {
    const targetRate = parseFloat(targetPriceStr);
    if (isNaN(targetRate) || targetRate <= 0) return;

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      fromSymbol: selectedAssetSymbol,
      toSymbol: 'USD',
      targetRate,
      direction,
      createdAt: Date.now(),
      triggered: false,
      currentPriceAtCreation: selectedAssetInfo.price,
      note: alertNote.trim() || undefined,
      enabled: true
    };

    setAlerts(prev => [newAlert, ...prev]);
    setShowCreateModal(false);
    setAlertNote('');
  };

  // Simulate Trigger for an alert
  const handleSimulateTrigger = (alert: PriceAlert) => {
    const asset = ASSET_MARKET_PRICES[alert.fromSymbol] || { price: alert.targetRate, name: alert.fromSymbol, icon: '💎', decimals: 2 };
    const simulatedHitPrice = alert.direction === 'above' ? alert.targetRate * 1.004 : alert.targetRate * 0.996;

    // Mark as triggered in state
    setAlerts(prev =>
      prev.map(a =>
        a.id === alert.id
          ? { ...a, triggered: true, triggeredAt: Date.now() }
          : a
      )
    );

    // Fire simulated mobile push notification
    const pushPayload: PushNotificationPayload = {
      id: `push-${Date.now()}`,
      title: `🚨 ${alert.fromSymbol} Hit Target: ${formatVal(alert.targetRate, asset.decimals)}!`,
      body: `${asset.name} is now trading at ${formatVal(simulatedHitPrice, asset.decimals)}, crossing your ${alert.direction === 'above' ? 'resistance' : 'support'} threshold (${alert.direction === 'above' ? '≥' : '≤'} ${formatVal(alert.targetRate, asset.decimals)}).${alert.note ? ` Note: "${alert.note}"` : ''}`,
      icon: asset.icon,
      timestamp: Date.now(),
      assetSymbol: alert.fromSymbol,
      targetPrice: alert.targetRate,
      direction: alert.direction,
      alertId: alert.id
    };

    onTriggerPushNotification(pushPayload);
  };

  // Toggle alert enabled/disabled
  const handleToggleEnabled = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, enabled: a.enabled === false ? true : false } : a
      )
    );
  };

  // Delete alert
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Starter quick alert presets
  const handleAddStarter = (symbol: string, direction: 'above' | 'below', multiplier: number, note: string) => {
    const asset = ASSET_MARKET_PRICES[symbol] || ASSET_MARKET_PRICES['TON'];
    const target = Number((asset.price * multiplier).toFixed(asset.decimals > 2 ? asset.decimals : 2));

    const starterAlert: PriceAlert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      fromSymbol: symbol,
      toSymbol: 'USD',
      targetRate: target,
      direction,
      createdAt: Date.now(),
      triggered: false,
      currentPriceAtCreation: asset.price,
      note,
      enabled: true
    };

    setAlerts(prev => [starterAlert, ...prev]);
  };

  const activeAlertsCount = alerts.filter(a => a.enabled !== false && !a.triggered).length;

  return (
    <section className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              Price Alerts & Triggers
              {activeAlertsCount > 0 && (
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/40">
                  {activeAlertsCount} Active
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              Push notification triggers on price targets
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            handleSelectAsset('TON');
            setShowCreateModal(true);
          }}
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Set Alert
        </button>
      </div>

      {/* Alerts List or Empty Starters */}
      {alerts.length === 0 ? (
        <div className="space-y-3 pt-1">
          <div className="bg-black/40 border border-dashed border-slate-800 rounded-2xl p-4 text-center space-y-2">
            <Bell className="w-8 h-8 text-cyan-400/40 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No price alerts set</p>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
              Create an alert to simulate a push notification when an asset rises or dips to your target.
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Quick 1-Tap Suggestions
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleAddStarter('TON', 'above', 1.05, 'Target +5% Breakout')}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">💎</span>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      TON &ge; $5.50
                    </p>
                    <p className="text-[9px] text-slate-400">+5% Bullish Breakout Alert</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg">
                  + Add Alert
                </span>
              </button>

              <button
                onClick={() => handleAddStarter('BTC', 'above', 1.035, 'Bitcoin $70k milestone')}
                className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">₿</span>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                      BTC &ge; $70,000
                    </p>
                    <p className="text-[9px] text-slate-400">Psychological Resistance Test</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg">
                  + Add Alert
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map(alert => {
            const asset = ASSET_MARKET_PRICES[alert.fromSymbol] || {
              price: alert.targetRate,
              name: alert.fromSymbol,
              icon: '💎',
              decimals: 2
            };
            const currentPrice = asset.price;
            const diff = alert.targetRate - currentPrice;
            const pctDistance = currentPrice > 0 ? (Math.abs(diff) / currentPrice) * 100 : 0;
            const isAbove = alert.direction === 'above';

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  alert.triggered
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : alert.enabled === false
                    ? 'bg-black/30 border-slate-800/50 opacity-60'
                    : 'bg-black/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{alert.fromSymbol}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            isAbove
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {isAbove ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {isAbove ? '≥' : '≤'} {formatVal(alert.targetRate, asset.decimals)}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Current: <strong className="text-slate-200">{formatVal(currentPrice, asset.decimals)}</strong>{' '}
                        • {pctDistance.toFixed(1)}% away
                      </p>
                    </div>
                  </div>

                  {/* Actions & Simulation Trigger Button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSimulateTrigger(alert)}
                      className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 text-[10px] font-bold rounded-xl border border-cyan-500/40 transition-all flex items-center gap-1 shadow-sm active:scale-95"
                      title="Simulate push notification for this alert"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                      <span>Simulate</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1.5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {alert.note && (
                  <p className="text-[10px] text-cyan-300/80 italic mt-2 pt-1.5 border-t border-slate-800/80">
                    "{alert.note}"
                  </p>
                )}

                {alert.triggered && (
                  <div className="mt-2 flex items-center justify-between text-[9px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Threshold Triggered
                    </span>
                    {onOpenTrade && (
                      <button
                        onClick={() => onOpenTrade(`${alert.fromSymbol}/USD`)}
                        className="underline font-bold text-white"
                      >
                        Trade {alert.fromSymbol}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PRICE ALERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Create Price Alert</h3>
                  <p className="text-[10px] text-slate-400">Trigger simulated push notifications</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-4 space-y-4 hide-scrollbar">
              {/* Asset Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  1. Select Asset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(ASSET_MARKET_PRICES)
                    .filter(sym => sym !== 'USD')
                    .map(sym => {
                      const item = ASSET_MARKET_PRICES[sym];
                      const isSelected = selectedAssetSymbol === sym;
                      return (
                        <button
                          key={sym}
                          onClick={() => handleSelectAsset(sym)}
                          className={`p-2 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                              : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-lg block mb-0.5">{item.icon}</span>
                          <span className="text-xs font-bold block">{sym}</span>
                          <span className="text-[9px] text-slate-500 block truncate">
                            {formatVal(item.price, item.decimals > 2 ? 4 : 2)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Condition (Above / Below) */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  2. Alert Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setDirection('above');
                      handleApplyOffset(5);
                    }}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      direction === 'above'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Rises Above (&ge;)</span>
                  </button>

                  <button
                    onClick={() => {
                      setDirection('below');
                      handleApplyOffset(-5);
                    }}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      direction === 'below'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>Drops Below (&le;)</span>
                  </button>
                </div>
              </div>

              {/* Target Price Input & Quick Offsets */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    3. Target Price (USD)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Live: {formatVal(selectedAssetInfo.price, selectedAssetInfo.decimals)}
                  </span>
                </div>

                <div className="relative mb-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="any"
                    value={targetPriceStr}
                    onChange={e => setTargetPriceStr(e.target.value)}
                    placeholder="5.50"
                    className="w-full bg-black/60 border border-slate-800 rounded-2xl py-3 pl-8 pr-4 text-white font-mono font-bold focus:outline-none focus:border-cyan-500 text-base"
                  />
                </div>

                {/* Quick percentage helper chips */}
                <div className="flex gap-1.5">
                  {(direction === 'above' ? [2, 5, 10, 25] : [-2, -5, -10, -25]).map(pct => (
                    <button
                      key={pct}
                      onClick={() => handleApplyOffset(pct)}
                      className="flex-1 py-1 text-[10px] font-bold rounded-xl border border-slate-800 bg-black/40 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 font-mono transition-colors"
                    >
                      {pct > 0 ? `+${pct}%` : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  4. Note / Tag (Optional)
                </label>
                <input
                  type="text"
                  value={alertNote}
                  onChange={e => setAlertNote(e.target.value)}
                  placeholder="e.g. Take profit, Buy dip, Breakout..."
                  className="w-full bg-black/60 border border-slate-800 rounded-2xl py-2.5 px-3.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleCreateAlert}
                  className="w-full py-3.5 rounded-2xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" /> Save Price Alert
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const testVal = parseFloat(targetPriceStr) || selectedAssetInfo.price;
                    onTriggerPushNotification({
                      id: `preview-${Date.now()}`,
                      title: `🚨 ${selectedAssetSymbol} Target Hit: ${formatVal(testVal, selectedAssetInfo.decimals)}!`,
                      body: `Preview alert: ${selectedAssetInfo.name} reached your threshold (${direction === 'above' ? '≥' : '≤'} ${formatVal(testVal, selectedAssetInfo.decimals)}).`,
                      icon: selectedAssetInfo.icon,
                      timestamp: Date.now(),
                      assetSymbol: selectedAssetSymbol,
                      targetPrice: testVal,
                      direction
                    });
                  }}
                  className="w-full py-2.5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Test Push Notification Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PriceAlertsWidget;
