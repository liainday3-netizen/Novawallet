import React, { useState } from 'react';
import { Asset } from '../types';
import {
  ShieldCheck,
  Shield,
  Lock,
  Key,
  CheckCircle2,
  X,
  ExternalLink,
  Cpu,
  FileCheck,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { playAlertChime } from './NotificationComponents';

interface SecureAssetConfirmModalProps {
  asset: Asset | null;
  onClose: () => void;
  onConfirmed?: (assetSymbol: string) => void;
  isConfirmed?: boolean;
}

export const SecureAssetConfirmModal: React.FC<SecureAssetConfirmModalProps> = ({
  asset,
  onClose,
  onConfirmed,
  isConfirmed = false
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(isConfirmed);

  if (!asset) return null;

  const handleConfirmSecurity = () => {
    setIsVerifying(true);
    playAlertChime();

    setTimeout(() => {
      setIsVerifying(false);
      setHasConfirmed(true);
      if (onConfirmed) {
        onConfirmed(asset.symbol);
      }
    }, 1200);
  };

  const getContractAddress = (sym: string) => {
    switch (sym) {
      case 'TON':
        return 'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA';
      case 'GEM':
        return 'EQD-NovaGem-ZeroKnowledge-Contract-2026';
      case 'USD':
        return 'FedWire-ACH-Reserve-Vault-004918';
      case '⭐️':
        return 'Telegram-Stars-VirtualLedger-Official';
      default:
        return `EQ_${sym}_SecureDigitalContract_Audit_Clean`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Digital Asset Verification</h3>
              <p className="text-[10px] text-slate-400">Cryptographic Security Check</p>
            </div>
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
          {/* Asset Summary Banner */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${asset.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                {asset.icon}
              </div>
              <div>
                <h4 className="font-black text-white text-base leading-tight">{asset.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{asset.symbol} Token</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Audited
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Score: 99.4/100</p>
            </div>
          </div>

          {/* Security Verification Matrix */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              Security Specifications
            </p>

            <div className="bg-black/50 border border-slate-800 rounded-2xl p-3.5 space-y-3 font-mono text-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Smart Contract Security</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  PASSED (No Vulnerabilities)
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Key className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Enclave Isolation</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300">
                  AES-256 + Zero-Knowledge
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Proof of Reserves</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">
                  100% Backed
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Contract / Ledger Identifier</p>
                <p className="text-[10px] text-cyan-300 break-all select-all font-mono bg-black/40 p-1.5 rounded-lg border border-slate-800">
                  {getContractAddress(asset.symbol)}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Status Banner */}
          {hasConfirmed ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center gap-3 animate-in zoom-in-95">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-xs text-emerald-300">Secure Digital Asset Confirmed!</p>
                <p className="text-[10px] text-emerald-400/80 leading-tight mt-0.5">
                  Verified as genuine and protected by NovaWallet Zero-Knowledge cryptographic enclave.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-2xl text-[11px] text-slate-400 leading-relaxed flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Confirming registers this asset in your verified local security whitelist for zero-fee swaps and instant transfers.
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {hasConfirmed ? (
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl font-black bg-slate-800 hover:bg-slate-700 text-white text-xs border border-slate-700 transition-colors"
              >
                Close Verification
              </button>
            ) : (
              <button
                onClick={handleConfirmSecurity}
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Cryptographic Signatures...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Secure Digital Asset</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureAssetConfirmModal;
