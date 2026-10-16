import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trade, Asset, CandleData, CryptoPairInfo } from '../types';
import { CRYPTO_PAIRS } from '../constants';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Zap,
  ExternalLink,
  ChevronDown,
  CandlestickChart as CandleIcon,
  LineChart as LineIcon,
  RefreshCw,
  Sparkles,
  Layers,
  BarChart2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  SlidersHorizontal,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getTradingAdvice } from '../services/geminiService';

interface TradeScreenProps {
  trades: Trade[];
  setTrades: React.Dispatch<React.SetStateAction<Trade[]>>;
  assets: Asset[];
  updateBalance?: (id: string, amount: number) => void;
  onNavigateToTon?: () => void;
  initialPairSymbol?: string;
}

type Timeframe = '15M' | '1H' | '4H' | '1D' | '1W';

// Helper to format prices dynamically based on scale
const formatPrice = (val: number, decimals: number = 2): string => {
  if (isNaN(val) || val === undefined || val === null) return '$0.00';
  if (val >= 1000) {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (val < 0.001) {
    return '$' + val.toFixed(decimals >= 6 ? decimals : 6);
  }
  if (val < 1) {
    return '$' + val.toFixed(decimals >= 4 ? decimals : 4);
  }
  return '$' + val.toFixed(decimals);
};

// Generates authentic-looking candlestick data for a given pair and timeframe
const generateHistoricalCandles = (
  pair: CryptoPairInfo,
  timeframe: Timeframe,
  count: number = 24
): CandleData[] => {
  const candles: CandleData[] = [];
  const basePrice = pair.basePrice;
  const vol = pair.volatility;
  
  // Interval in milliseconds
  const intervalMs = {
    '15M': 15 * 60 * 1000,
    '1H': 60 * 60 * 1000,
    '4H': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000
  }[timeframe];

  // Start with a slight offset to create realistic trend
  let runningPrice = basePrice * (1 - (pair.change24h / 100) * 0.7);
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const candleTime = now - i * intervalMs;
    const dateObj = new Date(candleTime);
    let timeLabel = '';

    if (timeframe === '15M' || timeframe === '1H') {
      timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (timeframe === '4H' || timeframe === '1D') {
      timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:00`;
    } else {
      timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    }

    // Step variation with slight momentum
    const isLatest = i === 0;
    const progress = (count - i) / count;
    // Anchor the latest candle close to the pair's basePrice
    const target = isLatest ? basePrice : basePrice * (1 + (progress - 0.5) * (pair.change24h / 100));
    const bias = (target - runningPrice) * 0.15;
    const delta = ((Math.random() - 0.49) * 2 * vol * basePrice) + bias;

    const open = runningPrice;
    let close = Math.max(open + delta, basePrice * 0.05);
    if (isLatest) {
      close = basePrice;
    }

    const wickUpper = Math.random() * vol * basePrice * 1.2;
    const wickLower = Math.random() * vol * basePrice * 1.2;
    const high = Math.max(open, close) + wickUpper;
    const low = Math.max(Math.min(open, close) - wickLower, basePrice * 0.04);

    runningPrice = close;

    const volumeBase = pair.basePrice > 100 ? 50 : pair.basePrice > 1 ? 5000 : 500000;
    const volume = Math.floor(volumeBase * (0.6 + Math.random() * 0.8));

    candles.push({
      time: timeLabel,
      timestamp: candleTime,
      open: Number(open.toFixed(pair.baseDecimals)),
      high: Number(high.toFixed(pair.baseDecimals)),
      low: Number(low.toFixed(pair.baseDecimals)),
      close: Number(close.toFixed(pair.baseDecimals)),
      candleRange: [
        Number(low.toFixed(pair.baseDecimals)),
        Number(high.toFixed(pair.baseDecimals))
      ],
      volume
    });
  }

  // Calculate Moving Averages (MA7, MA25)
  for (let idx = 0; idx < candles.length; idx++) {
    // MA7
    const ma7Slice = candles.slice(Math.max(0, idx - 6), idx + 1);
    const ma7Avg = ma7Slice.reduce((sum, c) => sum + c.close, 0) / ma7Slice.length;
    candles[idx].ma7 = Number(ma7Avg.toFixed(pair.baseDecimals));

    // MA25
    const ma25Slice = candles.slice(Math.max(0, idx - 24), idx + 1);
    const ma25Avg = ma25Slice.reduce((sum, c) => sum + c.close, 0) / ma25Slice.length;
    candles[idx].ma25 = Number(ma25Avg.toFixed(pair.baseDecimals));
  }

  return candles;
};

// Custom SVG Candlestick renderer for Recharts
const CandlestickBarShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || x === undefined || y === undefined || width === undefined || height === undefined) {
    return null;
  }

  const open = Number(payload.open);
  const close = Number(payload.close);
  const high = Number(payload.high);
  const low = Number(payload.low);
  const isBullish = close >= open;

  // Bullish: Vibrant emerald green, Bearish: Crisp rose red
  const candleColor = isBullish ? '#10b981' : '#f43f5e';
  const priceRange = high - low;

  // Compute exact y positions on screen
  const yOpen = priceRange <= 0 ? y : y + height * ((high - open) / priceRange);
  const yClose = priceRange <= 0 ? y : y + height * ((high - close) / priceRange);

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2); // Minimum 2px for doji visibility
  const wickX = x + width / 2;
  const candleBodyWidth = Math.max(width - 2.5, 2);
  const bodyX = x + (width - candleBodyWidth) / 2;

  return (
    <g className="recharts-candlestick-node">
      {/* Upper and Lower Wick */}
      <line
        x1={wickX}
        y1={y}
        x2={wickX}
        y2={y + height}
        stroke={candleColor}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Candlestick Body */}
      <rect
        x={bodyX}
        y={bodyTop}
        width={candleBodyWidth}
        height={bodyHeight}
        fill={candleColor}
        stroke={candleColor}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
};

export const TradeScreen: React.FC<TradeScreenProps> = ({
  trades,
  setTrades,
  assets,
  updateBalance,
  onNavigateToTon,
  initialPairSymbol = 'TON/USD'
}) => {
  // Selected Pair State
  const [selectedPairId, setSelectedPairId] = useState<string>(() => {
    const found = CRYPTO_PAIRS.find(p => p.symbol === initialPairSymbol);
    return found ? found.id : CRYPTO_PAIRS[0].id;
  });

  const selectedPair = useMemo(() => {
    return CRYPTO_PAIRS.find(p => p.id === selectedPairId) || CRYPTO_PAIRS[0];
  }, [selectedPairId]);

  // Chart Configuration State
  const [timeframe, setTimeframe] = useState<Timeframe>('15M');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showPairModal, setShowPairModal] = useState(false);

  // Candlestick Data State
  const [candles, setCandles] = useState<CandleData[]>(() =>
    generateHistoricalCandles(selectedPair, '15M', 24)
  );

  // Live Live Price & Ticker State
  const [currentLivePrice, setCurrentLivePrice] = useState<number>(selectedPair.basePrice);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  // Paper Trading State
  const [paperBalance, setPaperBalance] = useState<number>(() => {
    const saved = localStorage.getItem('nova_paper_balance');
    return saved ? parseFloat(saved) : 1000;
  });
  const [orderAmountStr, setOrderAmountStr] = useState<string>('50');
  const [orderNotification, setOrderNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // NovaBot AI State
  const [advice, setAdvice] = useState<{ text: string; sources: any[] }>({
    text: 'Analyzing real-time order books & macro sentiment...',
    sources: []
  });
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Update paper balance in localStorage
  useEffect(() => {
    localStorage.setItem('nova_paper_balance', paperBalance.toString());
  }, [paperBalance]);

  // Regenerate candles when pair or timeframe changes
  useEffect(() => {
    const newCandles = generateHistoricalCandles(selectedPair, timeframe, 26);
    setCandles(newCandles);
    const lastClose = newCandles[newCandles.length - 1]?.close || selectedPair.basePrice;
    setCurrentLivePrice(lastClose);
    fetchPairAdvice(selectedPair.symbol);
  }, [selectedPairId, timeframe]);

  // Real-time micro-ticking simulation for candlestick chart
  useEffect(() => {
    const ticker = setInterval(() => {
      setCandles(prev => {
        if (!prev || prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const last = prev[lastIndex];

        // Random micro tick between -0.3% and +0.3%
        const tickDelta = (Math.random() - 0.49) * (selectedPair.volatility * 0.4) * last.close;
        const updatedClose = Number(Math.max(last.close + tickDelta, selectedPair.basePrice * 0.1).toFixed(selectedPair.baseDecimals));
        const updatedHigh = Number(Math.max(last.high, updatedClose).toFixed(selectedPair.baseDecimals));
        const updatedLow = Number(Math.min(last.low, updatedClose).toFixed(selectedPair.baseDecimals));

        setPriceFlash(updatedClose >= last.close ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 800);
        setCurrentLivePrice(updatedClose);

        const updatedLast: CandleData = {
          ...last,
          close: updatedClose,
          high: updatedHigh,
          low: updatedLow,
          candleRange: [updatedLow, updatedHigh],
          volume: last.volume + Math.floor(Math.random() * 8 + 2)
        };

        const next = [...prev];
        next[lastIndex] = updatedLast;
        return next;
      });
    }, 2800);

    return () => clearInterval(ticker);
  }, [selectedPair]);

  // Fetch AI advice for the chosen pair
  const fetchPairAdvice = async (pairName: string) => {
    setIsBotThinking(true);
    try {
      const tip = await getTradingAdvice(
        `${pairName} current technical trend, support/resistance, and crypto market sentiment`
      );
      setAdvice(tip);
    } catch (e) {
      setAdvice({
        text: `Bullish momentum detected for ${pairName}. Watch for key breakout resistance levels with healthy volume accumulation.`,
        sources: []
      });
    } finally {
      setIsBotThinking(false);
    }
  };

  // Execute Paper Trade
  const handlePlaceOrder = (type: 'buy' | 'sell') => {
    const amountUSD = parseFloat(orderAmountStr);
    if (isNaN(amountUSD) || amountUSD <= 0) {
      setOrderNotification({ msg: 'Please enter a valid order amount', type: 'error' });
      setTimeout(() => setOrderNotification(null), 3000);
      return;
    }

    if (type === 'buy' && paperBalance < amountUSD) {
      setOrderNotification({ msg: 'Insufficient Paper Trading balance!', type: 'error' });
      setTimeout(() => setOrderNotification(null), 3000);
      return;
    }

    const execPrice = currentLivePrice;
    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      pair: selectedPair.symbol,
      type,
      amount: amountUSD,
      price: execPrice,
      status: 'pending',
      pnl: 0,
      timestamp: Date.now()
    };

    setTrades([newTrade, ...trades]);
    setPaperBalance(prev => (type === 'buy' ? prev - amountUSD : prev + amountUSD));

    setOrderNotification({
      msg: `Executed ${type.toUpperCase()} order for $${amountUSD.toFixed(2)} ${selectedPair.symbol} @ ${formatPrice(execPrice, selectedPair.baseDecimals)}`,
      type: 'success'
    });
    setTimeout(() => setOrderNotification(null), 4000);

    // Simulate market movement over time
    setTimeout(() => {
      setTrades(prevTrades =>
        prevTrades.map(t => {
          if (t.id === newTrade.id) {
            const isProfit = Math.random() > 0.45;
            const pnlAmount = Number(((Math.random() * 0.08 + 0.01) * amountUSD * (isProfit ? 1 : -1)).toFixed(2));
            return {
              ...t,
              status: isProfit ? 'profit' : 'loss',
              pnl: pnlAmount
            };
          }
          return t;
        })
      );
    }, 3500);
  };

  // Close active position
  const handleClosePosition = (tradeId: string) => {
    const tradeToClose = trades.find(t => t.id === tradeId);
    if (!tradeToClose) return;

    // Calculate closed return
    const returnAmount = tradeToClose.amount + tradeToClose.pnl;
    setPaperBalance(prev => prev + returnAmount);
    setTrades(prev => prev.filter(t => t.id !== tradeId));

    setOrderNotification({
      msg: `Closed position! Returned $${returnAmount.toFixed(2)} (${tradeToClose.pnl >= 0 ? '+' : ''}$${tradeToClose.pnl.toFixed(2)}) to paper balance`,
      type: 'success'
    });
    setTimeout(() => setOrderNotification(null), 3500);
  };

  // Calculate chart boundaries
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 10, maxVolume: 1000 };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const padding = (max - min) * 0.08 || min * 0.02;
    return {
      minPrice: Math.max(min - padding, 0.000001),
      maxPrice: max + padding,
      maxVolume: maxVol || 1000
    };
  }, [candles]);

  // Custom Chart Tooltip HUD
  const CustomCandleTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: CandleData = payload[0]?.payload;
    if (!data) return null;

    const isUp = data.close >= data.open;
    const diff = data.close - data.open;
    const pct = data.open > 0 ? (diff / data.open) * 100 : 0;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[190px] z-50">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> {data.time}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {isUp ? '+' : ''}{pct.toFixed(2)}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Open:</span>
            <span className="text-slate-200">{formatPrice(data.open, selectedPair.baseDecimals)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">High:</span>
            <span className="text-emerald-400">{formatPrice(data.high, selectedPair.baseDecimals)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Low:</span>
            <span className="text-rose-400">{formatPrice(data.low, selectedPair.baseDecimals)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Close:</span>
            <span className={isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {formatPrice(data.close, selectedPair.baseDecimals)}
            </span>
          </div>
        </div>

        {showMA && (data.ma7 || data.ma25) && (
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            {data.ma7 && <span className="text-sky-400">MA7: {formatPrice(data.ma7, selectedPair.baseDecimals)}</span>}
            {data.ma25 && <span className="text-amber-400">MA25: {formatPrice(data.ma25, selectedPair.baseDecimals)}</span>}
          </div>
        )}

        {showVolume && data.volume && (
          <div className="pt-1 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Vol:</span>
            <span className="text-slate-200">{data.volume.toLocaleString()} {selectedPair.base}</span>
          </div>
        )}
      </div>
    );
  };

  // Calculate order coin equivalent
  const coinEquivalent = useMemo(() => {
    const amt = parseFloat(orderAmountStr);
    if (isNaN(amt) || currentLivePrice <= 0) return 0;
    return amt / currentLivePrice;
  }, [orderAmountStr, currentLivePrice]);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {orderNotification && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 max-w-sm w-[90%] transition-all animate-in slide-in-from-top-4 ${
            orderNotification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {orderNotification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="truncate">{orderNotification.msg}</span>
        </div>
      )}

      {/* Top Pair Selector Carousel */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> Select Market Pair
          </p>
          <button
            onClick={() => setShowPairModal(true)}
            className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:text-cyan-300"
          >
            All Markets <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {CRYPTO_PAIRS.map(pair => {
            const isSelected = pair.id === selectedPair.id;
            const isPositive = pair.change24h >= 0;
            return (
              <button
                key={pair.id}
                onClick={() => setSelectedPairId(pair.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all shrink-0 text-left ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{pair.icon}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{pair.symbol}</span>
                    {pair.category === 'TON Ecosystem' && (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">TON</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-300">
                      {formatPrice(pair.basePrice, pair.baseDecimals)}
                    </span>
                    <span
                      className={`text-[9px] font-bold font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}{pair.change24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Chart Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-4 relative overflow-hidden backdrop-blur-xl">
        {/* Pair Header & Live Ticker */}
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedPair.icon}</span>
              <h2 className="text-lg font-black text-white tracking-tight">{selectedPair.symbol}</h2>
              <span className="bg-slate-800 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                {selectedPair.name}
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span
                className={`text-2xl font-black font-mono transition-colors duration-300 ${
                  priceFlash === 'up'
                    ? 'text-emerald-400'
                    : priceFlash === 'down'
                    ? 'text-rose-400'
                    : 'text-white'
                }`}
              >
                {formatPrice(currentLivePrice, selectedPair.baseDecimals)}
              </span>
              <span
                className={`text-xs font-bold font-mono flex items-center px-1.5 py-0.5 rounded-md ${
                  selectedPair.change24h >= 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {selectedPair.change24h >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Quick Chart Controls */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandleIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Area Line Chart"
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'area'
                  ? 'bg-cyan-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 24H Quick Statistics Ribbon */}
        <div className="grid grid-cols-4 gap-2 bg-black/30 p-2.5 rounded-2xl border border-slate-800/80 mb-3 text-[10px] font-mono">
          <div>
            <p className="text-slate-500">24h High</p>
            <p className="font-bold text-emerald-400">{formatPrice(selectedPair.high24h, selectedPair.baseDecimals)}</p>
          </div>
          <div>
            <p className="text-slate-500">24h Low</p>
            <p className="font-bold text-rose-400">{formatPrice(selectedPair.low24h, selectedPair.baseDecimals)}</p>
          </div>
          <div>
            <p className="text-slate-500">24h Vol</p>
            <p className="font-bold text-slate-300">{selectedPair.volume24h}</p>
          </div>
          <div>
            <p className="text-slate-500">Network</p>
            <p className="font-bold text-cyan-400 truncate">{selectedPair.category}</p>
          </div>
        </div>

        {/* Timeframe & Overlay Selector Bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-slate-800/80">
            {(['15M', '1H', '4H', '1D', '1W'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMA(!showMA)}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg border transition-colors flex items-center gap-1 ${
                showMA
                  ? 'bg-sky-950/60 border-sky-500/50 text-sky-300'
                  : 'bg-black/40 border-slate-800 text-slate-500'
              }`}
            >
              MA
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 text-[9px] font-mono rounded-lg border transition-colors flex items-center gap-1 ${
                showVolume
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                  : 'bg-black/40 border-slate-800 text-slate-500'
              }`}
            >
              VOL
            </button>
          </div>
        </div>

        {/* RECHARTS CANDLESTICK CHART */}
        <div className="h-64 w-full relative">
          {/* Legend Overlay */}
          {showMA && (
            <div className="absolute top-1 left-2 z-10 flex items-center gap-3 text-[9px] font-mono pointer-events-none">
              <span className="flex items-center gap-1 text-sky-400">
                <span className="w-2 h-0.5 bg-sky-400 inline-block rounded"></span> MA(7)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-0.5 bg-amber-400 inline-block rounded"></span> MA(25)
              </span>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={candles}
              margin={{ top: 15, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tradeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
                opacity={0.7}
              />

              <XAxis
                dataKey="time"
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                minTickGap={25}
              />

              <YAxis
                yAxisId="price"
                orientation="right"
                stroke="#64748b"
                fontSize={9}
                domain={[minPrice, maxPrice]}
                tickFormatter={(v: number) => formatPrice(v, selectedPair.baseDecimals)}
                tickLine={false}
                axisLine={false}
                width={50}
              />

              <YAxis
                yAxisId="volume"
                orientation="left"
                domain={[0, maxVolume * 4]}
                hide={true}
              />

              <Tooltip
                content={<CustomCandleTooltip />}
                isAnimationActive={false}
              />

              {/* Volume Bars at Bottom */}
              {showVolume && (
                <Bar
                  yAxisId="volume"
                  dataKey="volume"
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    if (!payload || x === undefined || y === undefined) return null;
                    const isUp = payload.close >= payload.open;
                    return (
                      <rect
                        x={x + 0.5}
                        y={y}
                        width={Math.max(width - 1, 1)}
                        height={height}
                        fill={isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}
                        rx={0.5}
                      />
                    );
                  }}
                  isAnimationActive={false}
                />
              )}

              {/* Candlestick Bar or Area Line */}
              {chartType === 'candlestick' ? (
                <Bar
                  yAxisId="price"
                  dataKey="candleRange"
                  shape={<CandlestickBarShape />}
                  isAnimationActive={false}
                />
              ) : (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tradeAreaGrad)"
                  isAnimationActive={false}
                />
              )}

              {/* Moving Average 7 */}
              {showMA && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma7"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Moving Average 25 */}
              {showMA && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="ma25"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Technical Sentiment & Depth Meter */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>RSI(14): <strong className="text-emerald-400">58.4</strong> (Bullish)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">62% Buy</span>
            <div className="w-16 h-1.5 bg-rose-500/40 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[62%]"></div>
            </div>
            <span className="text-rose-400">38% Sell</span>
          </div>
        </div>
      </div>

      {/* NovaBot AI Technical Instructor */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-2xl flex items-center justify-center ai-pulse">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                NovaBot Analyst <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </h3>
              <p className="text-[10px] text-slate-400">
                Grounded Analysis for {selectedPair.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchPairAdvice(selectedPair.symbol)}
            disabled={isBotThinking}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-all disabled:opacity-50"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isBotThinking ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div
          className={`bg-black/50 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed min-h-[50px] flex items-center ${
            isBotThinking ? 'animate-pulse text-cyan-300' : ''
          }`}
        >
          {isBotThinking ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              Evaluating candle setups and macro flows for {selectedPair.symbol}...
            </span>
          ) : (
            `"${advice.text}"`
          )}
        </div>

        {advice.sources.length > 0 && !isBotThinking && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {advice.sources.slice(0, 2).map((src: any, i: number) => (
              <a
                key={i}
                href={src.web?.uri || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg text-[9px] text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5 text-cyan-400" /> {src.web?.title || 'Market Source'}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Paper Trading Order Desk */}
      <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Paper Order Terminal
            </h3>
            <p className="text-[10px] text-slate-500">Practice risk-free with virtual simulator</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Virtual Balance</span>
            <span className="text-sm font-black font-mono text-cyan-400">
              ${paperBalance.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Order Amount Input & Quick Chips */}
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={orderAmountStr}
              onChange={e => setOrderAmountStr(e.target.value)}
              placeholder="50"
              className="w-full bg-black/60 border border-slate-800 rounded-2xl py-3 pl-8 pr-28 text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400">
              ≈ {coinEquivalent >= 1000 ? coinEquivalent.toFixed(0) : coinEquivalent.toFixed(selectedPair.baseDecimals > 2 ? 4 : 2)} {selectedPair.base}
            </span>
          </div>

          <div className="flex gap-2">
            {['25', '50', '100', '250'].map(chip => (
              <button
                key={chip}
                onClick={() => setOrderAmountStr(chip)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  orderAmountStr === chip
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ${chip}
              </button>
            ))}
            <button
              onClick={() => setOrderAmountStr(Math.max(paperBalance, 10).toFixed(0))}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-800 bg-black/40 text-amber-400 hover:bg-slate-800"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Buy & Sell Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handlePlaceOrder('buy')}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            BUY (Long) <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePlaceOrder('sell')}
            className="bg-rose-500 hover:bg-rose-400 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
          >
            SELL (Short) <TrendingDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Trade History & Active Positions */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Paper Positions & History
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {trades.length} {trades.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="space-y-2">
          {trades.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-slate-500">
              <CandleIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs">No active paper positions yet</p>
              <p className="text-[10px] text-slate-600 mt-1">
                Execute a trade above to test your market strategy!
              </p>
            </div>
          ) : (
            trades.map(trade => {
              const isBuy = trade.type === 'buy';
              const isProfit = trade.pnl > 0;
              const isLoss = trade.pnl < 0;

              return (
                <div
                  key={trade.id}
                  className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between animate-in slide-in-from-right-2 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="font-bold text-sm text-white">{trade.pair}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">
                      Entry: ${trade.price.toFixed(trade.price < 1 ? 5 : 2)} •{' '}
                      {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <p className="font-bold text-sm text-white">${trade.amount.toFixed(2)}</p>
                      <p
                        className={`text-[11px] font-black ${
                          isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {trade.status === 'pending'
                          ? 'Executing...'
                          : `${isProfit ? '+' : ''}$${trade.pnl.toFixed(2)}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleClosePosition(trade.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded-xl border border-slate-700 hover:text-white transition-colors"
                      title="Close Position"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* All Markets Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Select Crypto Pair</h3>
                <p className="text-xs text-slate-400">View real-time candlesticks</p>
              </div>
              <button
                onClick={() => setShowPairModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-1.5 hide-scrollbar">
              {CRYPTO_PAIRS.map(pair => (
                <button
                  key={pair.id}
                  onClick={() => {
                    setSelectedPairId(pair.id);
                    setShowPairModal(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between border transition-all ${
                    pair.id === selectedPair.id
                      ? 'bg-cyan-950/40 border-cyan-500'
                      : 'bg-black/30 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{pair.icon}</span>
                    <div className="text-left">
                      <p className="font-bold text-sm text-white flex items-center gap-1.5">
                        {pair.symbol}
                        {pair.category === 'TON Ecosystem' && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded font-bold">
                            TON
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">{pair.name}</p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="font-bold text-sm text-white">
                      {formatPrice(pair.basePrice, pair.baseDecimals)}
                    </p>
                    <p
                      className={`text-[10px] font-bold ${
                        pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </p>
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

export default TradeScreen;
