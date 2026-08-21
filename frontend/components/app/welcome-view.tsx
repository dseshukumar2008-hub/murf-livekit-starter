import { useState } from 'react';
import {
  Check,
  ChevronDown,
  Clock,
  Globe,
  HeartHandshake,
  HeartPulse,
  Info,
  Leaf,
  Mic,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      stream.getTracks().forEach((track) => track.stop());
      setMicError(false);
      onStartCall();
    } catch (e) {
      setMicError(true);
    }
  };

  return (
    <div
      ref={ref}
      className="flex min-h-screen flex-col bg-[#F6FFFC] font-sans text-slate-800 selection:bg-teal-100 selection:text-teal-900"
    >
      {/* Header */}
      <header className="z-20 flex w-full items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full bg-emerald-700 p-2 text-white shadow-sm">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl leading-tight font-bold text-slate-800">Saathi</h1>
            <p className="text-sm font-medium text-slate-500">Your Voice for Better Health</p>
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
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto box-border flex w-full max-w-[1400px] flex-1 flex-col items-start gap-8 overflow-hidden px-4 pb-12 md:px-8 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:gap-10 xl:overflow-visible xl:px-12">
        {/* Left Column (Main Saathi Content) */}
        <div className="box-border flex w-full min-w-0 flex-col items-center xl:items-start">
          {/* Modern Premium AI Health Background Treatment */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex justify-end overflow-hidden">
            {/* Very soft white to pale mint gradient across the hero */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-[#F6FFFC] to-[#eaf8f4] opacity-70"></div>

            {/* Large subtle radial mint/teal glow behind the heart (top-right focused) */}
            <div className="absolute top-[-10%] right-[5%] h-[800px] w-[800px] bg-[radial-gradient(circle_at_center,#D9FFF2_0%,transparent_60%)] opacity-70 mix-blend-multiply blur-3xl"></div>

            {/* Soft blurred light patch slightly below the heart */}
            <div className="absolute top-[30%] right-[15%] h-[400px] w-[400px] rounded-full bg-teal-100/30 blur-[100px]"></div>

            {/* Elegant medical ECG/audio-wave flowing lines extending from the heart area */}
            <div className="absolute top-[40%] right-[30%] h-[2px] w-[120%] -rotate-[15deg] bg-gradient-to-r from-transparent via-teal-200/20 to-transparent"></div>
            <div className="absolute top-[45%] right-[25%] h-[1px] w-[100%] -rotate-[10deg] bg-gradient-to-r from-transparent via-emerald-200/20 to-transparent"></div>
            <div className="absolute top-[35%] right-[35%] h-[1px] w-[100%] -rotate-[20deg] bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent"></div>

            {/* Subtle thin geometric curves/arcs */}
            <div className="absolute top-[10%] right-[-10%] h-[700px] w-[700px] scale-110 rounded-full border-[1px] border-teal-100/30 opacity-70"></div>
            <div className="absolute top-[0%] right-[-5%] h-[850px] w-[850px] scale-125 rounded-full border-[0.5px] border-emerald-100/20 opacity-60"></div>
            <div className="absolute top-[20%] right-[-15%] h-[500px] w-[500px] scale-105 rounded-full border-[1px] border-cyan-100/20 opacity-50"></div>

            {/* Tiny low-opacity mint/cyan particles/dots around the hero area */}
            <div className="absolute top-24 right-48 h-1 w-1 rounded-full bg-teal-400 opacity-30 blur-[0.5px]"></div>
            <div className="absolute top-40 right-20 h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-20 blur-[0.5px]"></div>
            <div className="absolute top-[40%] right-[10%] h-1 w-1 rounded-full bg-cyan-400 opacity-30 blur-[0.5px]"></div>
            <div className="absolute top-[60%] right-[40%] h-1.5 w-1.5 rounded-full bg-teal-300 opacity-20 blur-[0.5px]"></div>
            <div className="absolute top-[15%] right-[35%] h-1 w-1 rounded-full bg-emerald-300 opacity-40 blur-[0.5px]"></div>
          </div>

          {/* Hero Section */}
          <div className="relative mt-4 mb-16 flex w-full flex-col items-center justify-between gap-12 lg:flex-row lg:gap-8">
            {/* Left Text */}
            <div className="flex w-full flex-col items-start lg:w-[45%] xl:pl-8">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-100/50 bg-teal-50/80 px-3 py-1.5 text-xs font-bold tracking-wider text-teal-700 uppercase shadow-sm">
                <Mic size={14} /> VOICE ASSISTANT
              </div>

              <h2 className="relative z-10 mb-6 text-5xl leading-[1.1] font-extrabold tracking-tight text-slate-800 lg:text-[4rem]">
                I&apos;m Saathi,
                <br />
                your{' '}
                <span className="relative whitespace-nowrap text-teal-700">
                  health companion.
                  <svg
                    className="absolute -bottom-1 left-0 h-4 w-full text-teal-200"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h2>

              <p className="mb-10 max-w-md text-xl leading-relaxed font-medium text-slate-600">
                Talk to me about your symptoms, wellness questions and healthy living.
              </p>

              <div className="relative z-20 flex max-w-sm items-start gap-4 rounded-[20px] border border-emerald-100/60 bg-[#f0faf5] p-5 shadow-sm">
                <div className="mt-0.5 shrink-0 rounded-xl bg-emerald-500 p-2 text-white shadow-sm">
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="mb-1 text-sm leading-snug font-bold text-teal-900">
                    Your Health, Your Data,
                    <br />
                    Always Secure
                  </h4>
                  <p className="pr-4 text-[13px] leading-snug font-medium text-slate-500">
                    Your conversations are private and encrypted.
                  </p>
                </div>
              </div>
            </div>

            {/* Center/Right Visual & CTA */}
            <div className="relative flex w-full flex-col items-center pt-8 lg:w-[55%]">
              <div className="relative flex flex-col items-center">
                {/* Circular Visual - Modern AI Health Interface */}
                <div className="relative mb-8 flex h-56 w-56 items-center justify-center md:h-[280px] md:w-[280px]">
                  {/* Soft outer glow */}
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-tr from-[#00A878] via-[#00BFA6] to-[#20CFE8] opacity-15 blur-2xl"></div>

                  {/* Concentric rings */}
                  <div className="absolute inset-2 rounded-full border border-teal-300/30"></div>
                  <div className="absolute inset-6 animate-[spin_60s_linear_infinite] rounded-full border border-[#00BFA6]/40 shadow-[0_0_15px_rgba(0,191,166,0.15)]">
                    {/* Glowing floating dot 1 */}
                    <div className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-[#20CFE8] shadow-[0_0_10px_#20CFE8]"></div>
                  </div>
                  <div className="absolute inset-10 animate-[spin_90s_linear_infinite_reverse] rounded-full border border-dashed border-emerald-400/40">
                    {/* Glowing floating dot 2 */}
                    <div className="absolute right-4 bottom-4 h-2 w-2 rounded-full bg-[#00A878] shadow-[0_0_8px_#00A878]"></div>
                    {/* Glowing floating dot 3 */}
                    <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 rounded-full bg-[#00BFA6] shadow-[0_0_8px_#00BFA6]"></div>
                  </div>

                  {/* Inner white circle */}
                  <div className="absolute inset-14 z-10 flex items-center justify-center rounded-full bg-white shadow-2xl shadow-teal-900/10">
                    {/* Gentle green/teal glow around the heart */}
                    <div className="absolute inset-4 animate-[pulse_4s_ease-in-out_infinite] rounded-full bg-[#00BFA6] opacity-15 blur-md"></div>

                    {/* Vibrant Heart with Gradient & 3D Shadow */}
                    <div className="relative z-20 flex h-16 w-16 items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="url(#heart-gradient)"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,168,120,0.35)] filter"
                      >
                        <defs>
                          <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00A878" />
                            <stop offset="50%" stopColor="#00BFA6" />
                            <stop offset="100%" stopColor="#20CFE8" />
                          </linearGradient>
                        </defs>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        <path
                          d="M4 12h3l2.5-4 3 10 2.5-6h5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          className="drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Subtle sparkle/highlight accents */}
                  <div className="absolute top-[20%] right-[20%] z-20 h-1.5 w-1.5 animate-pulse rounded-full bg-white opacity-80 shadow-[0_0_5px_white]"></div>
                  <div className="absolute bottom-[30%] left-[22%] z-20 h-1 w-1 rounded-full bg-white opacity-60 shadow-[0_0_4px_white]"></div>
                </div>

                <h3 className="mb-2 text-[28px] font-bold tracking-tight text-slate-800">
                  {hasEnded ? 'Conversation ended' : 'Chat live with Saathi'}
                </h3>
                <p className="mb-8 text-[15px] font-medium text-slate-500">
                  I&apos;m here to listen and help.
                </p>

                <button
                  onClick={handleStartCall}
                  className="group relative flex w-full max-w-sm min-w-[280px] items-center justify-center gap-3 rounded-[30px] bg-gradient-to-b from-[#f98a48] to-[#f46824] px-10 py-[18px] text-[17px] font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:shadow-orange-500/40"
                >
                  <Mic size={22} className="group-hover:animate-pulse" />
                  {hasEnded ? 'Talk Again' : 'Talk to Saathi'}
                </button>

                {micError && (
                  <p className="absolute -bottom-20 mt-5 max-w-sm rounded-xl border border-red-100 bg-red-50 p-3 text-center text-xs font-semibold text-red-500">
                    We need microphone access to talk with you. Please enable microphone permissions
                    in your browser settings and try again.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Row */}
          <div className="relative z-20 mb-10 box-border flex w-full flex-wrap items-start justify-between gap-6 overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:flex-nowrap lg:items-center lg:gap-4">
            <div className="flex flex-1 items-start gap-4">
              <div className="shrink-0 rounded-full bg-[#eefcf5] p-3 text-emerald-500">
                <ShieldCheck size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="mb-0.5 text-[15px] font-bold text-slate-800">Private & Secure</h4>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  Your data stays private
                  <br />
                  and protected
                </p>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-100 lg:block"></div>

            <div className="flex flex-1 items-start gap-4">
              <div className="shrink-0 rounded-full bg-[#eaf8f8] p-3 text-teal-500">
                <Clock size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="mb-0.5 text-[15px] font-bold text-slate-800">24/7 Assistance</h4>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  Get help anytime,
                  <br />
                  anywhere
                </p>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-100 lg:block"></div>

            <div className="flex flex-1 items-start gap-4">
              <div className="shrink-0 rounded-full bg-[#f2effb] p-3 text-purple-500">
                <Users size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="mb-0.5 text-[15px] font-bold text-slate-800">Health for All</h4>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  Accessible care
                  <br />
                  for everyone
                </p>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-slate-100 lg:block"></div>

            <div className="flex flex-1 items-start gap-4">
              <div className="shrink-0 rounded-full bg-[#f0f8e9] p-3 text-lime-600">
                <Leaf size={26} strokeWidth={2.2} />
              </div>
              <div>
                <h4 className="mb-0.5 text-[15px] font-bold text-slate-800">Trusted Information</h4>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  Guidance based on reliable
                  <br />
                  health knowledge
                </p>
              </div>
            </div>
          </div>

          {/* How Saathi Can Help Section */}
          <div className="relative z-20 mb-8 flex w-full flex-col gap-8 rounded-3xl border border-blue-50 bg-[#f4f7fc] px-6 py-8 shadow-sm lg:px-8">
            <div className="flex w-full flex-col items-center justify-between gap-6 xl:flex-row xl:gap-4">
              <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-indigo-50 bg-white text-indigo-800 shadow-sm">
                  <HeartHandshake size={28} strokeWidth={2.2} />
                </div>
                <h3 className="text-center text-[22px] font-bold tracking-tight text-slate-800 sm:text-left">
                  How Saathi Can Help
                </h3>
              </div>

              <div className="flex w-full flex-row flex-wrap justify-center gap-3 xl:justify-end">
                <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-slate-700 shadow-sm lg:px-5 lg:text-[14px]">
                  <Check size={18} strokeWidth={3} className="shrink-0 text-emerald-600" />{' '}
                  Understand your symptoms
                </div>
                <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-slate-700 shadow-sm lg:px-5 lg:text-[14px]">
                  <Check size={18} strokeWidth={3} className="shrink-0 text-emerald-600" /> Learn
                  about healthy habits
                </div>
                <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-slate-700 shadow-sm lg:px-5 lg:text-[14px]">
                  <Check size={18} strokeWidth={3} className="shrink-0 text-emerald-600" /> Get
                  general wellness guidance
                </div>
                <div className="flex items-center gap-2.5 rounded-full bg-white px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap text-slate-700 shadow-sm lg:px-5 lg:text-[14px]">
                  <Check size={18} strokeWidth={3} className="shrink-0 text-emerald-600" /> Know
                  when to seek help
                </div>
              </div>
            </div>

            <div className="w-full border-t border-blue-100/60 pt-6 text-center">
              <p className="mb-1 text-[13.5px] font-medium text-slate-600">
                Note: I am not a doctor and cannot diagnose or prescribe medicines.
              </p>
              <p className="text-[13.5px] font-medium text-slate-600">
                For emergencies, please contact your{' '}
                <span className="font-semibold text-[#e25d5d]">local emergency services</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics Sidebar */}
        <aside className="box-border flex w-full min-w-0 flex-col gap-6 xl:sticky xl:top-8">
          <AnalyticsDashboard triggerRefresh={hasEnded} />

          {/* Privacy Card */}
          <div className="flex w-full items-start gap-4 rounded-3xl border border-emerald-100/60 bg-[#f0faf5] p-5 shadow-sm">
            <div className="mt-0.5 shrink-0 text-emerald-600">
              <ShieldCheck size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="mb-1 text-sm leading-snug font-bold text-emerald-900">
                We respect your privacy
              </h4>
              <p className="text-[12px] leading-snug font-medium text-slate-600">
                No personal or sensitive information
                <br />
                is displayed here.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="relative z-30 mt-auto w-full shrink-0 bg-[#11674e] px-6 py-3.5 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2.5 text-center text-[13px] font-medium text-emerald-50/90">
          <Shield size={16} className="shrink-0 text-emerald-100" strokeWidth={2.5} />
          <p>
            This is not a replacement for professional medical advice. In case of emergency, please
            contact your local emergency services.
          </p>
        </div>
      </footer>
    </div>
  );
};
