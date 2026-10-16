
import React, { useState, useRef } from 'react';
import { Sparkles, Image as ImageIcon, Video, FileText, Wand2, Mic, Upload, Send, Play, Camera, MapPin, BrainCircuit } from 'lucide-react';
import { generateImage, editImage, generateVideo, analyzeMedia, transcribeAudio, getNearbyBanksOrATMs, getComplexThinking } from '../services/geminiService';

const AILabScreen: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'gen' | 'edit' | 'video' | 'analyze' | 'voice' | 'think' | 'maps' | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [file, setFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!prompt && !file && activeTool !== 'maps') return;
    setLoading(true);
    setResult(null);
    try {
      switch (activeTool) {
        case 'gen':
          const img = await generateImage(prompt, aspectRatio, imageSize);
          setResult(img);
          break;
        case 'edit':
          if (file) {
            const edited = await editImage(file.split(',')[1], prompt);
            setResult(edited);
          }
          break;
        case 'video':
          const vid = await generateVideo(prompt, aspectRatio as any);
          setResult(vid);
          break;
        case 'analyze':
          if (file) {
            const mime = file.split(';')[0].split(':')[1];
            const analysis = await analyzeMedia(file.split(',')[1], mime, prompt || "Describe this media in detail.");
            setResult(analysis);
          }
          break;
        case 'voice':
          if (file) {
            const transcription = await transcribeAudio(file.split(',')[1]);
            setResult(transcription);
          }
          break;
        case 'think':
          const thought = await getComplexThinking(prompt);
          setResult(thought);
          break;
        case 'maps':
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const data = await getNearbyBanksOrATMs(pos.coords.latitude, pos.coords.longitude);
            setResult(data.text);
          });
          break;
      }
    } catch (e) {
      setResult("Error processing request. Check console.");
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = () => setFile(reader.result as string);
    if (e.target.files?.[0]) reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-2xl mb-2">
            <Wand2 className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">AI Laboratory</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Advanced Multimodal Tools</p>
      </div>

      {!activeTool ? (
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'gen', icon: <ImageIcon />, label: 'Image Gen', color: 'bg-blue-600', sub: 'Pro Image' },
            { id: 'edit', icon: <Wand2 />, label: 'AI Edit', color: 'bg-purple-600', sub: 'Flash Image' },
            { id: 'video', icon: <Video />, label: 'Video Gen', color: 'bg-red-600', sub: 'Veo 3.1' },
            { id: 'analyze', icon: <Camera />, label: 'Analyze', color: 'bg-indigo-600', sub: 'Pro Multimodal' },
            { id: 'voice', icon: <Mic />, label: 'Transcribe', color: 'bg-green-600', sub: 'Flash Audio' },
            { id: 'think', icon: <BrainCircuit />, label: 'Deep Think', color: 'bg-pink-600', sub: 'Pro Thinking' },
            { id: 'maps', icon: <MapPin />, label: 'Geo Search', color: 'bg-yellow-600', sub: 'Grounding' },
          ].map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id as any)} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] text-left hover:scale-105 transition-all">
              <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                {tool.icon}
              </div>
              <p className="font-bold text-sm">{tool.label}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{tool.sub}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-slate-800 space-y-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center">
            <button onClick={() => { setActiveTool(null); setResult(null); setFile(null); }} className="text-xs font-bold text-slate-500 uppercase">Back to Lab</button>
            <h3 className="font-black text-sm uppercase tracking-widest text-white">{activeTool.toUpperCase()} MODE</h3>
          </div>

          {(activeTool === 'edit' || activeTool === 'analyze' || activeTool === 'voice') && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-48 bg-black/40 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-500 transition-colors"
            >
              {file ? (
                <div className="w-full h-full overflow-hidden rounded-3xl">
                   {file.startsWith('data:image') ? <img src={file} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><FileText className="w-12 h-12 text-cyan-400" /></div>}
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-slate-600" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Upload Media</p>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          {activeTool !== 'maps' && (
            <div className="space-y-2">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-2">AI Prompt</p>
               <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full bg-black/40 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 min-h-[100px]"
               />
            </div>
          )}

          {activeTool === 'gen' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Aspect Ratio</p>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl p-2 text-xs">
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Image Size</p>
                <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="w-full bg-black border border-slate-800 rounded-xl p-2 text-xs">
                    {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {activeTool === 'video' && (
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest ml-1">Aspect Ratio</p>
              <div className="flex gap-2">
                {['16:9', '9:16'].map(r => (
                  <button key={r} onClick={() => setAspectRatio(r)} className={`flex-1 py-2 text-[10px] font-bold rounded-xl border ${aspectRatio === r ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black text-slate-500 border-slate-800'}`}>
                    {r === '16:9' ? 'Landscape' : 'Portrait'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleProcess}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[1.5rem] font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-5 h-5" /> Execute</>}
          </button>

          {result && (
            <div className="bg-black/60 border border-slate-800 rounded-3xl p-5 mt-4 space-y-4 animate-in fade-in duration-500">
               <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Output</p>
               </div>
               {result.startsWith('data:image') ? (
                 <img src={result} className="w-full rounded-2xl shadow-2xl" />
               ) : result.startsWith('blob:') ? (
                 <video src={result} controls className="w-full rounded-2xl shadow-2xl" />
               ) : (
                 <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{result}</p>
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AILabScreen;
