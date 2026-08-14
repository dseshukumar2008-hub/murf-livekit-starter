import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  HeartPulse, 
  Globe, 
  Info, 
  Mic, 
  ShieldCheck, 
  Clock, 
  Users, 
  Leaf, 
  HeartHandshake, 
  Check,
  ChevronDown,
  Shield
} from 'lucide-react';
import { AnalyticsDashboard } from './analytics-dashboard';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  hasEnded?: boolean;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  hasEnded,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [micError, setMicError] = useState(false);

  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicError(false);
      onStartCall();
    } catch (e) {
      setMicError(true);
    }
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F6FFFC] flex flex-col font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-900">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:px-12 w-full z-20">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700 p-2 rounded-full shadow-sm text-white flex items-center justify-center">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">Saathi</h1>
            <p className="text-sm text-slate-500 font-medium">Your Voice for Better Health</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="text-slate-500 font-mono text-[10px] font-bold tracking-wider uppercase">
            Built with{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents"
              className="underline underline-offset-4 hover:text-slate-800 transition-colors"
            >
              LiveKit Agents
            </a>
          </div>

        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 xl:gap-10 px-4 md:px-8 xl:px-12 w-full max-w-[1400px] mx-auto pb-12 z-10 relative items-start overflow-hidden xl:overflow-visible box-border">
        
        {/* Left Column (Main Saathi Content) */}
        <div className="w-full min-w-0 flex flex-col items-center xl:items-start box-border">
        
        {/* Modern Premium AI Health Background Treatment */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden flex justify-end">
          {/* Very soft white to pale mint gradient across the hero */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-[#F6FFFC] to-[#eaf8f4] opacity-70"></div>
          
          {/* Large subtle radial mint/teal glow behind the heart (top-right focused) */}
          <div className="absolute top-[-10%] right-[5%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,#D9FFF2_0%,transparent_60%)] opacity-70 blur-3xl mix-blend-multiply"></div>
          
          {/* Soft blurred light patch slightly below the heart */}
          <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] bg-teal-100/30 blur-[100px] rounded-full"></div>

          {/* Elegant medical ECG/audio-wave flowing lines extending from the heart area */}
          <div className="absolute top-[40%] right-[30%] w-[120%] h-[2px] bg-gradient-to-r from-transparent via-teal-200/20 to-transparent -rotate-[15deg]"></div>
          <div className="absolute top-[45%] right-[25%] w-[100%] h-[1px] bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent -rotate-[10deg]"></div>
          <div className="absolute top-[35%] right-[35%] w-[100%] h-[1px] bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent -rotate-[20deg]"></div>

          {/* Subtle thin geometric curves/arcs */}
          <div className="absolute top-[10%] right-[-10%] w-[700px] h-[700px] border-[1px] border-teal-100/30 rounded-full scale-110 opacity-70"></div>
          <div className="absolute top-[0%] right-[-5%] w-[850px] h-[850px] border-[0.5px] border-emerald-100/20 rounded-full scale-125 opacity-60"></div>
          <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] border-[1px] border-cyan-100/20 rounded-full scale-105 opacity-50"></div>

          {/* Tiny low-opacity mint/cyan particles/dots around the hero area */}
          <div className="absolute top-24 right-48 w-1 h-1 rounded-full bg-teal-400 opacity-30 blur-[0.5px]"></div>
          <div className="absolute top-40 right-20 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-20 blur-[0.5px]"></div>
          <div className="absolute top-[40%] right-[10%] w-1 h-1 rounded-full bg-cyan-400 opacity-30 blur-[0.5px]"></div>
          <div className="absolute top-[60%] right-[40%] w-1.5 h-1.5 rounded-full bg-teal-300 opacity-20 blur-[0.5px]"></div>
          <div className="absolute top-[15%] right-[35%] w-1 h-1 rounded-full bg-emerald-300 opacity-40 blur-[0.5px]"></div>
        </div>

        {/* Hero Section */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mt-4 mb-16 relative">
          
          {/* Left Text */}
          <div className="w-full lg:w-[45%] flex flex-col items-start xl:pl-8">
            <div className="inline-flex items-center gap-2 bg-teal-50/80 text-teal-700 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider mb-8 border border-teal-100/50 uppercase shadow-sm">
              <Mic size={14} /> VOICE ASSISTANT
            </div>
            
            <h2 className="text-5xl lg:text-[4rem] font-extrabold text-slate-800 tracking-tight leading-[1.1] mb-6 relative z-10">
              I'm Saathi,<br/>
              your <span className="text-teal-700 relative whitespace-nowrap">
                health companion.
                <svg className="absolute w-full h-4 -bottom-1 left-0 text-teal-200" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-md mb-10 leading-relaxed font-medium">
              Talk to me about your symptoms, wellness questions and healthy living.
            </p>

            <div className="bg-[#f0faf5] border border-emerald-100/60 p-5 rounded-[20px] max-w-sm flex items-start gap-4 shadow-sm relative z-20">
              <div className="bg-emerald-500 p-2 rounded-xl shrink-0 text-white shadow-sm mt-0.5">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-teal-900 text-sm mb-1 leading-snug">Your Health, Your Data,<br/>Always Secure</h4>
                <p className="text-[13px] text-slate-500 font-medium leading-snug pr-4">Your conversations are private and encrypted.</p>
              </div>
            </div>
          </div>

          {/* Center/Right Visual & CTA */}
          <div className="w-full lg:w-[55%] relative flex flex-col items-center pt-8">
            
            <div className="relative flex flex-col items-center">
              {/* Circular Visual - Modern AI Health Interface */}
              <div className="w-56 h-56 md:w-[280px] md:h-[280px] relative flex items-center justify-center mb-8">
                {/* Soft outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00A878] via-[#00BFA6] to-[#20CFE8] opacity-15 blur-2xl animate-pulse"></div>
                
                {/* Concentric rings */}
                <div className="absolute inset-2 rounded-full border border-teal-300/30"></div>
                <div className="absolute inset-6 rounded-full border border-[#00BFA6]/40 shadow-[0_0_15px_rgba(0,191,166,0.15)] animate-[spin_60s_linear_infinite]">
                  {/* Glowing floating dot 1 */}
                  <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-[#20CFE8] rounded-full shadow-[0_0_10px_#20CFE8]"></div>
                </div>
                <div className="absolute inset-10 rounded-full border border-dashed border-emerald-400/40 animate-[spin_90s_linear_infinite_reverse]">
                  {/* Glowing floating dot 2 */}
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#00A878] rounded-full shadow-[0_0_8px_#00A878]"></div>
                  {/* Glowing floating dot 3 */}
                  <div className="absolute top-1/2 -left-1 w-2.5 h-2.5 bg-[#00BFA6] rounded-full shadow-[0_0_8px_#00BFA6]"></div>
                </div>

                {/* Inner white circle */}
                <div className="absolute inset-14 rounded-full bg-white shadow-2xl shadow-teal-900/10 flex items-center justify-center z-10">
                  {/* Gentle green/teal glow around the heart */}
                  <div className="absolute inset-4 rounded-full bg-[#00BFA6] opacity-15 blur-md animate-[pulse_4s_ease-in-out_infinite]"></div>
                  
                  {/* Vibrant Heart with Gradient & 3D Shadow */}
                  <div className="relative flex items-center justify-center w-16 h-16 z-20">
                    <svg viewBox="0 0 24 24" fill="url(#heart-gradient)" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-[0_6px_8px_rgba(0,168,120,0.35)]">
                      <defs>
                        <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00A878" />
                          <stop offset="50%" stopColor="#00BFA6" />
                          <stop offset="100%" stopColor="#20CFE8" />
                        </linearGradient>
                      </defs>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      <path d="M4 12h3l2.5-4 3 10 2.5-6h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"/>
                    </svg>
                  </div>
                </div>
                
                {/* Subtle sparkle/highlight accents */}
                <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white] animate-pulse opacity-80 z-20"></div>
                <div className="absolute bottom-[30%] left-[22%] w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white] opacity-60 z-20"></div>
              </div>

              <h3 className="text-[28px] font-bold text-slate-800 mb-2 tracking-tight">
                {hasEnded ? 'Conversation ended' : 'Chat live with Saathi'}
              </h3>
              <p className="text-slate-500 font-medium mb-8 text-[15px]">I'm here to listen and help.</p>
              
              <button
                onClick={handleStartCall}
                className="group relative flex items-center gap-3 bg-gradient-to-b from-[#f98a48] to-[#f46824] text-white px-10 py-[18px] rounded-[30px] font-bold text-[17px] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all w-full min-w-[280px] max-w-sm justify-center"
              >
                <Mic size={22} className="group-hover:animate-pulse" />
                {hasEnded ? 'Talk Again' : 'Talk to Saathi'}
              </button>
              
              {micError && (
                <p className="text-red-500 mt-5 max-w-sm text-xs font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-100 absolute -bottom-20">
                  We need microphone access to talk with you. Please enable microphone permissions in your browser settings and try again.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Row */}
        <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-wrap lg:flex-nowrap items-start lg:items-center justify-between gap-6 lg:gap-4 mb-10 relative z-20 overflow-hidden box-border">
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-[#eefcf5] p-3 rounded-full shrink-0 text-emerald-500"><ShieldCheck size={26} strokeWidth={2.2}/></div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] mb-0.5">Private & Secure</h4>
              <p className="text-[13px] text-slate-500 leading-snug font-medium">Your data stays private<br/>and protected</p>
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-slate-100"></div>
          
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-[#eaf8f8] p-3 rounded-full shrink-0 text-teal-500"><Clock size={26} strokeWidth={2.2}/></div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] mb-0.5">24/7 Assistance</h4>
              <p className="text-[13px] text-slate-500 leading-snug font-medium">Get help anytime,<br/>anywhere</p>
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-slate-100"></div>
          
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-[#f2effb] p-3 rounded-full shrink-0 text-purple-500"><Users size={26} strokeWidth={2.2}/></div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] mb-0.5">Health for All</h4>
              <p className="text-[13px] text-slate-500 leading-snug font-medium">Accessible care<br/>for everyone</p>
            </div>
          </div>
          <div className="hidden lg:block w-px h-12 bg-slate-100"></div>
          
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-[#f0f8e9] p-3 rounded-full shrink-0 text-lime-600"><Leaf size={26} strokeWidth={2.2}/></div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px] mb-0.5">Trusted Information</h4>
              <p className="text-[13px] text-slate-500 leading-snug font-medium">Guidance based on reliable<br/>health knowledge</p>
            </div>
          </div>
        </div>

        {/* How Saathi Can Help Section */}
        <div className="w-full bg-[#f4f7fc] border border-blue-50 rounded-3xl py-8 px-6 lg:px-8 flex flex-col gap-8 mb-8 relative z-20 shadow-sm">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 xl:gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="text-indigo-800 bg-white w-14 h-14 rounded-full shadow-sm shrink-0 border border-indigo-50 flex items-center justify-center">
                <HeartHandshake size={28} strokeWidth={2.2} />
              </div>
              <h3 className="text-[22px] font-bold text-slate-800 tracking-tight text-center sm:text-left">How Saathi Can Help</h3>
            </div>
            
            <div className="flex flex-row flex-wrap justify-center xl:justify-end gap-3 w-full">
              <div className="bg-white px-4 lg:px-5 py-3 rounded-full flex items-center gap-2.5 text-[13.5px] lg:text-[14px] font-semibold text-slate-700 shadow-sm whitespace-nowrap"><Check size={18} strokeWidth={3} className="text-emerald-600 shrink-0"/> Understand your symptoms</div>
              <div className="bg-white px-4 lg:px-5 py-3 rounded-full flex items-center gap-2.5 text-[13.5px] lg:text-[14px] font-semibold text-slate-700 shadow-sm whitespace-nowrap"><Check size={18} strokeWidth={3} className="text-emerald-600 shrink-0"/> Learn about healthy habits</div>
              <div className="bg-white px-4 lg:px-5 py-3 rounded-full flex items-center gap-2.5 text-[13.5px] lg:text-[14px] font-semibold text-slate-700 shadow-sm whitespace-nowrap"><Check size={18} strokeWidth={3} className="text-emerald-600 shrink-0"/> Get general wellness guidance</div>
              <div className="bg-white px-4 lg:px-5 py-3 rounded-full flex items-center gap-2.5 text-[13.5px] lg:text-[14px] font-semibold text-slate-700 shadow-sm whitespace-nowrap"><Check size={18} strokeWidth={3} className="text-emerald-600 shrink-0"/> Know when to seek help</div>
            </div>
          </div>
          
          <div className="text-center w-full border-t border-blue-100/60 pt-6">
            <p className="text-[13.5px] font-medium text-slate-600 mb-1">Note: I am not a doctor and cannot diagnose or prescribe medicines.</p>
            <p className="text-[13.5px] font-medium text-slate-600">For emergencies, please contact your <span className="text-[#e25d5d] font-semibold">local emergency services</span>.</p>
          </div>
        </div>
        </div>

        {/* Right Column: Analytics Sidebar */}
        <aside className="w-full min-w-0 xl:sticky xl:top-8 flex flex-col gap-6 box-border">
          <AnalyticsDashboard triggerRefresh={hasEnded} />
          
          {/* Privacy Card */}
          <div className="bg-[#f0faf5] border border-emerald-100/60 p-5 rounded-3xl flex items-start gap-4 shadow-sm w-full">
            <div className="text-emerald-600 shrink-0 mt-0.5">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 text-sm mb-1 leading-snug">We respect your privacy</h4>
              <p className="text-[12px] text-slate-600 font-medium leading-snug">
                No personal or sensitive information<br/>is displayed here.
              </p>
            </div>
          </div>
        </aside>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#11674e] text-white py-3.5 px-6 mt-auto shrink-0 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-[13px] font-medium text-emerald-50/90 text-center flex-wrap">
          <Shield size={16} className="text-emerald-100 shrink-0" strokeWidth={2.5} />
          <p>This is not a replacement for professional medical advice. In case of emergency, please contact your local emergency services.</p>
        </div>
      </footer>
    </div>
  );
};
