import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Loader2, Key, Save } from 'lucide-react';
import { validateGeminiKey } from '../services/geminiService';
import { validateDeepSeekKey } from '../services/deepseekService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysSave: (geminiKey: string, deepseekKey: string) => void;
  initialGeminiKey: string;
  initialDeepseekKey: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  onKeysSave, 
  initialGeminiKey, 
  initialDeepseekKey 
}) => {
  const [geminiKey, setGeminiKey] = useState(initialGeminiKey);
  const [deepseekKey, setDeepseekKey] = useState(initialDeepseekKey);
  
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [deepseekStatus, setDeepseekStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(initialGeminiKey);
      setDeepseekKey(initialDeepseekKey);
      setGeminiStatus(initialGeminiKey ? 'idle' : 'idle');
      setDeepseekStatus(initialDeepseekKey ? 'idle' : 'idle');
    }
  }, [isOpen, initialGeminiKey, initialDeepseekKey]);

  const handleTestGemini = async () => {
    setGeminiStatus('checking');
    const isValid = await validateGeminiKey(geminiKey);
    setGeminiStatus(isValid ? 'valid' : 'invalid');
  };

  const handleTestDeepseek = async () => {
    setDeepseekStatus('checking');
    const isValid = await validateDeepSeekKey(deepseekKey);
    setDeepseekStatus(isValid ? 'valid' : 'invalid');
  };

  const handleSave = () => {
    onKeysSave(geminiKey, deepseekKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-500" />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-zinc-400 font-light">
            API Keys utilize local browser storage (LocalStorage) and interact directly with official endpoints.
          </p>

          {/* Gemini Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex justify-between">
              Google Gemini API Key
              {geminiStatus === 'valid' && <span className="text-emerald-500 flex items-center gap-1 text-[10px]"><CheckCircle2 size={12}/> Connected</span>}
              {geminiStatus === 'invalid' && <span className="text-red-500 flex items-center gap-1 text-[10px]"><XCircle size={12}/> Connection Failed</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setGeminiStatus('idle');
                }}
                placeholder="sk-..."
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
              <button 
                onClick={handleTestGemini}
                disabled={geminiStatus === 'checking' || !geminiKey}
                className="absolute right-2 top-2 p-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors disabled:opacity-50"
              >
                {geminiStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
              </button>
            </div>
          </div>

          {/* DeepSeek Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex justify-between">
              DeepSeek API Key (V3.2)
              {deepseekStatus === 'valid' && <span className="text-emerald-500 flex items-center gap-1 text-[10px]"><CheckCircle2 size={12}/> Connected</span>}
              {deepseekStatus === 'invalid' && <span className="text-red-500 flex items-center gap-1 text-[10px]"><XCircle size={12}/> Connection Failed</span>}
            </label>
            <div className="relative">
              <input
                type="password"
                value={deepseekKey}
                onChange={(e) => {
                    setDeepseekKey(e.target.value);
                    setDeepseekStatus('idle');
                }}
                placeholder="ds-..."
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
              />
              <button 
                onClick={handleTestDeepseek}
                disabled={deepseekStatus === 'checking' || !deepseekKey}
                className="absolute right-2 top-2 p-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors disabled:opacity-50"
              >
                {deepseekStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-600">
                目前音频分析主要依赖 Gemini Multimodal 能力。DeepSeek 密钥将用于后续文本增强功能。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <Save size={16} />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
