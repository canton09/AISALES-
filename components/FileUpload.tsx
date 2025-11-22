import React, { useState, ChangeEvent } from 'react';
import { UploadCloud, FileAudio, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      setFileName(file.name);
      onFileSelected(file);
    } else {
      alert("请上传有效的音频或视频文件。");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 border border-dashed rounded-xl transition-all duration-500 ease-out backdrop-blur-sm
          ${dragActive 
            ? "border-cyan-500 bg-cyan-950/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]" 
            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/60"}
          ${isAnalyzing ? "opacity-75 pointer-events-none" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="audio/*,video/*"
          disabled={isAnalyzing}
        />
        
        <div className="text-center z-0 pointer-events-none">
          {isAnalyzing ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-30 rounded-full"></div>
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin relative z-10" />
              </div>
              <p className="text-lg font-semibold text-zinc-200 tracking-wide">数据解析中...</p>
              <p className="text-sm text-zinc-500 mt-2">正在建立连接，请稍候</p>
            </div>
          ) : fileName ? (
             <div className="flex flex-col items-center">
              <FileAudio className="w-12 h-12 text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              <p className="text-lg font-medium text-zinc-200 tracking-wide">{fileName}</p>
              <p className="text-sm text-zinc-500 mt-2 uppercase tracking-wider">点击更换文件</p>
            </div>
          ) : (
            <>
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors duration-300 ${dragActive ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "text-zinc-600"}`} />
              <p className="text-lg font-semibold text-zinc-300 tracking-wide">
                拖入音频文件
              </p>
              <p className="text-sm text-zinc-500 mt-2 font-light">
                支持 MP3, WAV, M4A
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;