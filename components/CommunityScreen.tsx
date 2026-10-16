
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Users, Award, ShieldCheck } from 'lucide-react';
import { getCommunityTrends } from '../services/geminiService';

const CommunityScreen: React.FC = () => {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      const data = await getCommunityTrends();
      setTrends(data);
      setLoading(false);
    };
    fetchTrends();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community</h2>
        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
            <Award className="w-5 h-5 text-yellow-400" />
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800">
            <Users className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Peers</p>
            <p className="text-xl font-bold">128.4K</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800">
            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Global Vol</p>
            <p className="text-xl font-bold">$2.1M</p>
        </div>
      </div>

      {/* Trending Feed */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Trending Now</h3>
            <span className="text-[10px] bg-red-500 px-2 py-0.5 rounded text-white font-bold animate-pulse">LIVE</span>
        </div>
        
        {loading ? (
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-slate-900/50 animate-pulse rounded-3xl"></div>
                ))}
            </div>
        ) : (
            <div className="space-y-4">
                {trends.map((text, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-[2.5rem] shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg">
                                {idx === 0 ? '🚀' : idx === 1 ? '💎' : '🔥'}
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <h4 className="text-sm font-bold">User_{8472 + idx}</h4>
                                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                                </div>
                                <p className="text-[10px] text-slate-500">Verified Member</p>
                            </div>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed mb-4">{text}</p>
                        <div className="flex justify-between items-center border-t border-slate-800/50 pt-4">
                            <div className="flex gap-5">
                                <button className="flex items-center gap-1 text-slate-500 text-xs hover:text-red-400 transition-colors">
                                    <Heart className="w-4 h-4" /> {Math.floor(Math.random()*500)}
                                </button>
                                <button className="flex items-center gap-1 text-slate-500 text-xs hover:text-cyan-400 transition-colors">
                                    <MessageCircle className="w-4 h-4" /> {Math.floor(Math.random()*50)}
                                </button>
                            </div>
                            <Share2 className="w-4 h-4 text-slate-700" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* Groups Section */}
      <section>
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest px-2 mb-4">Nova Groups</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5">
            {[
                { name: "TON Titans", icon: "🔱", members: "12K" },
                { name: "Daily Earners", icon: "💸", members: "45K" },
                { name: "Gem Hunters", icon: "✨", members: "8K" }
            ].map((group, i) => (
                <div key={i} className="min-w-[140px] bg-slate-900 border border-slate-800 p-4 rounded-3xl text-center">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{group.icon}</div>
                    <p className="font-bold text-xs mb-1">{group.name}</p>
                    <p className="text-[9px] text-slate-500">{group.members} members</p>
                    <button className="mt-3 w-full bg-slate-800 py-2 rounded-xl text-[10px] font-bold text-cyan-400">JOIN</button>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default CommunityScreen;
