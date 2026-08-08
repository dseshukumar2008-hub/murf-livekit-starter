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

  const getAssistantText = () => {
    switch (agentState) {
      case 'connecting': return 'Connecting securely...';
      case 'listening': return "I'm listening. How can I help you today?";
      case 'speaking': return 'Health Assistant is speaking...';
      case 'thinking': return 'Health Assistant is thinking...';
      case 'disconnected': return 'Your conversation has ended.';
      default: return 'Connecting securely...';
    }
  };

  const status = getStatusPill();
  const dynamicVisualizerType = agentState === 'speaking' ? 'wave' : agentState === 'listening' ? 'aura' : 'aura';

  return (
    <section className={cn('bg-[#f8fdfb] min-h-screen flex flex-col font-sans text-slate-800', className)} {...props}>
      {/* HEADER */}
      <header className="flex justify-between items-center py-4 px-6 lg:px-8 w-full shrink-0 border-b border-teal-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-teal-700 p-1.5 rounded-md text-white flex items-center justify-center">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-teal-900">Saathi</h1>
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
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-20">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          
          {/* THREE COLUMN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-6 xl:gap-8">
            
            {/* LEFT SIDEBAR */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#eefcf5] border border-emerald-100 text-teal-800 font-semibold px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                <Mic size={18} className="text-teal-600" /> Voice Assistant
              </div>
              <div className="bg-[#eefcf5] border border-emerald-100 p-4 rounded-xl shadow-sm mt-4 lg:mt-8">
                <div className="bg-teal-700 p-2 rounded-lg text-white w-max mb-3 shadow-sm">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <h4 className="font-bold text-teal-900 text-[15px] mb-1 leading-snug">Your Health<br/>Your Data<br/>Always Secure</h4>
              </div>
            </div>

            {/* CENTER MAIN CALL PANEL */}
            <div className="bg-white border border-emerald-50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col relative h-[500px] lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-b from-[#f2faf7] to-white pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col items-center pt-8 pb-10 h-full justify-between">
                
                {/* Status Pill */}
                <div className={cn("px-4 py-1.5 rounded-full text-sm font-bold tracking-wide shadow-sm border border-black/5 flex items-center gap-2", status.color)}>
                  <span className="text-[10px]">{status.icon}</span> {status.text}
                </div>

                {/* Waveform / Visualizer */}
                <div className="h-24 w-full flex items-center justify-center my-4 overflow-hidden px-8">
                  <div className="w-full max-w-[300px] h-full relative flex items-center justify-center">
                    <AudioVisualizer
                      audioVisualizerType={dynamicVisualizerType}
                      audioVisualizerColor={audioVisualizerColor || '#059669'}
                      audioVisualizerColorShift={audioVisualizerColorShift}
                      audioVisualizerBarCount={audioVisualizerBarCount || 30}
                      audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
                      audioVisualizerRadialRadius={audioVisualizerRadialRadius}
                      audioVisualizerGridRowCount={audioVisualizerGridRowCount}
                      audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
                      audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth}
                      isChatOpen={true}
                      className="w-full h-full scale-[2.5]"
                    />
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative flex items-center justify-center w-36 h-36 lg:w-40 lg:h-40 shrink-0 mb-6 mt-4">
                  <div className="absolute inset-0 rounded-full border-[10px] border-[#eaf8f3] bg-[#f5fbf8]"></div>
                  <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 text-teal-600 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full flex items-center justify-center shadow-inner" style={{ clipPath: 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' }}>
                      <HeartPulse size={48} className="text-white drop-shadow-md relative top-[-2px] ml-1" />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="text-center px-4">
                  <h3 className="text-2xl font-bold text-teal-900 mb-2">Saathi</h3>
                  <p className="text-slate-600 font-medium text-[15px]">{getAssistantText()}</p>
                </div>

                {/* Security Badge */}
                <div className="bg-[#f0faf5] text-teal-800 text-[11px] font-semibold px-3 py-1 rounded-full border border-teal-100 flex items-center gap-1.5 mt-4">
                  <Shield size={12} className="text-teal-600" /> Your conversation is secure and private
                </div>

                {/* LiveKit Controls */}
                <div className="mt-auto mb-2 w-full max-w-sm">
                  <AgentControlBar
                    variant="livekit"
                    controls={controls}
                    isChatOpen={true}
                    isConnected={session.isConnected}
                    onDisconnect={() => session.end()}
                    className="bg-white/80 backdrop-blur border-emerald-100 shadow-md p-2"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT LIVE TRANSCRIPT PANEL */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[500px] lg:h-[600px] overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-white z-10 shrink-0">
                <h3 className="font-bold text-slate-800 text-[15px]">Live Transcript</h3>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">beta</span>
              </div>
              
              <div className="flex-1 overflow-y-auto relative bg-[#fcfdfd]" ref={scrollAreaRef}>
                 {/* Reusing existing AgentChatTranscript inside the constrained area */}
                 <div className="p-4 w-full h-full max-w-full">
                   <AgentChatTranscript
                     agentState={agentState}
                     messages={messages}
                     className="w-full text-sm [&_.is-user>div]:bg-white [&_.is-user>div]:border [&_.is-user>div]:border-slate-100 [&_.is-user>div]:text-slate-700 [&_.is-user>div]:shadow-sm [&_.is-agent>div]:bg-[#f4faf7] [&_.is-agent>div]:border [&_.is-agent>div]:border-teal-50 [&_.is-agent>div]:text-teal-900 [&_.is-agent>div]:shadow-sm flex flex-col gap-4"
                   />
                 </div>
              </div>

              {agentState === 'thinking' && (
                <div className="p-3 border-t border-slate-100 bg-white text-xs text-slate-500 font-medium flex items-center justify-between shrink-0">
                  Agent is typing...
                  <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-150"></div></div>
                </div>
              )}
            </div>

          </div>

          {/* 5-STATE FLOW DIAGRAM */}
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm mt-4 overflow-x-auto">
            <div className="flex min-w-[900px] lg:grid lg:grid-cols-5 lg:min-w-0 gap-4">
              
              {/* Ready */}
              <div className="flex flex-col items-center text-center px-2 flex-1 border-r border-slate-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center mb-3">1</div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Ready</h4>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full mb-6"> <span className="text-[10px]">☻</span> Ready to help you</div>
                <div className="w-20 h-20 bg-teal-700 rounded-full flex items-center justify-center text-white mb-6 shadow-sm"><HeartPulse size={36} /></div>
                <p className="text-[11px] text-slate-500 font-medium mb-6 px-2">Press the button below to start a conversation</p>
                <button onClick={() => session.start()} className="bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold w-full max-w-[140px] flex items-center justify-center gap-1.5 mt-auto hover:bg-emerald-800"><Phone size={12}/> Start Call</button>
              </div>

              {/* Connecting */}
              <div className="flex flex-col items-center text-center px-2 flex-1 border-r border-slate-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center mb-3">2</div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Connecting</h4>
                <div className="text-[11px] font-semibold text-teal-700 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full mb-6"> ⧖ Connecting...</div>
                <div className="w-20 h-20 rounded-full border-[3px] border-dashed border-teal-500 animate-[spin_20s_linear_infinite] flex items-center justify-center mb-6 relative">
                  <div className="w-16 h-16 bg-teal-700 rounded-full flex items-center justify-center text-white absolute animate-none shadow-sm"><HeartPulse size={28} /></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-6 px-2">Please wait while I join the call...</p>
                <div className="flex gap-1.5 mt-auto mb-2 text-teal-400"><div className="w-2 h-2 bg-current rounded-full"></div><div className="w-2 h-2 bg-current rounded-full"></div><div className="w-2 h-2 bg-current rounded-full"></div></div>
              </div>

              {/* Listening */}
              <div className="flex flex-col items-center text-center px-2 flex-1 border-r border-slate-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center mb-3">3</div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Listening</h4>
                <div className="text-[11px] font-semibold text-teal-700 flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-full mb-6"> 👂 Listening...</div>
                <div className="w-20 h-20 rounded-full bg-[#eaf8f3] border-4 border-white flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(20,184,166,0.3)]"><div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center text-white"><HeartPulse size={20} /></div></div>
                <div className="text-teal-500 flex items-center gap-0.5 h-6 mb-3">
                  {/* Fake waveform */}
                  <div className="w-1 h-2 bg-current rounded-full"></div><div className="w-1 h-4 bg-current rounded-full"></div><div className="w-1 h-6 bg-current rounded-full"></div><div className="w-1 h-3 bg-current rounded-full"></div><div className="w-1 h-5 bg-current rounded-full"></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-2 px-2 mt-auto">Listening to you...</p>
              </div>

              {/* Speaking */}
              <div className="flex flex-col items-center text-center px-2 flex-1 border-r border-slate-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center mb-3">4</div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Speaking</h4>
                <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full mb-6"> ∿ Speaking...</div>
                <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]"><div className="w-12 h-12 bg-teal-700 rounded-full flex items-center justify-center text-white"><HeartPulse size={20} /></div></div>
                <div className="text-blue-500 flex items-center gap-0.5 h-6 mb-3">
                  <div className="w-1 h-3 bg-current rounded-full"></div><div className="w-1 h-6 bg-current rounded-full"></div><div className="w-1 h-4 bg-current rounded-full"></div><div className="w-1 h-7 bg-current rounded-full"></div><div className="w-1 h-2 bg-current rounded-full"></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-2 px-2 mt-auto">Health Assistant is speaking...</p>
              </div>

              {/* Call Ended */}
              <div className="flex flex-col items-center text-center px-2 flex-1 border-r border-slate-100 last:border-0">
                <div className="w-6 h-6 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center mb-3">5</div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Call Ended</h4>
                <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full mb-6"> ✓ Call Ended</div>
                <div className="w-20 h-20 bg-teal-800/90 rounded-full flex items-center justify-center text-white mb-6 shadow-sm"><HeartPulse size={36} /></div>
                <p className="text-[11px] text-slate-500 font-medium mb-6 px-2">Call ended.<br/>How else can I help you?</p>
                <button onClick={() => session.start()} className="bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold w-full max-w-[140px] flex items-center justify-center gap-1.5 mt-auto hover:bg-emerald-800"><Phone size={12}/> Start New Call</button>
              </div>

            </div>
          </div>

          {/* BOTTOM ROW (Microphone Error & Features) */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* MICROPHONE ERROR PANEL (Conditional) */}
            {micDenied && (
              <div className="bg-[#fef2f2] border border-red-100 p-6 rounded-2xl flex-1 max-w-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-red-100 p-2.5 rounded-full text-red-500 shrink-0"><MicOff size={24}/></div>
                  <div>
                    <h4 className="text-red-600 font-bold text-[15px] mb-1">Microphone Access Denied</h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">We can't hear you because microphone access is blocked. Please allow microphone access to continue.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 text-xs text-slate-600 font-medium border border-red-50">
                  <p className="font-bold text-slate-800 mb-2">How to enable:</p>
                  <ol className="flex flex-col gap-2 pl-1 mb-4">
                    <li className="flex gap-2"><span className="bg-red-100 text-red-600 w-4 h-4 flex items-center justify-center rounded text-[10px] shrink-0 font-bold">1</span> Click the lock icon in your browser's address bar</li>
                    <li className="flex gap-2"><span className="bg-red-100 text-red-600 w-4 h-4 flex items-center justify-center rounded text-[10px] shrink-0 font-bold">2</span> Set Microphone to "Allow"</li>
                    <li className="flex gap-2"><span className="bg-red-100 text-red-600 w-4 h-4 flex items-center justify-center rounded text-[10px] shrink-0 font-bold">3</span> Refresh the page and try again</li>
                  </ol>
                  <button onClick={() => window.location.reload()} className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">⟳ Try Again</button>
                </div>
              </div>
            )}

            {/* WHY HEALTH ACCESS */}
            <div className={cn("bg-[#f0faf5] rounded-2xl p-6 lg:p-8 flex flex-col justify-center border border-teal-50", !micDenied ? "w-full" : "flex-[2]")}>
              <h3 className="text-lg font-bold text-teal-900 mb-6 text-center lg:text-left">Why Saathi?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-emerald-600 text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center mb-3 shadow-sm"><ShieldCheck size={20}/></div>
                  <h4 className="font-bold text-teal-900 text-[13px] mb-1">Private & Secure</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Your conversations<br/>are encrypted</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-emerald-600 text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center mb-3 shadow-sm">
                    {/* Simulated 24/7 icon */}
                    <div className="relative"><Clock size={20} strokeWidth={2}/><span className="absolute -top-1 -right-2 text-[8px] font-bold bg-white text-emerald-600 px-0.5 rounded">24</span></div>
                  </div>
                  <h4 className="font-bold text-teal-900 text-[13px] mb-1">24/7 Assistance</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Get help anytime,<br/>anywhere</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-emerald-600 text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center mb-3 shadow-sm"><Users size={20}/></div>
                  <h4 className="font-bold text-teal-900 text-[13px] mb-1">Health for All</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Accessible care<br/>for everyone</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="bg-lime-600 text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center mb-3 shadow-sm"><Leaf size={20}/></div>
                  <h4 className="font-bold text-teal-900 text-[13px] mb-1">Trusted Information</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Verified health info<br/>from experts</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#11674e] text-white py-3.5 px-6 mt-auto shrink-0 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-[13px] font-medium text-emerald-50/90 text-center flex-wrap">
          <Shield size={16} className="text-emerald-100 shrink-0" strokeWidth={2.5} />
          <p>This is not a replacement for professional medical advice. In case of emergency, please contact your local emergency services.</p>
        </div>
      </footer>
    </section>
  );
}
