'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
  XCircle,
} from 'lucide-react';

interface RecentCall {
  outcome: string;
  createdAt: string;
  description: string;
}

interface AnalyticsData {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  recentCalls?: RecentCall[];
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

interface AnalyticsDashboardProps {
  triggerRefresh?: boolean;
}

export function AnalyticsDashboard({ triggerRefresh }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFullDashboard, setIsFullDashboard] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('just now');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://murf-livekit-backend-1080622951171.us-central1.run.app/api/analytics', {
        headers: {
          'Bypass-Tunnel-Reminder': 'true'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      setData(json);
      setLastUpdated(new Date().toLocaleTimeString());
      setError(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (triggerRefresh) {
      const timeout = setTimeout(fetchAnalytics, 1000);
      return () => clearTimeout(timeout);
    }
  }, [triggerRefresh]);

  const successRate =
    data && data.totalCalls > 0 ? Math.round((data.successfulCalls / data.totalCalls) * 100) : 0;

  // --- FULL DASHBOARD OVERLAY ---
  if (isFullDashboard && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] h-full w-full overflow-y-auto bg-[#f8fdfb] font-sans text-slate-800">
        <div className="mx-auto flex max-w-[1400px] flex-col px-6 py-10 lg:px-12">
          {/* Back Button */}
          <button
            onClick={() => setIsFullDashboard(false)}
            className="mb-6 flex items-center gap-2 self-start text-sm font-bold text-emerald-600 transition-all hover:-translate-x-1 hover:text-emerald-700"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Call Analytics
          </button>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
              Call Analytics Dashboard
            </h1>
            <p className="text-base font-medium text-slate-500 md:text-lg">
              Track how effectively your voice agent calls are performing.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50 px-3 py-1.5 text-[13px] font-bold text-emerald-700 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                Analytics Monitoring Active
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-500 shadow-sm">
                <RefreshCw
                  size={14}
                  className={loading ? 'animate-spin text-emerald-500' : 'text-emerald-500'}
                />
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
            {/* Total Calls */}
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-full bg-blue-50/50 blur-2xl transition-colors duration-500 group-hover:bg-blue-100/50"></div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-wider text-slate-500 uppercase">
                  Total Calls
                </p>
                <div className="rounded-xl bg-blue-50 p-2 text-blue-500">
                  <Phone size={18} strokeWidth={2.5} className="fill-blue-100/50" />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end">
                <p className="mb-1.5 text-3xl font-extrabold text-slate-800">
                  {data ? data.totalCalls : '-'}
                </p>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  Total voice sessions completed
                </p>
              </div>
            </div>

            {/* Successful Calls */}
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-full bg-emerald-50/50 blur-2xl transition-colors duration-500 group-hover:bg-emerald-100/50"></div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-wider text-slate-500 uppercase">
                  Successful Calls
                </p>
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end">
                <p className="mb-1.5 text-3xl font-extrabold text-slate-800">
                  {data ? data.successfulCalls : '-'}
                </p>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  User request resolved or human assistance successfully escalated
                </p>
              </div>
            </div>

            {/* Failed Calls */}
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-full bg-rose-50/50 blur-2xl transition-colors duration-500 group-hover:bg-rose-100/50"></div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-wider text-slate-500 uppercase">
                  Failed Calls
                </p>
                <div className="rounded-xl bg-rose-50 p-2 text-rose-500">
                  <XCircle size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end">
                <p className="mb-1.5 text-3xl font-extrabold text-slate-800">
                  {data ? data.failedCalls : '-'}
                </p>
                <p className="text-[13px] leading-snug font-medium text-slate-500">
                  User request not resolved before the call ended
                </p>
              </div>
            </div>

            {/* Success Rate */}
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="absolute -top-6 -right-6 -z-10 h-24 w-24 rounded-full bg-teal-50/50 blur-2xl transition-colors duration-500 group-hover:bg-teal-100/50"></div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold tracking-wider text-slate-500 uppercase">
                  Success Rate
                </p>
                <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                  <BarChart2 size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-end">
                <div className="mb-1.5 flex items-baseline gap-1">
                  <p className="text-3xl font-extrabold text-emerald-600">{successRate}</p>
                  <span className="text-lg font-bold text-emerald-600/70">%</span>
                </div>
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <p className="mt-auto text-[13px] leading-snug font-medium text-slate-500">
                  Percentage of calls meeting the success condition
                </p>
              </div>
            </div>
          </div>

          {/* Recent Call Outcomes */}
          <div className="relative mt-6 rounded-2xl border border-slate-100/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:p-8">
            {/* Header Row */}
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="mb-0.5 text-[20px] font-bold text-slate-800">
                  Recent Call Outcomes
                </h2>
                <p className="text-[14px] font-medium text-slate-500">
                  Latest voice agent call results
                </p>
              </div>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[13px] font-semibold text-emerald-600 transition-colors hover:bg-emerald-100/50">
                View all <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Timeline List */}
            {data?.recentCalls && data.recentCalls.length > 0 ? (
              <div className="relative flex w-full flex-col">
                {data.recentCalls.map((call, i) => {
                  const isLast = i === data.recentCalls!.length - 1;
                  const isSuccess = call.outcome === 'successful';

                  return (
                    <div key={i} className="relative flex items-start gap-4">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className="absolute top-[36px] bottom-[-16px] left-[9px] -z-0 w-[2px] bg-slate-100"></div>
                      )}

                      {/* Icon */}
                      <div
                        className={`relative z-10 mt-4 shrink-0 bg-white ${isSuccess ? 'text-emerald-500' : 'text-rose-400'}`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 size={20} strokeWidth={2.5} />
                        ) : (
                          <XCircle size={20} strokeWidth={2.5} />
                        )}
                      </div>

                      {/* Content Container */}
                      <div
                        className={`flex flex-1 flex-col justify-between gap-3 py-4 md:flex-row md:items-center ${!isLast ? 'border-b border-slate-100/60' : ''}`}
                      >
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                          <span
                            className={`text-[14px] font-semibold ${isSuccess ? 'text-emerald-600' : 'text-rose-500'} md:w-[90px]`}
                          >
                            {isSuccess ? 'Successful' : 'Failed'}
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-200 md:block"></span>
                          <span className="text-[14px] leading-snug font-medium text-slate-600">
                            {call.description}
                          </span>
                        </div>

                        <div className="mt-1 flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-slate-400 md:mt-0">
                          <Clock size={14} strokeWidth={2} />
                          {timeAgo(call.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Phone size={32} className="mb-3 text-slate-200" strokeWidth={2} />
                <p className="mb-1 text-[16px] font-bold text-slate-800">No calls yet</p>
                <p className="text-[14px] font-medium text-slate-500">
                  Your recent call outcomes will appear here.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-[13px] font-medium text-rose-500">
              Unable to connect to analytics backend. Please ensure the backend API is running.
            </p>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // --- COMPACT DASHBOARD (DEFAULT) ---
  return (
    <div className="relative z-20 flex w-full flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-emerald-600" size={24} strokeWidth={2.5} />
          <h3 className="text-xl font-bold tracking-tight text-slate-800">Call Analytics</h3>
        </div>
        <p className="text-[13px] font-medium text-slate-500">
          Real-time overview of your voice agent calls
        </p>
      </div>

      {/* Stacked Metric Cards */}
      <div className="mb-5 flex flex-col gap-3">
        {/* Total Calls */}
        <div className="flex items-center justify-between rounded-2xl border border-blue-50/50 bg-[#f2f7fc] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2.5 text-blue-500 shadow-sm">
              <Phone size={20} strokeWidth={2.5} className="fill-blue-100" />
            </div>
            <div>
              <p className="mb-0.5 text-[11px] font-bold tracking-widest text-slate-500">
                TOTAL CALLS
              </p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.totalCalls : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Successful Calls */}
        <div className="flex items-center justify-between rounded-2xl border border-emerald-50/50 bg-[#f0faf5] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shadow-sm">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="mb-0.5 text-[11px] font-bold tracking-widest text-slate-500">
                SUCCESSFUL CALLS
              </p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.successfulCalls : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Failed Calls */}
        <div className="flex items-center justify-between rounded-2xl border border-rose-50/50 bg-[#fff6f6] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-rose-100 p-2.5 text-rose-500 shadow-sm">
              <XCircle size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="mb-0.5 text-[11px] font-bold tracking-widest text-slate-500">
                FAILED CALLS
              </p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.failedCalls : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="mb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-slate-800">Success Rate</span>
          <span className="text-[14px] font-bold text-emerald-600">{successRate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mb-2 flex items-center justify-between border-t border-slate-100 pt-4 pb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-[12px] font-medium">Last updated: {lastUpdated}</span>
        </div>
        <button
          onClick={fetchAnalytics}
          className="rounded-lg border-2 border-emerald-500 px-4 py-1.5 text-[13px] font-bold text-emerald-600 transition-colors hover:bg-emerald-50"
        >
          Refresh Now
        </button>
      </div>

      {/* View Dashboard Button */}
      <button
        onClick={() => setIsFullDashboard(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
      >
        View Dashboard <ArrowRight size={18} strokeWidth={2.5} />
      </button>

      {error && (
        <p className="mt-3 text-center text-[11px] font-medium text-rose-500">
          Unable to connect to analytics backend.
        </p>
      )}
    </div>
  );
}
