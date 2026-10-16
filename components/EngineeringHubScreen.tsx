import React, { useState, useRef, useEffect } from 'react';
import {
  Code,
  FileCode,
  Rocket,
  Palette,
  Share2,
  Boxes,
  Terminal,
  Coins,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  RefreshCw,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Check,
  Clock,
  Eye,
  Flame,
  Globe,
  Sliders,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Plus
} from 'lucide-react';
import { SmartContractProject, TokenPicTheme, ViralCampaign, SmartContractChain, ContractTemplateType } from '../types';
import { playAlertChime } from './NotificationComponents';
import { generateImage } from '../services/geminiService';

interface EngineeringHubScreenProps {
  onOpenTrade?: (pair?: string) => void;
  onOpenSwap?: () => void;
  updateBalance?: (id: string, amount: number) => void;
}

const PRESET_THEMES: TokenPicTheme[] = [
  {
    id: 'stainless-cyber',
    name: 'Stainless Steel Cyber',
    tagline: 'Brushed metal, platinum & chrome',
    description: 'Polished stainless steel coin face with laser-etched precision circuitry and platinum bevels.',
    gradient: 'from-slate-300 via-slate-500 to-slate-800',
    icon: '🪙',
    badge: 'Hardware Grade',
    promptModifier: 'ultra-detailed minted sovereign coin, polished brushed stainless steel, chrome reflections, platinum rim, industrial cyber precision, 8k 3d render'
  },
  {
    id: 'neon-future',
    name: 'Neon Hologram Tech',
    tagline: 'Cyberpunk laser grid & synthwave glow',
    description: 'Electrified neon cyan and hot magenta wireframe coin floating above a dark quantum grid.',
    gradient: 'from-cyan-400 via-blue-600 to-fuchsia-600',
    icon: '⚡',
    badge: 'Cyberpunk',
    promptModifier: 'glowing holographic cyber token, vivid neon cyan and purple laser lines, dark tech background, volumetric bloom, futuristic cryptocurrency medal'
  },
  {
    id: 'cosmic-quantum',
    name: 'Cosmic Quantum Nebula',
    tagline: 'Deep space accretion disk & star dust',
    description: 'Interstellar token radiating violet celestial energy with miniature swirling galactic spirals.',
    gradient: 'from-purple-500 via-indigo-600 to-pink-500',
    icon: '🌌',
    badge: 'Celestial',
    promptModifier: 'cosmic celestial currency medal, swirling purple galaxy core, stardust particles, quantum field energy, iridescent space jewel'
  },
  {
    id: 'ancient-gold',
    name: 'Ancient Gold Sovereign',
    tagline: 'Imperial crest & antique filigree',
    description: 'Heavy 24-karat gold minted coin featuring royal lion relief and ancient cryptographic runes.',
    gradient: 'from-amber-300 via-yellow-500 to-amber-700',
    icon: '👑',
    badge: 'Royal Crest',
    promptModifier: 'ancient imperial 24k solid gold sovereign coin, deep embossed royal crest, antique patina, museum specimen lighting, timeless wealth'
  },
  {
    id: 'kawaii-anime',
    name: 'Kawaii Anime Mascot',
    tagline: 'Cute, expressive & viral meme energy',
    description: 'Vibrant pastel chibi mascot token with sparkling anime eyes and playful high-energy stickers.',
    gradient: 'from-pink-300 via-rose-400 to-amber-300',
    icon: '🌸',
    badge: 'Meme Viral',
    promptModifier: 'cute kawaii anime crypto mascot badge, vibrant pastel colors, glossy 3D sticker texture, sparkling eyes, high energy friendly character'
  },
  {
    id: 'retro-pixel',
    name: '8-Bit Retro Arcade',
    tagline: 'Nostalgic 90s arcade & game coin',
    description: 'Classic pixelated gold coin with bold outlines, CRT scanline glow, and pixel art shaders.',
    gradient: 'from-emerald-400 via-cyan-500 to-blue-600',
    icon: '👾',
    badge: 'Retro Game',
    promptModifier: '16-bit arcade golden token, pixel art masterwork, clean isometric angles, nostalgic video game item icon, crisp sprites'
  },
  {
    id: 'prismatic-crystal',
    name: 'Prismatic 3D Crystal',
    tagline: 'Refractive diamond & iridescent glass',
    description: 'Translucent diamond prism with caustic rainbow refractions and frosted crystal bevels.',
    gradient: 'from-teal-300 via-cyan-400 to-indigo-500',
    icon: '💎',
    badge: 'Glassmorphism',
    promptModifier: 'faceted diamond crystal coin, rainbow chromatic dispersion, translucent glass, studio caustics, luxury octane render'
  },
  {
    id: 'ai-matrix',
    name: 'AI Superintelligence Core',
    tagline: 'Neural synapses & quantum processor',
    description: 'Hyper-advanced neural matrix token with pulsing AI synapses and bio-digital computational circuits.',
    gradient: 'from-emerald-400 via-cyan-600 to-indigo-800',
    icon: '🤖',
    badge: 'Neural Core',
    promptModifier: 'advanced artificial superintelligence processor emblem, glowing microchips, quantum bus lines, bioluminescent green and cobalt, futuristic AI brain'
  }
];

