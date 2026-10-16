
export type AssetType = 'fiat' | 'token' | 'crypto' | 'star' | 'gem';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  type: AssetType;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  rewardType: 'USD' | 'GEMS';
  completed: boolean;
  category: 'quiz' | 'share' | 'checkin';
}

export interface Trade {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'profit' | 'loss' | 'pending';
  pnl: number;
  timestamp: number;
}

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  candleRange: [number, number];
  ma7?: number;
  ma25?: number;
}

export interface CryptoPairInfo {
  id: string;
  symbol: string;
  name: string;
  base: string;
  quote: string;
  basePrice: number;
  change24h: number;
  volatility: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  category: 'TON Ecosystem' | 'Major' | 'Nova' | 'Meme';
  icon: string;
  baseDecimals: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface ExternalApp {
  name: string;
  icon: string;
  unclaimed: number;
  assetId: string;
}

export interface MinerState {
  isActive: boolean;
  hashRate: number; // in GH/s
  level: number;
  energy: number; // 0-100
  totalMined: number;
  efficiency: number; // Energy drain multiplier (lower is better)
}

export interface PriceAlert {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  targetRate: number;
  direction: 'above' | 'below';
  createdAt: number;
  triggered?: boolean;
  triggeredAt?: number;
  currentPriceAtCreation?: number;
  note?: string;
  enabled?: boolean;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: number;
  assetSymbol?: string;
  targetPrice?: number;
  direction?: 'above' | 'below';
  read?: boolean;
  alertId?: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'mine' | 'reward';
  assetSymbol: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
}

export interface QuantificationReport {
  summary: string;
  efficiencyScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  diversificationIndex: number;
  aiAdvice: string;
  growthPotential: number;
}

export interface Achievement {
  id: string;
  user: string;
  title: string;
  type: 'gain' | 'mine' | 'trade' | 'creative';
  timestamp: number;
}

export type SmartContractChain = 'TON' | 'SOL' | 'EVM' | 'SUI' | 'NOVA';
export type ContractTemplateType = 'token' | 'meme' | 'ai_agent' | 'nft' | 'vault';

export interface SmartContractProject {
  id: string;
  name: string;
  symbol: string;
  chain: SmartContractChain;
  template: ContractTemplateType;
  supply: number;
  decimals: number;
  contractAddress: string;
  txHash: string;
  logoUrl?: string;
  description: string;
  status: 'draft' | 'compiling' | 'deployed';
  timestamp: number;
  features: string[];
  compilerVersion: string;
  gasCostEst: string;
}

export interface TokenPicTheme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  icon: string;
  badge: string;
  promptModifier: string;
}

export interface ViralCampaign {
  id: string;
  title: string;
  hook: string;
  content: string;
  platform: 'twitter' | 'telegram' | 'tiktok';
  viralScore: number;
  tags: string[];
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
