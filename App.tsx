import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import Transcript from './components/Transcript';
import SentimentGraph from './components/SentimentGraph';
import CoachingCard from './components/CoachingCard';
import SettingsModal from './components/SettingsModal';
import { analyzeSalesCall, validateGeminiKey } from './services/geminiService';
import { validateDeepSeekKey } from './services/deepseekService';
import { AnalysisResult, AppState } from './types';
import { CarFront, Zap, Settings, ShieldCheck, AlertCircle, Wifi, WifiOff, Loader2, BrainCircuit } from 'lucide-react';

// Define status types for cleaner state management
type ConnectionStatus = 'missing' | 'checking' | 'connected' | 'error';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // API Keys State
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [deepseekKey, setDeepseekKey] = useState<string>('');

  // Connection Status State
  const [geminiStatus, setGeminiStatus] = useState<ConnectionStatus>('missing');
  const [deepseekStatus, setDeepseekStatus] = useState<ConnectionStatus>('missing');

  // Validate keys function
  const validateConnections = useCallback(async (gKey: string, dKey: string) => {
    // Check Gemini
    if (!gKey) {
      setGeminiStatus('missing');
    } else {
      setGeminiStatus('checking');
      validateGeminiKey(gKey).then(isValid => {
        setGeminiStatus(isValid ? 'connected' : 'error');
      });
    }

    // Check DeepSeek
    if (!dKey) {
      setDeepseekStatus('missing');
    } else {
      setDeepseekStatus('checking');
      validateDeepSeekKey(dKey).then(isValid => {
        setDeepseekStatus(isValid ? 'connected' : 'error');
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    const storedGemini = localStorage.getItem('GEMINI_API_KEY') || '';
    const storedDeepseek = localStorage.getItem('DEEPSEEK_API_KEY') || '';
    
    setGeminiKey(storedGemini);
    setDeepseekKey(storedDeepseek);

    if (!storedGemini) {
        setIsSettingsOpen(true);
    } else {
        validateConnections(storedGemini, storedDeepseek);
    }
  }, [validateConnections]);

  const handleKeysSave = (gKey: string, dKey: string) => {
      setGeminiKey(gKey);
      setDeepseekKey(dKey);
      localStorage.setItem('GEMINI_API_KEY', gKey);
      localStorage.setItem('DEEPSEEK_API_KEY', dKey);
      
      // Reset errors and state so user can retry immediately
      setError(null);
      if (appState === AppState.ERROR) {
        setAppState(AppState.IDLE);
      }
      
      // Re-validate immediately upon save
      validateConnections(gKey, dKey);
  };

  const handleFileSelect = async (file: File) => {
    if (geminiStatus !== 'connected') {
        setIsSettingsOpen(true);
        setError("Gemini API 未连接或验证失败，请检查设置。");
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

  // Helper to render status badge
  const renderStatusBadge = (name: string, status: ConnectionStatus) => {
    if (status === 'missing') return null;
    
    const styles = {
      checking: "bg-zinc-800 text-zinc-400 border-zinc-700",
      connected: "bg-emerald-950/30 text-emerald-500 border-emerald-900/50",
      error: "bg-red-950/30 text-red-500 border-red-900/50"
    };

    const icons = {
      checking: <Loader2 size={12} className="animate-spin" />,
      connected: <Wifi size={12} />,
      error: <WifiOff size={12} />
    };

    return (
      <div className={`hidden md:flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border ${styles[status]} transition-all`}>
        {icons[status]}
        {name}: {status === 'checking' ? '验证中...' : status === 'connected' ? '已连接' : '未连接'}
      </div>
    );
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
              <span className="text-[9px] font-semibold text-zinc-500 tracking-[0.2em] uppercase mt-0.5">汽车销售智能引擎</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Status Indicators */}
             <div className="flex items-center gap-2 mr-2">
                {renderStatusBadge("Gemini", geminiStatus)}
                {renderStatusBadge("DeepSeek", deepseekStatus)}
             </div>

             {/* Settings Button with Alert Dot */}
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors relative group"
                title="API 配置"
            >
                <Settings size={20} />
                {(geminiStatus === 'error' || geminiStatus === 'missing') && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse"></span>
                )}
            </button>
            
            <span className="hidden sm:flex px-3 py-1 bg-zinc-900 border border-zinc-700 text-cyan-400 text-xs font-medium rounded-full items-center gap-2 shadow-lg shadow-cyan-500/10">
              <BrainCircuit size={14} />
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${geminiStatus === 'connected' ? 'bg-cyan-400' : 'bg-zinc-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${geminiStatus === 'connected' ? 'bg-cyan-500' : 'bg-zinc-600'}`}></span>
              </span>
              核心引擎
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
            <div className="mt-6 mx-auto max-w-lg p-4 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg text-center backdrop-blur-sm flex items-center gap-3 justify-center">
              <AlertCircle size={20} />
              <div>
                <p>{error}</p>
                <button 
                  onClick={() => setAppState(AppState.IDLE)}
                  className="mt-1 text-sm font-semibold underline hover:text-red-300"
                >
                  重试
                </button>
              </div>
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
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-3">分析总结</h2>
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