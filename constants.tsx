
import React from 'react';
import { Asset, Task } from './types';

export const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'US Dollar', symbol: 'USD', balance: 0.00, type: 'fiat', color: 'bg-green-500', icon: '🇺🇸' },
  { id: 'aud', name: 'AU Dollar', symbol: 'AUD', balance: 0.00, type: 'fiat', color: 'bg-blue-600', icon: '🇦🇺' },
  { id: '2', name: 'TON Coin', symbol: 'TON', balance: 12.50, type: 'crypto', color: 'bg-blue-400', icon: '💎' },
  { id: '3', name: 'Telegram Stars', symbol: '⭐️', balance: 50, type: 'star', color: 'bg-yellow-400', icon: '⭐️' },
  { id: '4', name: 'Nova Gems', symbol: 'GEM', balance: 420, type: 'gem', color: 'bg-purple-500', icon: '💜' },
];

export const DAILY_TASKS: Task[] = [
  { id: 't1', title: 'Daily Market Quiz', reward: 0.50, rewardType: 'USD', completed: false, category: 'quiz' },
  { id: 't2', title: 'Share AI Art', reward: 15, rewardType: 'GEMS', completed: false, category: 'share' },
  { id: 't3', title: 'Daily App Check-in', reward: 5, rewardType: 'GEMS', completed: true, category: 'checkin' },
];

export const NAV_ITEMS = [
  { id: 'home', label: 'Wallet', icon: 'Wallet' },
  { id: 'swap', label: 'OmniSwap', icon: 'RefreshCcw' },
  { id: 'engineering', label: 'Build', icon: 'Code' },
  { id: 'trade', label: 'Trade', icon: 'CandlestickChart' },
  { id: 'ailab', label: 'AI Lab', icon: 'Zap' },
  { id: 'mine', label: 'Mine', icon: 'Cpu' },
  { id: 'profile', label: 'More', icon: 'Menu' },
];

export const CRYPTO_PAIRS = [
  {
    id: 'TON-USD',
    symbol: 'TON/USD',
    name: 'Toncoin',
    base: 'TON',
    quote: 'USD',
    basePrice: 5.24,
    change24h: 3.42,
    volatility: 0.012,
    high24h: 5.48,
    low24h: 5.06,
    volume24h: '$42.8M',
    category: 'TON Ecosystem' as const,
    icon: '💎',
    baseDecimals: 2
  },
  {
    id: 'BTC-USD',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    base: 'BTC',
    quote: 'USD',
    basePrice: 67850,
    change24h: 2.15,
    volatility: 0.008,
    high24h: 68620,
    low24h: 66490,
    volume24h: '$1.42B',
    category: 'Major' as const,
    icon: '₿',
    baseDecimals: 2
  },
  {
    id: 'ETH-USD',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    base: 'ETH',
    quote: 'USD',
    basePrice: 2645,
    change24h: -1.04,
    volatility: 0.011,
    high24h: 2710,
    low24h: 2615,
    volume24h: '$780M',
    category: 'Major' as const,
    icon: '⟠',
    baseDecimals: 2
  },
  {
    id: 'SOL-USD',
    symbol: 'SOL/USD',
    name: 'Solana',
    base: 'SOL',
    quote: 'USD',
    basePrice: 154.20,
    change24h: 4.88,
    volatility: 0.016,
    high24h: 158.90,
    low24h: 147.30,
    volume24h: '$320M',
    category: 'Major' as const,
    icon: '◎',
    baseDecimals: 2
  },
  {
    id: 'NOT-USD',
    symbol: 'NOT/USD',
    name: 'Notcoin',
    base: 'NOT',
    quote: 'USD',
    basePrice: 0.00784,
    change24h: 8.45,
    volatility: 0.025,
    high24h: 0.00845,
    low24h: 0.00712,
    volume24h: '$18.2M',
    category: 'TON Ecosystem' as const,
    icon: '🪙',
    baseDecimals: 5
  },
  {
    id: 'DOGS-USD',
    symbol: 'DOGS/USD',
    name: 'DOGS',
    base: 'DOGS',
    quote: 'USD',
    basePrice: 0.000645,
    change24h: -2.85,
    volatility: 0.028,
    high24h: 0.000698,
    low24h: 0.000621,
    volume24h: '$12.4M',
    category: 'Meme' as const,
    icon: '🦴',
    baseDecimals: 6
  },
  {
    id: 'GEM-USD',
    symbol: 'GEM/USD',
    name: 'Nova Gems',
    base: 'GEM',
    quote: 'USD',
    basePrice: 0.0104,
    change24h: 14.20,
    volatility: 0.03,
    high24h: 0.0118,
    low24h: 0.0091,
    volume24h: '$2.1M',
    category: 'Nova' as const,
    icon: '💜',
    baseDecimals: 4
  }
];
