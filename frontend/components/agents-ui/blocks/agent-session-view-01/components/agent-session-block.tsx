'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import { AudioVisualizer } from './audio-visualizer';
import { cn } from '@/lib/shadcn/utils';
import { HeartPulse, Globe, Info, ShieldCheck, Phone, PhoneOff, MicOff, Mic, Clock, Users, Leaf, Shield, ChevronDown } from 'lucide-react';
import { AgentControlBar, type AgentControlBarControls } from '@/components/agents-ui/agent-control-bar';

export interface AgentSessionView_01Props {
  preConnectMessage?: string;
  supportsChatInput?: boolean;
  supportsVideoInput?: boolean;
  supportsScreenShare?: boolean;
  isPreConnectBufferEnabled?: boolean;
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;
  className?: string;
}

export function AgentSessionView_01({
  preConnectMessage,
  supportsChatInput,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled,
  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerWaveLineWidth,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: false,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  const [micDenied, setMicDenied] = useState(false);

  useEffect(() => {
    // Basic check if mic is somehow denied while in session
    navigator.permissions?.query({ name: 'microphone' as PermissionName }).then((res) => {
      if (res.state === 'denied') setMicDenied(true);
      res.onchange = () => setMicDenied(res.state === 'denied');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getStatusPill = () => {
    switch (agentState) {
      case 'connecting': return { text: 'Connecting...', color: 'text-amber-700 bg-amber-100', icon: '●' };
      case 'listening': return { text: 'Listening...', color: 'text-teal-700 bg-teal-100', icon: '●' };
      case 'speaking': return { text: 'Speaking...', color: 'text-blue-700 bg-blue-100', icon: '●' };
      case 'thinking': return { text: 'Thinking...', color: 'text-purple-700 bg-purple-100', icon: '●' };
      case 'disconnected': return { text: 'Call Ended', color: 'text-emerald-700 bg-emerald-100', icon: '✓' };
      default: return { text: 'Connecting...', color: 'text-amber-700 bg-amber-100', icon: '●' };
    }
  };

  const agent = useAgent();
  const agentState = agent.state;

  const getAssistantText = () => {
    // Derive the display name from the actual LiveKit agent state
    let displayName = 'Saathi';
    if (agent.name && agent.name.toLowerCase().includes('specialist')) {
      displayName = 'Care Specialist';
    } else if (agent.attributes && agent.attributes.agentName && (agent.attributes.agentName as string).toLowerCase().includes('specialist')) {
      displayName = 'Care Specialist';
    }

    switch (agentState) {
      case 'connecting': return 'Connecting securely...';
      case 'listening': return `${displayName} is listening...`;
      case 'speaking': return `${displayName} is speaking...`;
      case 'thinking': return `${displayName} is thinking...`;
      case 'disconnected': return 'Your conversation has ended.';
      default: return 'Connecting securely...';
    }
  };

  const status = getStatusPill();
  const dynamicVisualizerType = 'wave'; // Always wave for the reference layout

  return (
    <section className={cn('bg-[#f8fdfb] min-h-screen flex flex-col font-sans text-slate-800', className)} {...props}>
      {/* HEADER */}
      <header className="flex justify-between items-center py-4 px-6 lg:px-8 w-full shrink-0 border-b border-teal-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-[#008F70] p-1.5 rounded-md text-white flex items-center justify-center">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-[#006F5B]">Saathi</h1>
            <p className="text-xs text-slate-500 font-medium">Your Voice. Your Health. Our Priority.</p>
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
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm text-slate-700 hover:bg-slate-50">
              <Globe size={14} className="text-slate-500" /> English <ChevronDown size={14} className="text-slate-400" />
            </button>
            <button className="flex items-center gap-1.5 bg-[#edf9f3] text-teal-800 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-teal-50">
              <Info size={14} /> About Saathi
            </button>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 flex flex-col">
        <div className="max-w-[1500px] w-full mx-auto flex-1 flex flex-col min-h-0">
          
          {/* THREE COLUMN GRID */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(240px,20fr)_minmax(400px,55fr)_minmax(280px,25fr)] gap-6 min-h-0">
            
            {/* LEFT SIDEBAR (≈20%) */}
            <div className="flex flex-col gap-3 pr-2 pb-4">
              
              <div className="bg-[#F2FBF7] border-2 border-[#00A878] text-[#006F5B] font-bold px-4 py-3.5 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F8F2] p-2 rounded-full">
                    <Mic size={18} className="text-[#008F70]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px]">Voice Assistant</span>
                    <span className="text-[11.5px] text-[#008F70] font-semibold mt-0.5">Talk to Saathi</span>
                  </div>
                </div>
                <ChevronDown size={16} className="-rotate-90 text-[#008F70]" />
              </div>

              <div className="bg-white border border-slate-100 px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="bg-slate-50 p-2 rounded-full border border-slate-100">
                  <ShieldCheck size={18} className="text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-700">Health & Privacy</span>
                  <span className="text-[11.5px] text-slate-500 font-semibold mt-0.5">Your data is safe</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="bg-slate-50 p-2 rounded-full border border-slate-100">
                  <Info size={18} className="text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-700">How Saathi Works</span>
                  <span className="text-[11.5px] text-slate-500 font-semibold mt-0.5">Learn more</span>
                </div>
              </div>

              {/* SECURITY CARD */}
              <div className="bg-gradient-to-b from-[#F2FBF7] to-[#E8F8F2] border border-[#00A878]/10 p-6 rounded-2xl shadow-sm mt-4 flex flex-col items-center text-center">
                <div className="bg-[#008F70] p-3 rounded-xl text-white w-max mb-4 shadow-md">
                  <ShieldCheck size={28} strokeWidth={2} />
                </div>
                <h4 className="font-bold text-[#006F5B] text-[16px] mb-2 leading-tight">Your Health.<br/>Your Data.<br/>Always Secure.</h4>
                <p className="text-[12px] text-slate-600 font-medium mb-5 px-2">Your conversations are private and encrypted end-to-end.</p>
                
                <div className="bg-[#E8F8F2] text-[#008F70] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#00A878]/20 flex items-center gap-1.5 w-full justify-center">
                  <Shield size={12} className="text-[#008F70]" /> Enterprise-grade security
                </div>
              </div>

              {micDenied && (
                <div className="bg-[#fef2f2] border border-red-100 p-4 rounded-2xl mt-4">
                  <div className="flex items-start gap-3 mb-2">
                    <MicOff size={16} className="text-red-500 mt-0.5 shrink-0"/>
                    <div>
                      <h4 className="text-red-600 font-bold text-[13px] mb-1">Mic Denied</h4>
                      <p className="text-slate-600 text-[11px] font-medium leading-relaxed">Please allow microphone access to continue.</p>
                    </div>
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full py-1.5 mt-2 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">⟳ Try Again</button>
                </div>
              )}
            </div>

            {/* CENTER MAIN CALL PANEL (≈55%) */}
            <div className="bg-white border border-emerald-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden flex flex-col relative min-h-[600px] h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-[#f2faf7]/60 to-white pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center pt-8 pb-8 h-full justify-between">
                
                {/* Status Pill */}
                <div className="bg-[#F2FBF7] text-[#008F70] px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide shadow-sm border border-[#00A878]/20 flex items-center gap-2">
                  <Shield size={14} className="text-[#00A878]" /> Connected Securely
                </div>

                {/* Avatar and Visualizer Container */}
                <div className="relative flex items-center justify-center w-full my-4 grow">
                  
                  {/* Waveform / Visualizer (Behind) */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-90 mix-blend-multiply pointer-events-none">
                    <AudioVisualizer
                      audioVisualizerType={dynamicVisualizerType}
                      audioVisualizerColor={audioVisualizerColor || '#00A878'}
                      audioVisualizerColorShift={audioVisualizerColorShift}
                      audioVisualizerBarCount={audioVisualizerBarCount || 50}
                      audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
                      audioVisualizerRadialRadius={audioVisualizerRadialRadius}
                      audioVisualizerGridRowCount={audioVisualizerGridRowCount}
                      audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
                      audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth || 3}
                      isChatOpen={true}
                      className="w-full h-full scale-[2.5] lg:scale-[3.5]"
                    />
                  </div>

                  {/* Saathi Avatar */}
                  <div className="relative z-10 flex items-center justify-center w-56 h-56 lg:w-72 lg:h-72 shrink-0">
                    <div className="absolute inset-0 rounded-full border-[8px] border-[#d8f4e6] bg-[#f5fbf8] shadow-[0_0_50px_rgba(16,185,129,0.15)]"></div>
                    <div className="absolute inset-2 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-[#e2f4ec] flex items-center justify-center">
                      <img 
                        src="/saathi-avatar.png" 
                        alt="Saathi Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Text and Security Pill */}
                <div className="text-center px-4 mb-8 flex flex-col items-center z-20">
                  <h3 className="text-[26px] font-bold text-[#006F5B] mb-4">{getAssistantText()}</h3>
                  
                  <div className="bg-[#F2FBF7] text-[#008F70] text-[12px] font-semibold px-4 py-1.5 rounded-full border border-[#00A878]/20 flex items-center gap-2 shadow-sm">
                    <ShieldCheck size={14} className="text-[#00A878]" /> Your conversation is secure and private
                  </div>
                </div>

                {/* LiveKit Controls */}
                <div className="z-20 w-full flex justify-center px-4">
                  <AgentControlBar
                    variant="livekit"
                    controls={controls}
                    isChatOpen={true}
                    isConnected={session.isConnected}
                    onDisconnect={() => session.end()}
                    className="bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.06)] rounded-full p-2.5 max-w-max"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT LIVE TRANSCRIPT PANEL (≈25%) */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[500px] lg:h-full min-h-[600px] overflow-hidden relative">
              
              <div className="flex items-center justify-between px-5 h-[72px] border-b border-slate-100 bg-white z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#142A44] text-[20px]">Live Transcript</h3>
                  <span className="bg-[#E8F8F2] text-[#008F6B] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-1">beta</span>
                </div>
                <div className="text-[#008F6B] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v12"/><path d="M8 10v4"/><path d="M16 10v4"/><path d="M20 12v.01"/><path d="M4 12v.01"/></svg>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full" ref={scrollAreaRef}>
                 <div className="px-5 pt-3 w-full max-w-full pb-[60px]">
                   <AgentChatTranscript
                     agentState={agentState}
                     messages={messages}
                     className="w-full"
                   />
                 </div>
              </div>

              {/* Fixed Footer inside Transcript */}
              <div className="absolute bottom-0 left-0 right-0 h-[48px] px-5 border-t border-slate-100 bg-white/95 backdrop-blur text-[12px] text-[#008F6B] font-semibold flex items-center gap-2 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                <div className="w-1.5 h-1.5 bg-[#008F6B] rounded-full shrink-0"></div>
                Transcript is live and secure
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FULL WIDTH BOTTOM DISCLAIMER FOOTER */}
      <footer className="w-full bg-[#11674e] text-white py-3 px-4 shrink-0 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-[12px] font-medium text-emerald-50/90 text-center flex-wrap">
          <ShieldCheck size={16} className="text-emerald-300 shrink-0" strokeWidth={2.5} />
          <p>This is not a replacement for professional medical advice. In case of emergency, please contact your local emergency services.</p>
        </div>
      </footer>
    </section>
  );
}
