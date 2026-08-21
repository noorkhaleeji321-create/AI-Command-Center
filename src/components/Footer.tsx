import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="h-10 bg-black/80 px-6 md:px-8 flex items-center justify-between border-t border-white/5 font-mono text-[10px] shrink-0 mt-auto">
      <div className="flex items-center space-x-4 text-white/30">
        <span>MEM: 24.1GB / 32GB</span>
        <span className="text-white/10">|</span>
        <span className="uppercase tracking-tighter">CPU: 12%</span>
        <span className="text-white/10 hidden sm:inline">|</span>
        <span className="hidden sm:inline text-white/30">Vercel Node: US-East-1</span>
      </div>
      <div className="flex items-center space-x-2 font-sans">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-400/90 uppercase tracking-widest font-semibold">
          البث المباشر نشط وآمن
        </span>
      </div>
    </footer>
  );
};
