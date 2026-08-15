'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Globe,
  HeartPulse,
  Info,
  Leaf,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { cn } from '@/lib/shadcn/utils';
import { AudioVisualizer } from './audio-visualizer';

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
  const agent = useAgent();
  const agentState = agent.state;

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
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((res) => {
        if (res.state === 'denied') setMicDenied(true);
        res.onchange = () => setMicDenied(res.state === 'denied');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getStatusPill = () => {
    switch (agentState) {
      case 'connecting':
        return { text: 'Connecting...', color: 'text-amber-700 bg-amber-100', icon: '●' };
      case 'listening':
        return { text: 'Listening...', color: 'text-teal-700 bg-teal-100', icon: '●' };
      case 'speaking':
        return { text: 'Speaking...', color: 'text-blue-700 bg-blue-100', icon: '●' };
      case 'thinking':
        return { text: 'Thinking...', color: 'text-purple-700 bg-purple-100', icon: '●' };
      case 'disconnected':
        return { text: 'Call Ended', color: 'text-emerald-700 bg-emerald-100', icon: '✓' };
      default:
        return { text: 'Connecting...', color: 'text-amber-700 bg-amber-100', icon: '●' };
    }
  };

  const getAssistantText = () => {
    // Derive the display name from the actual LiveKit agent state
    let displayName = 'Saathi';
    if (agent.name && agent.name.toLowerCase().includes('specialist')) {
      displayName = 'Care Specialist';
    } else if (
      agent.attributes &&
      agent.attributes.agentName &&
      (agent.attributes.agentName as string).toLowerCase().includes('specialist')
    ) {
      displayName = 'Care Specialist';
    }

    switch (agentState) {
      case 'connecting':
        return 'Connecting securely...';
      case 'listening':
        return `${displayName} is listening...`;
      case 'speaking':
        return `${displayName} is speaking...`;
      case 'thinking':
        return `${displayName} is thinking...`;
      case 'disconnected':
        return 'Your conversation has ended.';
      default:
        return 'Connecting securely...';
    }
  };

  const status = getStatusPill();
  const dynamicVisualizerType = 'wave'; // Always wave for the reference layout

  return (
    <section
      className={cn('flex min-h-screen flex-col bg-[#f8fdfb] font-sans text-slate-800', className)}
      {...props}
    >
      {/* HEADER */}
      <header className="flex w-full shrink-0 items-center justify-between border-b border-teal-50 bg-white px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-md bg-[#008F70] p-1.5 text-white">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-[#006F5B]">Saathi</h1>
            <p className="text-xs font-medium text-slate-500">
              Your Voice. Your Health. Our Priority.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <div className="font-mono text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            Built with{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.livekit.io/agents"
              className="underline underline-offset-4 transition-colors hover:text-slate-800"
            >
              LiveKit Agents
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:flex">
              <Globe size={14} className="text-slate-500" /> English{' '}
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-[#edf9f3] px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50">
              <Info size={14} /> About Saathi
            </button>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col">
          {/* THREE COLUMN GRID */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(240px,20fr)_minmax(400px,55fr)_minmax(280px,25fr)]">
            {/* LEFT SIDEBAR (≈20%) */}
            <div className="flex flex-col gap-3 pr-2 pb-4">
              <div className="flex cursor-pointer items-center justify-between rounded-2xl border-2 border-[#00A878] bg-[#F2FBF7] px-4 py-3.5 font-bold text-[#006F5B] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-[#E8F8F2] p-2">
                    <Mic size={18} className="text-[#008F70]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px]">Voice Assistant</span>
                    <span className="mt-0.5 text-[11.5px] font-semibold text-[#008F70]">
                      Talk to Saathi
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className="-rotate-90 text-[#008F70]" />
              </div>

              <div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors hover:bg-slate-50">
                <div className="rounded-full border border-slate-100 bg-slate-50 p-2">
                  <ShieldCheck size={18} className="text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-700">Health & Privacy</span>
                  <span className="mt-0.5 text-[11.5px] font-semibold text-slate-500">
                    Your data is safe
                  </span>
                </div>
              </div>

              <div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors hover:bg-slate-50">
                <div className="rounded-full border border-slate-100 bg-slate-50 p-2">
                  <Info size={18} className="text-slate-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-700">How Saathi Works</span>
                  <span className="mt-0.5 text-[11.5px] font-semibold text-slate-500">
                    Learn more
                  </span>
                </div>
              </div>

              {/* SECURITY CARD */}
              <div className="mt-4 flex flex-col items-center rounded-2xl border border-[#00A878]/10 bg-gradient-to-b from-[#F2FBF7] to-[#E8F8F2] p-6 text-center shadow-sm">
                <div className="mb-4 w-max rounded-xl bg-[#008F70] p-3 text-white shadow-md">
                  <ShieldCheck size={28} strokeWidth={2} />
                </div>
                <h4 className="mb-2 text-[16px] leading-tight font-bold text-[#006F5B]">
                  Your Health.
                  <br />
                  Your Data.
                  <br />
                  Always Secure.
                </h4>
                <p className="mb-5 px-2 text-[12px] font-medium text-slate-600">
                  Your conversations are private and encrypted end-to-end.
                </p>

                <div className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#00A878]/20 bg-[#E8F8F2] px-3 py-1.5 text-[11px] font-bold text-[#008F70]">
                  <Shield size={12} className="text-[#008F70]" /> Enterprise-grade security
                </div>
              </div>

              {micDenied && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-[#fef2f2] p-4">
                  <div className="mb-2 flex items-start gap-3">
                    <MicOff size={16} className="mt-0.5 shrink-0 text-red-500" />
                    <div>
                      <h4 className="mb-1 text-[13px] font-bold text-red-600">Mic Denied</h4>
                      <p className="text-[11px] leading-relaxed font-medium text-slate-600">
                        Please allow microphone access to continue.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    ⟳ Try Again
                  </button>
                </div>
              )}
            </div>

            {/* CENTER MAIN CALL PANEL (≈55%) */}
            <div className="relative flex h-full min-h-[600px] flex-col overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f2faf7]/60 to-white"></div>

              <div className="relative z-10 flex h-full flex-col items-center justify-between pt-8 pb-8">
                {/* Status Pill */}
                <div className="flex items-center gap-2 rounded-full border border-[#00A878]/20 bg-[#F2FBF7] px-4 py-1.5 text-[13px] font-bold tracking-wide text-[#008F70] shadow-sm">
                  <Shield size={14} className="text-[#00A878]" /> Connected Securely
                </div>

                {/* Avatar and Visualizer Container */}
                <div className="relative my-4 flex w-full grow items-center justify-center">
                  {/* Waveform / Visualizer (Behind) */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-90 mix-blend-multiply">
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
                      className="h-full w-full scale-[2.5] lg:scale-[3.5]"
                    />
                  </div>

                  {/* Saathi Avatar */}
                  <div className="relative z-10 flex h-56 w-56 shrink-0 items-center justify-center lg:h-72 lg:w-72">
                    <div className="absolute inset-0 rounded-full border-[8px] border-[#d8f4e6] bg-[#f5fbf8] shadow-[0_0_50px_rgba(16,185,129,0.15)]"></div>
                    <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-[#e2f4ec] shadow-xl">
                      <img
                        src="/saathi-avatar.png"
                        alt="Saathi Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Text and Security Pill */}
                <div className="z-20 mb-8 flex flex-col items-center px-4 text-center">
                  <h3 className="mb-4 text-[26px] font-bold text-[#006F5B]">
                    {getAssistantText()}
                  </h3>

                  <div className="flex items-center gap-2 rounded-full border border-[#00A878]/20 bg-[#F2FBF7] px-4 py-1.5 text-[12px] font-semibold text-[#008F70] shadow-sm">
                    <ShieldCheck size={14} className="text-[#00A878]" /> Your conversation is secure
                    and private
                  </div>
                </div>

                {/* LiveKit Controls */}
                <div className="z-20 flex w-full justify-center px-4">
                  <AgentControlBar
                    variant="livekit"
                    controls={controls}
                    isChatOpen={true}
                    isConnected={session.isConnected}
                    onDisconnect={() => session.end()}
                    className="max-w-max rounded-full border border-slate-100 bg-white p-2.5 shadow-[0_4px_20px_rgb(0,0,0,0.06)]"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT LIVE TRANSCRIPT PANEL (≈25%) */}
            <div className="relative flex h-[500px] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:h-full">
              <div className="z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[20px] font-bold text-[#142A44]">Live Transcript</h3>
                  <span className="ml-1 rounded bg-[#E8F8F2] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#008F6B] uppercase">
                    beta
                  </span>
                </div>
                <div className="flex items-center text-[#008F6B]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 6v12" />
                    <path d="M8 10v4" />
                    <path d="M16 10v4" />
                    <path d="M20 12v.01" />
                    <path d="M4 12v.01" />
                  </svg>
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto bg-white [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200"
                ref={scrollAreaRef}
              >
                <div className="w-full max-w-full px-5 pt-3 pb-[60px]">
                  <AgentChatTranscript
                    agentState={agentState}
                    messages={messages}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Fixed Footer inside Transcript */}
              <div className="absolute right-0 bottom-0 left-0 z-20 flex h-[48px] shrink-0 items-center gap-2 border-t border-slate-100 bg-white/95 px-5 text-[12px] font-semibold text-[#008F6B] shadow-[0_-2px_10px_rgba(0,0,0,0.02)] backdrop-blur">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#008F6B]"></div>
                Transcript is live and secure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH BOTTOM DISCLAIMER FOOTER */}
      <footer className="relative z-30 w-full shrink-0 bg-[#11674e] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2.5 text-center text-[12px] font-medium text-emerald-50/90">
          <ShieldCheck size={16} className="shrink-0 text-emerald-300" strokeWidth={2.5} />
          <p>
            This is not a replacement for professional medical advice. In case of emergency, please
            contact your local emergency services.
          </p>
        </div>
      </footer>
    </section>
  );
}
