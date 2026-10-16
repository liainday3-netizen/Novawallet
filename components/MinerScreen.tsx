
import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Square, ArrowUpCircle, HardDrive, Battery, Cpu, Activity, Info, Sparkles, TrendingUp, ShieldCheck, Gauge, ThermometerSun } from 'lucide-react';
import { MinerState, Asset } from '../types';

interface MinerScreenProps {
  miner: MinerState;
  setMiner: React.Dispatch<React.SetStateAction<MinerState>>;
  updateBalance: (id: string, amount: number) => void;
  assets: Asset[];
}

const MinerScreen: React.FC<MinerScreenProps> = ({ miner, setMiner, updateBalance, assets }) => {
  const [logs, setLogs] = useState<string[]>(["[SYSTEM]: NovaMiner v2.1 initialized...", "[SYSTEM]: Connection to TON Node: STABLE"]);
  const [showUpgradeAnim, setShowUpgradeAnim] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [powerFlash, setPowerFlash] = useState<'on' | 'off' | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const toggleMining = () => {
    if (miner.energy <= 0 && !miner.isActive) {
      alert("Insufficient Energy! Please wait for recharge.");
      return;
    }

    const nextState = !miner.isActive;
    setPowerFlash(nextState ? 'on' : 'off');
    
    // Clear flash after animation
    setTimeout(() => setPowerFlash(null), 1000);

    setMiner(prev => ({ ...prev, isActive: nextState }));
    
    if (nextState) {
        addLog("Booting kernel... [OK]");
        addLog("Authenticating node cluster... [OK]");
        addLog("Rig activated. Seeking hash puzzles...");
    } else {
        addLog("Graceful shutdown initiated...");
        addLog("Nodes entering sleep mode.");
        addLog("Stopped cloud mining rig.");
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const rechargeEnergy = () => {
    const cost = 25; // Gems cost
    const gemBalance = assets.find(a => a.id === '4')?.balance || 0;
    if (gemBalance < cost) {
      alert("Insufficient Gems to recharge energy!");
      return;
    }
    updateBalance('4', -cost);
    setMiner(prev => ({ ...prev, energy: 100 }));
    addLog("[SYSTEM]: Energy cells replaced. Full power restored.");
  };

  const upgradeMiner = () => {
    const cost = 150 * miner.level;
    const gemBalance = assets.find(a => a.id === '4')?.balance || 0;
    if (gemBalance < cost) {
      alert(`Upgrade requires ${cost} Gems.`);
      return;
    }

    setIsUpgrading(true);
    
    // Simulate a brief "Installation" process
    setTimeout(() => {
        updateBalance('4', -cost);
        setMiner(prev => ({
          ...prev,
          level: prev.level + 1,
          hashRate: prev.hashRate * 1.4, // 40% gain
          efficiency: Math.max(0.1, prev.efficiency * 0.9) // 10% better efficiency
        }));
        
        setIsUpgrading(false);
        setShowUpgradeAnim(true);
        addLog(`[HARDWARE]: Overhauled to Gen-${miner.level + 1}. Throughput +40%.`);
        setTimeout(() => setShowUpgradeAnim(false), 2500);
    }, 1500);
  };

  const upgradeCost = 150 * miner.level;
  const gemBalance = assets.find(a => a.id === '4')?.balance || 0;
  const canAfford = gemBalance >= upgradeCost;
  
  // Calculate "Heat" based on hashRate vs efficiency for visual fluff
  const thermalLoad = Math.min(100, (miner.hashRate * 5) * miner.efficiency);

  return (
    <div className="space-y-6 relative pb-10">
      {/* Power Flash Overlay */}
      {powerFlash && (
        <div className={`fixed inset-0 z-[110] pointer-events-none transition-opacity duration-1000 ${powerFlash === 'on' ? 'bg-cyan-500/10' : 'bg-red-500/10'} opacity-0 animate-[pulse_1s_ease-out]`} />
      )}

      {/* Upgrade Success Overlay */}
      {showUpgradeAnim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-md animate-in fade-in duration-500" />
            <div className="relative bg-slate-900 border-2 border-cyan-400 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 animate-pulse" />
                    <Sparkles className="w-16 h-16 text-cyan-400 relative z-10" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white mb-1 tracking-tight">HARDWARE OVERHAUL</h3>
                    <p className="text-cyan-400 font-mono text-sm uppercase tracking-[0.2em]">Gen-{miner.level} System Online</p>
                </div>
                <div className="bg-black/50 py-3 px-6 rounded-2xl border border-slate-700 mt-2">
                    <p className="text-xs text-slate-400">Throughput increased by 40%</p>
                    <p className="text-xs text-slate-400">Energy consumption optimized</p>
                </div>
            </div>
        </div>
      )}

      {/* Title Section */}
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-[1.5rem] mb-4 shadow-inner border border-yellow-500/20">
          <Cpu className="w-10 h-10 text-yellow-400" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Cloud Miner</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Decentralized Node Cluster</p>
        </div>
      </div>

      {/* Main Mining Console */}
      <div className={`bg-slate-900 border transition-all duration-700 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden ${miner.isActive ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-slate-800 shadow-none'}`}>
        
        {/* Energy Grid Background Pattern (Only active when mining) */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-1000 ${miner.isActive ? 'opacity-10' : 'opacity-0'}`}
             style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Scanning Line Animation */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 pointer-events-none ${miner.isActive ? 'animate-[scanning_4s_linear_infinite]' : 'hidden'}`} />

        <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
            <Cpu className="w-32 h-32" />
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Accumulated Rewards</p>
                <div className={`w-2 h-2 rounded-full ${miner.isActive ? 'bg-purple-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>
            <h3 className="text-4xl font-black text-white flex items-baseline gap-2">
              {miner.totalMined.toFixed(4)} <span className="text-sm text-purple-400 font-mono">GEMS</span>
            </h3>
          </div>
          <div className="flex flex-col items-end">
             <div className={`bg-black/50 px-3 py-1.5 rounded-full border transition-colors duration-500 ${miner.isActive ? 'border-cyan-500/50' : 'border-slate-700'} flex items-center gap-2 mb-2`}>
                <Activity className={`w-3 h-3 ${miner.isActive ? 'text-green-400 animate-pulse' : 'text-slate-600'}`} />
                <span className="text-[10px] font-mono text-slate-300 font-bold">{miner.hashRate.toFixed(1)} GH/s</span>
             </div>
             <span className="text-[9px] text-slate-500 font-bold uppercase">Uptime: 99.9%</span>
          </div>
        </div>

        {/* Visualizer & Thermal Meter */}
        <div className="relative mb-8 z-10">
            <div className="h-28 flex items-end gap-1 bg-black/40 rounded-[1.5rem] p-3 border border-slate-800/50 overflow-hidden relative">
                {/* Visualizer Bars */}
                {[...Array(24)].map((_, i) => (
                    <div 
                    key={i} 
                    className={`flex-1 rounded-t-lg transition-all duration-[800ms] ${miner.isActive ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-800'}`}
                    style={{ 
                        height: `${miner.isActive ? (15 + Math.random() * 85) : 8}%`,
                        transitionDelay: `${i * 0.02}s`
                    }}
                    />
                ))}
                
                {/* Thermal Overlay */}
                <div className="absolute top-3 right-3 flex flex-col items-center gap-1 opacity-60">
                    <ThermometerSun className={`w-4 h-4 transition-colors duration-500 ${miner.isActive && thermalLoad > 70 ? 'text-orange-500' : 'text-slate-500'}`} />
                    <div className="w-1.5 h-12 bg-slate-800 rounded-full overflow-hidden flex flex-col justify-end">
                        <div 
                            className={`w-full transition-all duration-1000 ${miner.isActive ? (thermalLoad > 80 ? 'bg-orange-500' : thermalLoad > 50 ? 'bg-yellow-500' : 'bg-cyan-500') : 'bg-slate-700'}`}
                            style={{ height: `${miner.isActive ? thermalLoad : 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 z-10 relative">
            <div className="bg-black/30 p-4 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${miner.energy < 20 ? 'text-red-500' : 'text-cyan-400'}`} />
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Power Core</span>
                    </div>
                    <span className="text-[9px] text-cyan-500 font-bold">{(100/miner.efficiency).toFixed(0)}%</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black">{Math.floor(miner.energy)}</span>
                    <span className="text-[10px] text-slate-600 font-bold">%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${miner.energy < 20 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${miner.energy}%` }} />
                </div>
            </div>
            <div className="bg-black/30 p-4 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">System Level</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-purple-400">{miner.level}</span>
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Tier</span>
                </div>
                <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i < (miner.level % 5) || (miner.level >= 5) ? 'bg-purple-500' : 'bg-slate-800'}`} />
                    ))}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 z-10 relative">
          <button 
            onClick={toggleMining}
            className={`w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${miner.isActive ? 'bg-red-500/10 text-red-500 border-2 border-red-500/30' : 'bg-cyan-500 text-black shadow-[0_10px_20px_rgba(6,182,212,0.3)]'}`}
          >
            {miner.isActive ? <><Square className="w-6 h-6 fill-current" /> STOP NODES</> : <><Play className="w-6 h-6 fill-current" /> START NODES</>}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={rechargeEnergy}
              className="py-4 bg-slate-800 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 hover:border-yellow-500/50 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-yellow-400" /> RECHARGE (25💎)
            </button>
            <button 
              onClick={upgradeMiner}
              disabled={!canAfford || isUpgrading}
              className={`py-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 border transition-all active:scale-95 relative overflow-hidden ${canAfford ? 'bg-slate-800 text-purple-400 border-purple-500/50 hover:bg-purple-900/20' : 'bg-slate-900 text-slate-600 border-slate-800 opacity-50'}`}
            >
              {isUpgrading ? (
                  <span className="animate-pulse">INSTALLING...</span>
              ) : (
                  <>
                    <ArrowUpCircle className={`w-4 h-4 ${canAfford ? 'text-purple-400' : 'text-slate-600'}`} /> 
                    UPGRADE ({upgradeCost}💎)
                  </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Shop / Upgrade Preview */}
      <section className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-sm uppercase tracking-widest text-white">Gen-{miner.level + 1} Upgrade Preview</h3>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${canAfford ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {canAfford ? 'CREDITS READY' : 'INSUFFICIENT GEMS'}
            </div>
        </div>

        <div className="space-y-4">
            {/* Hash Rate Comparison */}
            <div className="bg-black/40 p-5 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hash Throughput</span>
                    <span className="text-xs font-mono text-green-400 font-bold">+40% Gain</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">Current</p>
                        <p className="text-lg font-bold text-slate-400">{miner.hashRate.toFixed(1)} <span className="text-[10px]">GH/s</span></p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-slate-700" />
                    <div className="text-center flex-1">
                        <p className="text-[9px] text-cyan-500 uppercase font-bold mb-1">Upgraded</p>
                        <p className="text-lg font-bold text-white">{(miner.hashRate * 1.4).toFixed(1)} <span className="text-[10px]">GH/s</span></p>
                    </div>
                </div>
            </div>

            {/* Efficiency Comparison */}
            <div className="bg-black/40 p-5 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Energy Efficiency</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">+10% Optimized</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">Drain/Sec</p>
                        <p className="text-lg font-bold text-slate-400">{(0.05 * miner.efficiency).toFixed(3)}</p>
                    </div>
                    <Battery className="w-5 h-5 text-slate-700" />
                    <div className="text-center flex-1">
                        <p className="text-[9px] text-purple-400 uppercase font-bold mb-1">New Drain</p>
                        <p className="text-lg font-bold text-white">{(0.05 * miner.efficiency * 0.9).toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-6 flex items-center gap-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-tight">Upgrading to Gen-{miner.level + 1} will also increase your maximum mining cap by 25%. Ensure your system has sufficient cooling for higher throughputs.</p>
        </div>
      </section>

      {/* Terminal Log */}
      <div className="bg-black border border-slate-800 rounded-[1.5rem] p-5 font-mono overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${miner.isActive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Kernel Logs</span>
            </div>
            <span className="text-[9px] text-slate-600">v3.11.0-RC</span>
        </div>
        <div className="space-y-1.5 h-32 overflow-y-auto scroll-smooth hide-scrollbar flex flex-col-reverse">
            <div ref={logsEndRef} />
            {logs.map((log, i) => (
                <p key={i} className={`text-[10px] flex gap-2 animate-in slide-in-from-left duration-300 ${log.startsWith('[SYSTEM]') ? 'text-cyan-500/70' : log.startsWith('[HARDWARE]') ? 'text-purple-400' : 'text-slate-500'}`}>
                    <span className="opacity-30">[{new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                    <span>{log}</span>
                </p>
            ))}
        </div>
      </div>

      <style>{`
        @keyframes scanning {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes pulse {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MinerScreen;
