import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Transcript from './components/Transcript';
import SentimentGraph from './components/SentimentGraph';
import CoachingCard from './components/CoachingCard';
import SettingsModal from './components/SettingsModal';
import { analyzeSalesCall } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { CarFront, Zap, Settings, ShieldCheck, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // API Keys State
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [deepseekKey, setDeepseekKey] = useState<string>('');

  useEffect(() => {
    const storedGemini = localStorage.getItem('GEMINI_API_KEY');
    const storedDeepseek = localStorage.getItem('DEEPSEEK_API_KEY');
    if (storedGemini) setGeminiKey(storedGemini);
    if (storedDeepseek) setDeepseekKey(storedDeepseek);

    // If no keys, prompt user
    if (!storedGemini) {
        setIsSettingsOpen(true);
    }
  }, []);

  const handleKeysSave = (gKey: string, dKey: string) => {
      setGeminiKey(gKey);
      setDeepseekKey(dKey);
      localStorage.setItem('GEMINI_API_KEY', gKey);
      localStorage.setItem('DEEPSEEK_API_KEY', dKey);
  };

  const handleFileSelect = async (file: File) => {
    if (!geminiKey) {
        setIsSettingsOpen(true);
        setError("请先配置 Gemini API Key 以进行智能分析。");
        return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);
    setAnalysisResult(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        // Remove metadata prefix
        const base64Data = result.split(',')[1];
        const mimeType = file.type;

        try {
          const data = await analyzeSalesCall(base64Data, mimeType, geminiKey);
          setAnalysisResult(data);
          setAppState(AppState.COMPLETE);
        } catch (err: any) {
          console.error(err);
          setError(err.message || "分析音频失败。请确保 API Key 有效且额度充足。");
          setAppState(AppState.ERROR);
        }
      };
      reader.onerror = () => {
        setError("读取文件时出错。");
        setAppState(AppState.ERROR);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError("发生意外错误。");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onKeysSave={handleKeysSave}
        initialGeminiKey={geminiKey}
        initialDeepseekKey={deepseekKey}
      />

      {/* Header */}
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
               <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full"></div>
               <CarFront className="text-cyan-400 w-6 h-6 relative z-10" />
            </div>
            <div className="flex flex-col">
               <h1 className="text-xl font-bold text-white tracking-widest leading-none">
                AISALES
              </h1>
              <span className="text-[9px] font-semibold text-zinc-500 tracking-[0.2em] uppercase mt-0.5">Auto Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {geminiKey ? (
                 <span className="hidden md:flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                     <ShieldCheck size={12} />
                     SYSTEM ONLINE
                 </span>
             ) : (
                 <span className="hidden md:flex items-center gap-1.5 text-[10px] text-orange-500 font-mono bg-orange-950/30 px-2 py-1 rounded border border-orange-900/50">
                     <AlertCircle size={12} />
                     KEY REQUIRED
                 </span>
             )}
            
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors relative group"
            >
                <Settings size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950 transform scale-0 group-hover:scale-0 transition-transform origin-center"></span>
                {!geminiKey && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>}
            </button>
            <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-cyan-400 text-xs font-medium rounded-full flex items-center gap-2 shadow-lg shadow-cyan-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
              使用Gemini高级模型
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Initial State / Upload */}
        <div className={`transition-all duration-700 ease-out ${appState === AppState.COMPLETE ? 'mb-8' : 'h-[calc(100vh-10rem)] flex flex-col justify-center'}`}>
          
          {appState !== AppState.COMPLETE && (
            <div className="text-center mb-10 space-y-6 animate-fade-in-up">
               <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                智能驱动 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">成交时刻</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-light tracking-wide">
                专为未来展厅设计。AI 引擎深度解析对话数据，优化销售表现。
              </p>
            </div>
          )}

          {appState !== AppState.COMPLETE && (
             <FileUpload onFileSelected={handleFileSelect} isAnalyzing={appState === AppState.ANALYZING} />
          )}

          {appState === AppState.ERROR && (
            <div className="mt-6 mx-auto max-w-lg p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg text-center backdrop-blur-sm">
              {error}
              <button 
                onClick={() => setAppState(AppState.IDLE)}
                className="block mx-auto mt-2 text-sm font-semibold underline hover:text-red-300"
              >
                系统重置
              </button>
            </div>
          )}
        </div>

        {/* Results Dashboard */}
        {appState === AppState.COMPLETE && analysisResult && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Section: Summary & Coaching */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-zinc-900/40 backdrop-blur-sm p-6 rounded-xl border border-white/5 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-transparent opacity-50"></div>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">Analysis Summary</h2>
                    <p className="text-zinc-100 text-lg leading-relaxed font-light">{analysisResult.summary}</p>
                </div>
              </div>
            </div>

             <CoachingCard data={analysisResult.coaching} />

            {/* Middle Section: Graph & Transcript */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Left Column: Engagement Graph + Stats */}
              <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                <SentimentGraph data={analysisResult.sentimentGraph} />
                {/* AI Insight Card */}
                <div className="flex-1 bg-zinc-900 rounded-xl p-8 text-white flex flex-col justify-center items-center relative overflow-hidden border border-white/10 group">
                  {/* Ambient Light Effect */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500 blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                        <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">AI 核心洞察</h3>
                    <p className="text-zinc-300 max-w-xl text-lg leading-relaxed font-light">
                      "{analysisResult.keyInsight}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Transcript */}
              <div className="lg:col-span-1 h-full">
                <Transcript transcript={analysisResult.transcript} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;