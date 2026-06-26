import type { ReactNode } from 'react';
import { Cpu, FileText, Sparkles, Activity } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-10 md:left-32 text-teal-600/30">
        <div className="relative">
          <Cpu size={48} className="animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-teal-400/20 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="absolute bottom-1/4 right-10 md:right-32 text-teal-600/30">
        <div className="relative">
          <Activity size={48} className="animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-teal-400/20 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="absolute top-1/3 right-1/4 text-teal-600/20 rotate-12">
        <FileText size={64} />
      </div>

      <div className="absolute bottom-1/3 left-1/4 text-teal-600/20 -rotate-12">
        <FileText size={80} />
      </div>

      <div className="absolute top-1/2 left-1/4 text-slate-800">
        <Sparkles size={24} />
      </div>
      <div className="absolute top-1/3 right-1/3 text-slate-800">
        <Sparkles size={16} />
      </div>
      <div className="absolute bottom-1/4 right-1/4 text-slate-800">
        <Sparkles size={20} />
      </div>

      {/* Network Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <pattern id="network-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 0 0 L 100 100" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#network-pattern)" />
      </svg>

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Logo Placeholder */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-slate-800">
            <Activity className="h-10 w-10 text-teal-600" />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tight text-teal-700 uppercase">AI Invoice</span>
              <span className="text-sm font-semibold tracking-wider uppercase">Generator</span>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