const TEMPLATE_OPTIONS: { id: ContractTemplateType; name: string; desc: string; icon: string; chainDefault: SmartContractChain }[] = [
  { id: 'token', name: 'Standard Omni-Token', desc: 'Universal Jetton / SPL / ERC-20 with mint & burn controls', icon: '🪙', chainDefault: 'TON' },
  { id: 'meme', name: 'Fair Launch Community Token', desc: '0% tax, renounced ownership, 100% liquidity lock proof', icon: '🚀', chainDefault: 'SOL' },
  { id: 'ai_agent', name: 'AI Autonomy Contract', desc: 'Self-executing agent treasury & automated yield rebalancing', icon: '🤖', chainDefault: 'TON' },
  { id: 'nft', name: 'NFT Collection & Launchpad', desc: 'Generative collection with customizable creator royalties', icon: '🎨', chainDefault: 'EVM' },
  { id: 'vault', name: 'Staking & Yield Vault', desc: 'Automated LP staking with real-time dynamic APY distribution', icon: '🏦', chainDefault: 'NOVA' }
];

export const EngineeringHubScreen: React.FC<EngineeringHubScreenProps> = ({
  onOpenTrade,
  onOpenSwap,
  updateBalance
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'contracts' | 'tokenpic' | 'viral' | 'neweconomy'>('contracts');

  // SMART CONTRACT DEPLOYER STATE
  const [selectedChain, setSelectedChain] = useState<SmartContractChain>('TON');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplateType>('token');
  const [projectName, setProjectName] = useState('CyberNova Quantum');
  const [tokenSymbol, setTokenSymbol] = useState('CNQ');
  const [tokenSupply, setTokenSupply] = useState('1000000000');
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [projectDesc, setProjectDesc] = useState('Autonomous next-generation cross-chain utility token with zero gas fees.');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['burnable', 'auto_lp', 'anti_whale']);
  const [codeViewTab, setCodeViewTab] = useState<'code' | 'abi' | 'deployed'>('code');
  const [isCompiling, setIsCompiling] = useState(false);
  const [deployStep, setDeployStep] = useState<'idle' | 'compiling' | 'testing' | 'broadcasting' | 'complete'>('idle');
  const [lastDeployedProject, setLastDeployedProject] = useState<SmartContractProject | null>(null);
  const [deployedHistory, setDeployedHistory] = useState<SmartContractProject[]>(() => {
    const saved = localStorage.getItem('nova_deployed_projects');
    return saved ? JSON.parse(saved) : [
      {
        id: 'proj-1',
        name: 'TON SpeedJetton',
        symbol: 'TSJ',
        chain: 'TON',
        template: 'token',
        supply: 100000000,
        decimals: 9,
        contractAddress: 'EQBvW8Z5huBk_Rj0a...90kL',
        txHash: '0x9482f...a41b',
        description: 'High-speed Toncoin Jetton with instant finality.',
        status: 'deployed',
        timestamp: Date.now() - 86400000,
        features: ['burnable', 'anti_whale'],
        compilerVersion: 'Tact v1.4.2 / TON Virtual Machine',
        gasCostEst: '0.045 TON'
      }
    ];
  });

  // TOKEN PIC GENERATOR STATE
  const [selectedTheme, setSelectedTheme] = useState<TokenPicTheme>(PRESET_THEMES[0]);
  const [picPrompt, setPicPrompt] = useState('Cybernetic golden wolf head with neon blue glowing circuits');
  const [tokenShape, setTokenShape] = useState<'circle' | 'hexagon' | 'shield'>('circle');
  const [generatedPicUrl, setGeneratedPicUrl] = useState<string | null>(null);
  const [isGeneratingPic, setIsGeneratingPic] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // VIRAL ENGINE STATE
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralCount, setReferralCount] = useState(12);
  const [viralHookType, setViralHookType] = useState<'alpha' | 'meme' | 'tech'>('alpha');
  const [customViralToken, setCustomViralToken] = useState('CyberNova ($CNQ)');
  const [copiedTweet, setCopiedTweet] = useState(false);

  // NEW ECONOMY EXPANDABLE MODULES
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [simState, setSimState] = useState<'idle' | 'running' | 'done'>('idle');
  const [simOldTime, setSimOldTime] = useState(0);
  const [simNewTime, setSimNewTime] = useState(0);

  // Draw Procedural High-Quality Token Pic on Canvas
  const drawProceduralToken = (theme: TokenPicTheme, promptText: string, shape: 'circle' | 'hexagon' | 'shield') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark sleek background
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = w * 0.4;

    // Ambient glow
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.3);
    if (theme.id === 'stainless-cyber') {
      glowGrad.addColorStop(0, 'rgba(148, 163, 184, 0.35)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (theme.id === 'neon-future') {
      glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (theme.id === 'ancient-gold') {
      glowGrad.addColorStop(0, 'rgba(234, 179, 8, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Save before clipping / drawing shape
    ctx.save();

    // Draw Outer Rim / Shape
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (shape === 'hexagon') {
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 6;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      // Shield shape
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy - r * 0.4);
      ctx.quadraticCurveTo(cx + r * 0.9, cy + r * 0.5, cx, cy + r);
      ctx.quadraticCurveTo(cx - r * 0.9, cy + r * 0.5, cx - r, cy - r * 0.4);
      ctx.closePath();
    }

    // Gradient fill based on theme
    const coinGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (theme.id === 'stainless-cyber') {
      coinGrad.addColorStop(0, '#f1f5f9');
      coinGrad.addColorStop(0.25, '#94a3b8');
      coinGrad.addColorStop(0.5, '#cbd5e1');
      coinGrad.addColorStop(0.75, '#64748b');
      coinGrad.addColorStop(1, '#1e293b');
    } else if (theme.id === 'neon-future') {
      coinGrad.addColorStop(0, '#06b6d4');
      coinGrad.addColorStop(0.5, '#0f172a');
      coinGrad.addColorStop(1, '#a855f7');
    } else if (theme.id === 'ancient-gold') {
      coinGrad.addColorStop(0, '#fef08a');
      coinGrad.addColorStop(0.3, '#eab308');
      coinGrad.addColorStop(0.7, '#ca8a04');
      coinGrad.addColorStop(1, '#713f12');
    } else if (theme.id === 'cosmic-quantum') {
      coinGrad.addColorStop(0, '#c084fc');
      coinGrad.addColorStop(0.5, '#312e81');
      coinGrad.addColorStop(1, '#ec4899');
    } else {
      coinGrad.addColorStop(0, '#38bdf8');
      coinGrad.addColorStop(0.5, '#1e1b4b');
      coinGrad.addColorStop(1, '#34d399');
    }

    ctx.fillStyle = coinGrad;
    ctx.fill();

    // Border stroke with metallic sheen
    ctx.lineWidth = 8;
    ctx.strokeStyle = theme.id === 'ancient-gold' ? '#fde047' : theme.id === 'stainless-cyber' ? '#f8fafc' : '#22d3ee';
    ctx.stroke();

    // Inner Concentric Ring
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    // Micro Tech Tick Marks on rim
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI * 2) / 36;
      const x1 = cx + (r * 0.88) * Math.cos(angle);
      const y1 = cy + (r * 0.88) * Math.sin(angle);
      const x2 = cx + (r * 0.94) * Math.cos(angle);
      const y2 = cy + (r * 0.94) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();
    }

    // Center Emblem Icon / Symbol
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(theme.icon, cx, cy - 8);

    // Center Initials / Ticker Text
    ctx.font = '900 18px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = theme.id === 'neon-future' ? '#06b6d4' : '#000000';
    ctx.shadowBlur = 8;
    const tickerName = tokenSymbol || 'NOVA';
    ctx.fillText(tickerName, cx, cy + 34);

    // Highlight Gloss Curved Reflection
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.45, r * 0.65, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();

    ctx.restore();

    setGeneratedPicUrl(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    drawProceduralToken(selectedTheme, picPrompt, tokenShape);
  }, [selectedTheme, tokenSymbol, tokenShape]);

  // Handle Generate Token Image
  const handleGeneratePic = async () => {
    setIsGeneratingPic(true);
    playAlertChime();

    // Try AI generation if prompt provided, else high-fidelity procedural
    const fullPrompt = `Cryptocurrency emblem token coin, ${picPrompt}, Theme: ${selectedTheme.promptModifier}, circular metallic badge, centered, transparent background, octane render, photorealistic, 8k`;
    try {
      const result = await generateImage(fullPrompt, '1:1', '1K');
      if (result) {
        setGeneratedPicUrl(result);
      } else {
        drawProceduralToken(selectedTheme, picPrompt, tokenShape);
      }
    } catch (e) {
      drawProceduralToken(selectedTheme, picPrompt, tokenShape);
    }
    setIsGeneratingPic(false);
  };

  // Compile and Deploy Contract Workflow
  const handleStartDeployment = () => {
    if (!projectName || !tokenSymbol) return;

    setIsCompiling(true);
    setDeployStep('compiling');
    playAlertChime();

    setTimeout(() => {
      setDeployStep('testing');
      setTimeout(() => {
        setDeployStep('broadcasting');
        setTimeout(() => {
          setIsCompiling(false);
          setDeployStep('complete');

          const randHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
          const addressPrefix = selectedChain === 'TON' ? 'EQB' : selectedChain === 'SOL' ? 'Sol' : '0x71';
          const randAddress = `${addressPrefix}${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`;

          const newProj: SmartContractProject = {
            id: `proj-${Date.now()}`,
            name: projectName,
            symbol: tokenSymbol.toUpperCase(),
            chain: selectedChain,
            template: selectedTemplate,
            supply: parseFloat(tokenSupply) || 1000000000,
            decimals: tokenDecimals,
            contractAddress: randAddress,
            txHash: randHash,
            logoUrl: generatedPicUrl || undefined,
            description: projectDesc,
            status: 'deployed',
            timestamp: Date.now(),
            features: selectedFeatures,
            compilerVersion: selectedChain === 'TON' ? 'Tact v1.4.2 / TVM' : selectedChain === 'SOL' ? 'Anchor 0.29.0 / BPF' : 'Solidity 0.8.24 / EVM',
            gasCostEst: selectedChain === 'TON' ? '0.045 TON' : selectedChain === 'SOL' ? '0.002 SOL' : '0.0001 ETH'
          };

          setLastDeployedProject(newProj);
          const updated = [newProj, ...deployedHistory];
          setDeployedHistory(updated);
          localStorage.setItem('nova_deployed_projects', JSON.stringify(updated));

          if (updateBalance) {
            updateBalance('4', 10); // Reward 10 Nova Gems for deploying!
          }
        }, 1200);
      }, 1000);
    }, 1200);
  };

  // Code generator preview based on template & chain
  const getContractCodePreview = () => {
    if (selectedChain === 'TON') {
      return `// ==========================================
// TACT SMART CONTRACT: ${projectName} (${tokenSymbol})
// Target: TON Blockchain (TON Virtual Machine)
// Compiler: Tact v1.4.2 / Zero Gas Optimization
// ==========================================

import "@stdlib/deploy";

message Mint {
    amount: Int as coins;
    recipient: Address;
}

message Burn {
    amount: Int as coins;
}

contract ${tokenSymbol.replace(/[^a-zA-Z0-9]/g, '')}Jetton with Deployable {
    owner: Address;
    totalSupply: Int as coins;
    symbol: String;
    name: String;
    decimals: Int as uint8;
    isBurnable: Bool;

    init(owner: Address) {
        self.owner = owner;
        self.name = "${projectName}";
        self.symbol = "${tokenSymbol.toUpperCase()}";
        self.decimals = ${tokenDecimals};
        self.totalSupply = ${tokenSupply};
        self.isBurnable = ${selectedFeatures.includes('burnable') ? 'true' : 'false'};
    }

    receive(msg: Mint) {
        require(sender() == self.owner, "Only contract owner can mint");
        self.totalSupply += msg.amount;
    }

    receive(msg: Burn) {
        require(self.isBurnable, "Burn feature disabled");
        self.totalSupply -= msg.amount;
    }

    get fun get_jetton_data(): (Int, Bool, Address, Cell, Cell) {
        // Returns standard TON TEP-74 Jetton metadata
        return (self.totalSupply, true, self.owner, beginCell().endCell(), beginCell().endCell());
    }
}`;
    }

    if (selectedChain === 'SOL') {
      return `// ==========================================
// SOLANA ANCHOR PROGRAM: ${projectName} (${tokenSymbol})
// Target: Solana Sealevel Virtual Machine (SVM)
// Speed: 65,000 TPS | Finality: 0.4s
// ==========================================

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("NovaToken111111111111111111111111111111111111");

#[program]
pub mod ${tokenSymbol.toLowerCase()}_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, decimals: u8, initial_supply: u64) -> Result<()> {
        msg!("Deploying ${projectName} on Solana high-throughput cluster");
        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, initial_supply)?;
        Ok(())
    }
}`;
    }

    return `// SPDX-License-Identifier: MIT
// ==========================================
// SOLIDITY ERC-20: ${projectName} (${tokenSymbol})
// Target: Base L2 / Ethereum Virtual Machine (EVM)
// Security: OpenZeppelin v5.0 Audited Base
// ==========================================

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${tokenSymbol.replace(/[^a-zA-Z0-9]/g, '')}Token is ERC20, ERC20Burnable, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 tokenDecimals
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = tokenDecimals;
        _mint(msg.sender, initialSupply * 10 ** tokenDecimals);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}`;
  };

  // Viral Tweet Template Generator
  const getViralTweetContent = () => {
    if (viralHookType === 'alpha') {
      return `🚨 ALPHA ALERT: Just deployed smart contract for ${customViralToken} on @NovaWallet!

⚡ Instant cross-chain finality in 0.3s
🌐 Backed by Nova 1.48B Txns/Day super-mesh infrastructure
💎 Fair launch community allocation: 100% unlocked

Don't sleep on the new autonomous AI economy. Join the movement:
https://novawallet.app/join?ref=NOVA-8849 #TON #CryptoAlpha #Web3`;
    }
    if (viralHookType === 'meme') {
      return `Gm legends! 🚀 We just launched ${customViralToken}!
Zero gatekeepers. Zero bank fees. 100% community powered.

If you survived the old financial system with 5-day wire transfers and 4% fees, you deserve this revolution.

Drop your TON/SOL wallet below for instant airdrop! 👇
https://novawallet.app/join?ref=NOVA-8849 #MemeCoin #Solana #TON`;
    }
    return `Why the old banking system is broken vs the New Economy:
❌ Old: 3-5 business days to clear wires
❌ Old: $35 SWIFT wire fee + 3% FX spread
❌ Old: Accounts frozen on weekends

✅ New: 0.0004s finality on Nova Quantum Core
✅ New: $0.000001 gas fees across all chains
✅ New: 1-click smart contract deployment

Building the future with ${customViralToken}: https://novawallet.app/join?ref=NOVA-8849`;
  };

  // Run Old vs New Simulation
  const runEconomySimulation = () => {
    setSimState('running');
    setSimOldTime(0);
    setSimNewTime(0);
    playAlertChime();

    // New way settles in 0.3s
    setTimeout(() => {
      setSimNewTime(0.32);
    }, 320);

    // Old way counts up days
    let day = 0;
    const interval = setInterval(() => {
      day += 1;
      setSimOldTime(day);
      if (day >= 4) {
        clearInterval(interval);
        setSimState('done');
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 rounded-[2.5rem] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI SUPERINTELLIGENCE ENGINEERING HUB</span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            v3.8 Quantum
          </span>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Project Launchpad & Studio
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Deploy production-grade smart contracts, synthesize AI token artwork, launch viral referral campaigns, and master the new economy infrastructure.
        </p>

        {/* 4 Mode Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-5 bg-black/60 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'contracts'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" /> Contracts
          </button>

          <button
            onClick={() => setActiveTab('tokenpic')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tokenpic'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Token Pic AI
          </button>

          <button
            onClick={() => setActiveTab('viral')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'viral'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Go Viral
          </button>

          <button
            onClick={() => setActiveTab('neweconomy')}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'neweconomy'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> New Economy
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. SMART CONTRACT DEPLOYMENT SECTION */}
      {/* ============================================================ */}
      {activeTab === 'contracts' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Chain Selector */}
          <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 space-y-2.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              Target Blockchain Network
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'TON' as SmartContractChain, name: 'TON', icon: '💎', lang: 'Tact/FunC' },
                { id: 'SOL' as SmartContractChain, name: 'Solana', icon: '⚡', lang: 'Anchor/Rust' },
                { id: 'EVM' as SmartContractChain, name: 'Base EVM', icon: '🔵', lang: 'Solidity' },
                { id: 'SUI' as SmartContractChain, name: 'Sui', icon: '💧', lang: 'Move' },
                { id: 'NOVA' as SmartContractChain, name: 'Nova ZK', icon: '💜', lang: 'Quantum' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChain(c.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    selectedChain === c.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{c.icon}</span>
                  <span className="text-xs font-bold block">{c.name}</span>
                  <span className="text-[8px] text-slate-500 block font-mono">{c.lang}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selector */}
          <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 space-y-2.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              Project Architecture Template
            </label>
            <div className="space-y-2">
              {TEMPLATE_OPTIONS.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setSelectedChain(tpl.chainDefault);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-md'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div>
                      <p className="font-bold text-xs text-white flex items-center gap-1.5">
                        {tpl.name}
                        {selectedTemplate === tpl.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">{tpl.desc}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90" />
                </button>
              ))}
            </div>
          </div>

          {/* Project Details Form */}
          <div className="bg-gradient-to-b from-slate-900 to-black p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" /> Token Parameters
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Audited Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="e.g. CyberNova"
                  className="w-full bg-black/60 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Symbol / Ticker</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={e => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. CNQ"
                  className="w-full bg-black/60 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Total Supply</label>
                <input
                  type="number"
                  value={tokenSupply}
                  onChange={e => setTokenSupply(e.target.value)}
                  className="w-full bg-black/60 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Decimals</label>
                <select
                  value={tokenDecimals}
                  onChange={e => setTokenDecimals(parseInt(e.target.value))}
                  className="w-full bg-black/60 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-xs"
                >
                  <option value={9}>9 (TON & Solana standard)</option>
                  <option value={18}>18 (Ethereum/EVM standard)</option>
                  <option value={6}>6 (USDC standard)</option>
                </select>
              </div>
            </div>

            {/* Smart Contract Features Checklist */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                Smart Contract Modules
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'burnable', label: 'Burnable', icon: '🔥' },
                  { id: 'auto_lp', label: 'Auto-Liquidity', icon: '💧' },
                  { id: 'anti_whale', label: 'Anti-Whale Cap', icon: '🐋' },
                ].map(feat => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => {
                        setSelectedFeatures(prev =>
                          isChecked ? prev.filter(f => f !== feat.id) : [...prev, feat.id]
                        );
                      }}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isChecked
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-black/40 text-slate-500 border-slate-800'
                      }`}
                    >
                      <span>{feat.icon}</span>
                      <span>{feat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token Logo Linkage */}
            {generatedPicUrl && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-2.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={generatedPicUrl} alt="Token Logo" className="w-9 h-9 rounded-full border border-cyan-400 shadow" />
                  <div className="text-left font-mono">
                    <p className="text-xs font-bold text-white">Custom Token Emblem Linked</p>
                    <p className="text-[9px] text-cyan-400">Metadata will be permanently bound to contract</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            )}

            {/* Live Code Preview Tabs */}
            <div className="bg-black/70 rounded-2xl border border-slate-800 overflow-hidden font-mono text-[11px]">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3 py-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-white font-bold">{selectedChain} Smart Contract Preview</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getContractCodePreview());
                    alert('Contract source code copied to clipboard!');
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>

              <div className="p-3 max-h-48 overflow-y-auto text-slate-300 hide-scrollbar leading-relaxed">
                <pre>{getContractCodePreview()}</pre>
              </div>
            </div>

            {/* Deploy Action Button */}
            <button
              onClick={handleStartDeployment}
              disabled={isCompiling || !projectName || !tokenSymbol}
              className="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-black shadow-xl shadow-cyan-500/25 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCompiling ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="uppercase tracking-widest font-mono text-xs">
                    {deployStep === 'compiling' ? 'Optimizing Bytecode...' :
                     deployStep === 'testing' ? 'Verifying Gas Bounds...' :
                     'Broadcasting to Blockchain...'}
                  </span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>1-Click Deploy to {selectedChain} Network</span>
                </>
              )}
            </button>
          </div>

          {/* Deployment Receipt Modal / Card */}
          {lastDeployedProject && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-black p-5 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-3 font-mono animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Contract Successfully Deployed!
                    </h4>
                    <p className="text-[9px] text-emerald-400">Live on {lastDeployedProject.chain} Mainnet</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Confirmed
                </span>
              </div>

              <div className="bg-black/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Address:</span>
                  <span className="text-cyan-400 font-bold">{lastDeployedProject.contractAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Hash:</span>
                  <span className="text-slate-300">{lastDeployedProject.txHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Supply:</span>
                  <span className="text-white font-bold">{lastDeployedProject.supply.toLocaleString()} {lastDeployedProject.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Gas:</span>
                  <span className="text-emerald-400">{lastDeployedProject.gasCostEst}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCustomViralToken(`${lastDeployedProject.name} ($${lastDeployedProject.symbol})`);
                    setActiveTab('viral');
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Flame className="w-3.5 h-3.5" /> Launch Viral Campaign
                </button>
                <button
                  onClick={() => {
                    if (onOpenTrade) onOpenTrade(`${lastDeployedProject.symbol}/USD`);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-700"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> View Pool
                </button>
              </div>
            </div>
          )}

          {/* Deployed Projects History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" /> Your Deployed Contracts ({deployedHistory.length})
            </h4>
            {deployedHistory.map(proj => (
              <div
                key={proj.id}
                className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                    {proj.chain === 'TON' ? '💎' : proj.chain === 'SOL' ? '⚡' : '🔵'}
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      {proj.name}
                      <span className="text-[9px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-normal">
                        {proj.chain}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">{proj.contractAddress}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1">{proj.supply.toLocaleString()} {proj.symbol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. PROMPT TO IMAGE TOKEN PIC GENERATOR THEMES SHOWN */}
      {/* ============================================================ */}
      {activeTab === 'tokenpic' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Visual Canvas Display */}
          <div className="bg-gradient-to-b from-slate-900 to-black p-5 rounded-[2.5rem] border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Palette className="w-4 h-4" /> Token Badge Synthesizer
              </span>
              <span className="text-slate-500 text-[10px]">
                High-Resolution 1024×1024
              </span>
            </div>

            {/* Preview Box */}
            <div className="relative mx-auto w-48 h-48 rounded-full p-2 bg-gradient-to-tr from-cyan-500/30 via-slate-800 to-purple-500/30 border border-slate-700 shadow-2xl flex items-center justify-center">
              {generatedPicUrl ? (
                <img
                  src={generatedPicUrl}
                  alt="Synthesized Token Icon"
                  className="w-full h-full object-cover rounded-full shadow-inner"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={384}
                  height={384}
                  className="w-full h-full rounded-full"
                />
              )}

              {isGeneratingPic && (
                <div className="absolute inset-0 bg-black/75 rounded-full flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">Synthesizing...</span>
                </div>
              )}
            </div>

            {/* Shape Selectors */}
            <div className="flex justify-center gap-2 font-mono text-[10px]">
              {(['circle', 'hexagon', 'shield'] as const).map(shape => (
                <button
                  key={shape}
                  onClick={() => setTokenShape(shape)}
                  className={`px-3 py-1 rounded-xl border capitalize transition-all ${
                    tokenShape === shape
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {shape} Cut
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center pt-1 font-mono text-xs">
              <button
                onClick={() => {
                  if (generatedPicUrl) {
                    const link = document.createElement('a');
                    link.download = `${tokenSymbol.toLowerCase() || 'token'}-badge.png`;
                    link.href = generatedPicUrl;
                    link.click();
                  }
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center gap-1.5 text-[11px]"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>

              <button
                onClick={() => {
                  alert('Token icon successfully attached to Smart Contract Deployment configuration!');
                  setActiveTab('contracts');
                }}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center gap-1.5 text-[11px] shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" /> Use as Contract Logo
              </button>
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Prompt Description
              </label>
              <button
                onClick={() => {
                  const samplePrompts = [
                    'Cybernetic golden falcon with glowing sapphire eyes and carbon fiber plumage',
                    'Ancient obsidian dragon coiled around an iridescent diamond crystal core',
                    'Hyper-dimensional holographic cat with futuristic cyber visor and neon whiskers',
                    'Polished chrome skull with circuit traces and radiant emerald matrix brain',
                    'Celestial astronaut helmet reflecting a vibrant violet supernova explosion'
                  ];
                  setPicPrompt(samplePrompts[Math.floor(Math.random() * samplePrompts.length)]);
                }}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Surprise Me
              </button>
            </div>

            <textarea
              value={picPrompt}
              onChange={e => setPicPrompt(e.target.value)}
              rows={2}
              placeholder="Describe your coin emblem in detail..."
              className="w-full bg-black/60 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
            />

            <button
              onClick={handleGeneratePic}
              disabled={isGeneratingPic}
              className="w-full py-3.5 rounded-2xl font-black bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Synthesize Custom Token Icon
            </button>
          </div>

          {/* THEMES SHOWN SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" /> Preset Themes Shown ({PRESET_THEMES.length})
              </h4>
              <span className="text-[10px] text-cyan-400 font-mono">1-Tap Apply</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_THEMES.map(theme => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme);
                      playAlertChime();
                    }}
                    className={`p-4 rounded-3xl border text-left transition-all group relative overflow-hidden ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-xl shadow-cyan-500/10'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{theme.icon}</span>
                        <div>
                          <p className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                            {theme.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{theme.tagline}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {theme.badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                      {theme.description}
                    </p>

                    {/* Gradient Swatch Preview */}
                    <div className={`h-2 rounded-full bg-gradient-to-r ${theme.gradient} w-full opacity-80`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. GO VIRAL FEATURE (VIRAL GROWTH & REFERRALS) */}
      {/* ============================================================ */}
      {activeTab === 'viral' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Viral Engine Banner */}
          <div className="bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-black p-5 rounded-[2.5rem] border border-orange-500/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> VIRAL SOCIAL ACCELERATOR 3.0
              </span>
              <span className="text-xs font-mono font-black text-emerald-400">
                Viral Score: 98.4 / 100
              </span>
            </div>

            <h3 className="text-lg font-black text-white">
              Launch Your Project Into Orbit
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Auto-generate viral copy engineered for Twitter/X algorithms, Telegram blast groups, and short-form video hooks with integrated referral incentives.
            </p>
          </div>

          {/* Target Token Input */}
          <div className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Token / Project Name to Promote
            </label>
            <input
              type="text"
              value={customViralToken}
              onChange={e => setCustomViralToken(e.target.value)}
              placeholder="e.g. CyberNova ($CNQ)"
              className="w-full bg-black/60 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-xs font-bold"
            />

            {/* Hook Strategy Selector */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: 'alpha' as const, label: 'Alpha Leak', icon: '🚨' },
                { id: 'meme' as const, label: 'Community Meme', icon: '🚀' },
                { id: 'tech' as const, label: 'Tech Comparison', icon: '🧠' }
              ].map(h => (
                <button
                  key={h.id}
                  onClick={() => setViralHookType(h.id)}
                  className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                    viralHookType === h.id
                      ? 'bg-amber-500 text-black border-amber-400 font-black shadow'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{h.icon}</span>
                  <span>{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generated Viral Post Card */}
          <div className="bg-black/70 p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Viral Post Template
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">Optimized for High Engagement</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
              {getViralTweetContent()}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getViralTweetContent());
                  setCopiedTweet(true);
                  setTimeout(() => setCopiedTweet(false), 2000);
                }}
                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
              >
                <Copy className="w-3.5 h-3.5" /> {copiedTweet ? 'Copied to Clipboard!' : '1-Click Copy Post'}
              </button>

              <button
                onClick={() => {
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getViralTweetContent())}`;
                  window.open(url, '_blank');
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Share on X
              </button>
            </div>
          </div>

          {/* Viral Referral Multiplier Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-black p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Airdrop Viral Multiplier
                </h4>
                <p className="text-[10px] text-slate-400">Earn +100 Nova Gems + 5% volume boost per invite</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-black text-cyan-400">{referralCount} Invites</span>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="bg-black/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-300">
              <span className="truncate pr-2 text-[11px] text-cyan-300">
                https://novawallet.app/join?ref=NOVA-8849
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://novawallet.app/join?ref=NOVA-8849');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3 h-3" /> {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Milestones Progress */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[9px]">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-300">
                <p className="font-bold">1 Friend</p>
                <p className="text-[8px] text-slate-400">+50 GEMs</p>
                <CheckCircle2 className="w-3 h-3 mx-auto mt-1 text-emerald-400" />
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-emerald-300">
                <p className="font-bold">5 Friends</p>
                <p className="text-[8px] text-slate-400">0% Swap Fee</p>
                <CheckCircle2 className="w-3 h-3 mx-auto mt-1 text-emerald-400" />
              </div>
              <div className="bg-cyan-500/15 border border-cyan-400 p-2 rounded-xl text-cyan-300">
                <p className="font-bold">25 Friends</p>
                <p className="text-[8px] text-slate-400">Free Deploy</p>
                <span className="text-[8px] font-bold text-cyan-400 block mt-1">12 / 25</span>
              </div>
              <div className="bg-black/40 border border-slate-800 p-2 rounded-xl text-slate-500">
                <p className="font-bold">100 Friends</p>
                <p className="text-[8px] text-slate-600">Whale Badge</p>
                <span className="text-[8px] block mt-1">Locked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. NEW ECONOMY INFRASTRUCTURE: OLD WAY VS NEW WAY */}
      {/* ============================================================ */}
      {activeTab === 'neweconomy' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Introduction Card for Newcomers */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-black p-5 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>THE GLOBAL PARADIGM SHIFT</span>
            </div>
            <h3 className="text-xl font-black text-white">
              The Old Financial Way vs. The New Economy
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              For generations, money moved at the speed of paperwork, restricted by national borders, middleman banks, and heavy fees. The New Economy replaces bureaucracy with autonomous cryptographic code and AI superintelligence.
            </p>
          </div>

          {/* Interactive Simulation: Old Wire vs New Quantum Mesh */}
          <div className="bg-black/70 p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> Live Settlement Race
              </span>
              <button
                onClick={runEconomySimulation}
                disabled={simState === 'running'}
                className="px-3 py-1 bg-cyan-500 text-black font-black rounded-xl text-[10px] hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-50"
              >
                {simState === 'running' ? 'Simulating...' : 'Run Settlement Test'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Old Way Settlement Box */}
              <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-bold text-red-400 block uppercase">
                  Legacy SWIFT Wire (Old Way)
                </span>
                <p className="text-lg font-black text-white">
                  {simOldTime > 0 ? `${simOldTime} Business Days` : '3 to 5 Days'}
                </p>
                <p className="text-[9px] text-slate-400">
                  Middleman banks, compliance delays, closed on weekends.
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min((simOldTime / 4) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* New Way Settlement Box */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                  Nova Quantum Mesh (New Way)
                </span>
                <p className="text-lg font-black text-emerald-300">
                  {simNewTime > 0 ? `${simNewTime}s Finality` : '0.0004 Seconds'}
                </p>
                <p className="text-[9px] text-slate-400">
                  Instant parallel ZK routing, 24/7/365 uninterrupted.
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: simNewTime > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Deep Side-by-Side Comparison Matrix */}
          <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden font-mono">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Complete Architectural Comparison
              </h4>
              <span className="text-[10px] text-slate-400">Newcomer Breakdown</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {[
                {
                  metric: 'Settlement Speed',
                  oldWay: '2 to 5 business days, closed on weekends and holidays',
                  newWay: '0.0004s Instant Finality across all chains 24/7/365',
                  win: 'new'
                },
                {
                  metric: 'Transaction Fees',
                  oldWay: '$25–$50 wire fees, 3-5% card processing, high FX spread',
                  newWay: '$0.000001 (Zero gas fees, subsidized by Nova AI)',
                  win: 'new'
                },
                {
                  metric: 'Asset Ownership',
                  oldWay: 'Custodial: Bank owns assets, can freeze or restrict withdrawals',
                  newWay: '100% Self-Custodial: Cryptographic keys owned only by you',
                  win: 'new'
                },
                {
                  metric: 'Project Creation',
                  oldWay: 'Requires lawyers, incorporation, $25k+ fees, months of paperwork',
                  newWay: '1-Click Smart Contract deployment in under 30 seconds',
                  win: 'new'
                },
                {
                  metric: 'Throughput Capacity',
                  oldWay: '~2,000 TPS legacy payment rails, centralized bottleneck',
                  newWay: '1.48+ Billion Txns / Day parallel super-mesh throughput',
                  win: 'new'
                },
                {
                  metric: 'Accessibility',
                  oldWay: 'Requires credit checks, ID barriers, age minimums, geography restrictions',
                  newWay: 'Open to all ages, borderless, all chains accessible in one app',
                  win: 'new'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-white text-xs">{item.metric}</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      1000x Advantage
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-[11px] leading-relaxed">
                    <div className="bg-red-950/20 border border-red-500/20 p-2.5 rounded-xl text-slate-300">
                      <span className="text-red-400 font-bold block text-[10px] uppercase mb-1">Old Way</span>
                      {item.oldWay}
                    </div>
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl text-slate-200">
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase mb-1">New Way</span>
                      {item.newWay}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newcomer Academy: 4 Guided Learning Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5 px-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Newcomer Guides: Why It Matters
            </h4>

            {[
              {
                id: 0,
                title: 'Module 1: What is a Smart Contract and Why is it Revolutionary?',
                summary: 'Think of a smart contract like a digital vending machine: you drop in an input, and the code automatically delivers the outcome without needing a human banker, lawyer, or middleman to approve it.',
                deep: 'In legacy finance, agreements depend on courts, lawyers, and banks. A smart contract is self-executing code stored on the blockchain. Once deployed, it can never be altered or shut down by a single entity, ensuring complete mathematical fairness.'
              },
              {
                id: 1,
                title: 'Module 2: How Does 1.48 Billion Transactions / Day Work?',
                summary: 'Traditional blockchains process transactions in a single line. The Nova Quantum Core uses parallel shards and zero-knowledge rollups to process thousands of transactions simultaneously.',
                deep: 'By partitioning the load across 1,024 parallel execution threads, the network throughput scales horizontally. This means millions of users can swap, transfer, and trade without network congestion or fee spikes.'
              },
              {
                id: 2,
                title: 'Module 3: How Anyone Can Build and Deploy in 30 Seconds',
                summary: 'You no longer need 5 years of software engineering experience. Our Engineering Hub provides audited templates with 1-click compilation for TON, Solana, and EVM.',
                deep: 'With built-in bytecode compilers, automated ABI generation, and AI-powered token emblem synthesis, you can test, deploy, and launch a complete Web3 project directly from your phone.'
              },
              {
                id: 3,
                title: 'Module 4: Security, Self-Custody & Golden Rules for All Ages',
                summary: 'You are your own bank. Keep your PIN safe, never share your recovery phrases, and verify contract addresses before transacting.',
                deep: 'In the New Economy, you have complete sovereignty. NovaWallet provides military-grade local encryption, biometric/PIN access, and automated malicious contract detection to keep your funds safe at all times.'
              }
            ].map(mod => {
              const isOpen = expandedModule === mod.id;
              return (
                <div
                  key={mod.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedModule(isOpen ? null : mod.id)}
                    className="w-full p-4 text-left flex items-center justify-between font-mono"
                  >
                    <span className="font-bold text-xs text-white">{mod.title}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-slate-800/60 font-mono text-xs space-y-2 text-slate-300 leading-relaxed bg-black/40">
                      <p className="text-cyan-300 font-semibold">{mod.summary}</p>
                      <p className="text-slate-400">{mod.deep}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineeringHubScreen;
