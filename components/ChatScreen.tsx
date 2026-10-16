
import React, { useState } from 'react';
// Fixed missing ChevronRight import from lucide-react
import { Phone, Video, Send, MoreVertical, Search, Plus, User, ArrowLeft, Mic, ChevronRight } from 'lucide-react';
import { Message } from '../types';

const INITIAL_MESSAGES: Message[] = [
  { id: '1', sender: 'NovaBot Support', text: 'Welcome to NovaComm! How can I help you with your wallet today?', time: '10:00 AM', isMe: false },
  { id: '2', sender: 'Me', text: 'I just synced my TON wallet, where do I see the rewards?', time: '10:02 AM', isMe: true },
  { id: '3', sender: 'NovaBot Support', text: 'Great! Your rewards are automatically deposited into your main balance on the Wallet screen.', time: '10:03 AM', isMe: false },
];

const ChatScreen: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'Me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMsg]);
    setInputText('');
    
    // Auto-reply simulation
    setTimeout(() => {
        const reply: Message = {
            id: (Date.now()+1).toString(),
            sender: 'NovaBot Support',
            text: 'Processing your request... our support team will be with you shortly.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
        };
        setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  if (isCalling) {
    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-10 animate-in zoom-in-105 duration-300">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 mb-8">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-5xl">🤖</div>
            </div>
            <h2 className="text-3xl font-bold mb-2">NovaBot Support</h2>
            <p className="text-cyan-400 animate-pulse font-medium mb-12 uppercase tracking-widest text-xs">Calling Encrypted...</p>
            
            <div className="flex gap-8">
                <button onClick={() => setIsCalling(false)} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/20 active:scale-90 transition-all">
                    <Phone className="w-8 h-8 text-white rotate-[135deg]" />
                </button>
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-white/50">
                    <Mic className="w-8 h-8" />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {!activeChat ? (
        <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">Messages</h2>
                <div className="flex gap-4">
                    <Search className="w-6 h-6 text-slate-500" />
                    <Plus className="w-6 h-6 text-cyan-400" />
                </div>
            </div>
            
            <div className="flex-1 space-y-2">
                <div onClick={() => setActiveChat('NovaBot')} className="bg-slate-900/50 p-4 rounded-[2rem] border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-900">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-2xl">🤖</div>
                    <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                            <h4 className="font-bold">NovaBot Support</h4>
                            <span className="text-[10px] text-slate-500">10:03 AM</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">Your rewards are automatically deposited...</p>
                    </div>
                </div>
                
                {[1,2,3].map(i => (
                    <div key={i} className="bg-slate-900/10 p-4 rounded-[2rem] border border-slate-900/30 flex items-center gap-4 opacity-50 grayscale">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">👤</div>
                        <div className="flex-1">
                            <h4 className="font-bold">Contact {i}</h4>
                            <p className="text-xs text-slate-600 italic">No messages yet</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={() => setIsCalling(true)}
                className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex items-center justify-between group hover:border-cyan-500/50 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold">Voice Support</p>
                        <p className="text-[10px] text-slate-500">Encrypted Satellite Line</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-cyan-500" />
            </button>
        </div>
      ) : (
        <div className="flex flex-col h-full -mx-5 -mt-5">
            {/* Chat Header */}
            <div className="bg-slate-900/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-slate-800 sticky top-0 z-10">
                <button onClick={() => setActiveChat(null)}><ArrowLeft className="w-6 h-6" /></button>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">🤖</div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm">NovaBot Support</h4>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</p>
                </div>
                <div className="flex gap-4">
                    <Phone onClick={() => setIsCalling(true)} className="w-5 h-5 text-slate-400" />
                    <Video className="w-5 h-5 text-slate-400" />
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                </div>
            </div>
            
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-black">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl ${m.isMe ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800'}`}>
                            <p className="text-sm leading-relaxed">{m.text}</p>
                            <span className="text-[9px] opacity-60 mt-1 block text-right">{m.time}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Input */}
            <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800 flex items-center gap-3">
                <button className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center"><Plus className="w-6 h-6 text-slate-400" /></button>
                <input 
                    type="text" 
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-slate-800 border-none rounded-2xl p-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white"
                />
                <button onClick={sendMessage} className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center active:scale-90 transition-all">
                    <Send className="w-5 h-5 text-black" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;
