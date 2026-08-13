'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BarChart2, CheckCircle2, XCircle, Phone, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';

interface AnalyticsData {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
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
      const response = await fetch('http://localhost:8000/api/analytics');
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

  const successRate = data && data.totalCalls > 0 
    ? Math.round((data.successfulCalls / data.totalCalls) * 100) 
    : 0;

  // --- FULL DASHBOARD OVERLAY ---
  if (isFullDashboard && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-[#f8fdfb] overflow-y-auto w-full h-full font-sans text-slate-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 flex flex-col">
          
          {/* Back Button */}
          <button 
            onClick={() => setIsFullDashboard(false)}
            className="self-start mb-10 text-emerald-600 font-bold flex items-center gap-2 hover:text-emerald-700 hover:-translate-x-1 transition-all"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Call Analytics
          </button>

          {/* Header */}
          <div className="mb-12 flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Call Performance Analytics</h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium">Track how effectively your voice agent calls are performing.</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Call Monitoring Active
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-white px-4 py-2.5 rounded-full border border-slate-100 shadow-sm">
                <RefreshCw size={16} className={loading ? "animate-spin text-emerald-500" : "text-emerald-500"} />
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            
            {/* Total Calls */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100/50 transition-colors duration-500"></div>
              <div className="bg-blue-100 text-blue-500 p-4 rounded-2xl shadow-sm w-fit mb-6">
                <Phone size={28} strokeWidth={2.5} className="fill-blue-100" />
              </div>
              <p className="text-[13px] font-bold text-slate-500 tracking-widest mb-2 uppercase">TOTAL CALLS</p>
              <p className="text-5xl font-extrabold text-slate-800 mb-4">
                {data ? data.totalCalls : '-'}
              </p>
              <p className="text-[14px] text-slate-500 font-medium mt-auto border-t border-slate-50 pt-4">Total voice sessions started</p>
            </div>

            {/* Successful Calls */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -z-10 group-hover:bg-emerald-100/50 transition-colors duration-500"></div>
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl shadow-sm w-fit mb-6">
                <CheckCircle2 size={28} strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-bold text-slate-500 tracking-widest mb-2 uppercase">SUCCESSFUL CALLS</p>
              <p className="text-5xl font-extrabold text-slate-800 mb-4">
                {data ? data.successfulCalls : '-'}
              </p>
              <p className="text-[14px] text-slate-500 font-medium mt-auto border-t border-slate-50 pt-4">Exercise completed by learner</p>
            </div>

            {/* Failed Calls */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl -z-10 group-hover:bg-rose-100/50 transition-colors duration-500"></div>
              <div className="bg-rose-100 text-rose-500 p-4 rounded-2xl shadow-sm w-fit mb-6">
                <XCircle size={28} strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-bold text-slate-500 tracking-widest mb-2 uppercase">FAILED CALLS</p>
              <p className="text-5xl font-extrabold text-slate-800 mb-4">
                {data ? data.failedCalls : '-'}
              </p>
              <p className="text-[14px] text-slate-500 font-medium mt-auto border-t border-slate-50 pt-4">Exercise not completed before exit</p>
            </div>

            {/* Success Rate */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full blur-3xl -z-10 group-hover:bg-teal-100/50 transition-colors duration-500"></div>
              <div className="bg-teal-100 text-teal-600 p-4 rounded-2xl shadow-sm w-fit mb-6">
                <BarChart2 size={28} strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-bold text-slate-500 tracking-widest mb-2 uppercase">SUCCESS RATE</p>
              <div className="flex items-baseline gap-1 mb-4">
                <p className="text-5xl font-extrabold text-emerald-600">
                  {successRate}
                </p>
                <span className="text-2xl font-bold text-emerald-600/70">%</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 mb-4">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${successRate}%` }}
                />
              </div>

              <p className="text-[14px] text-slate-500 font-medium mt-auto border-t border-slate-50 pt-4">Completion percentage</p>
            </div>

          </div>

          {error && (
            <p className="text-[13px] text-rose-500 mt-6 font-medium bg-rose-50 border border-rose-100 p-4 rounded-xl">
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
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-5 md:p-6 flex flex-col relative z-20">
      
      {/* Header */}
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-emerald-600" size={24} strokeWidth={2.5} />
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Call Analytics</h3>
        </div>
        <p className="text-[13px] font-medium text-slate-500">Real-time overview of your voice agent calls</p>
      </div>
      
      {/* Stacked Metric Cards */}
      <div className="flex flex-col gap-3 mb-5">
        
        {/* Total Calls */}
        <div className="bg-[#f2f7fc] border border-blue-50/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-500 p-2.5 rounded-full shadow-sm">
              <Phone size={20} strokeWidth={2.5} className="fill-blue-100" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-widest mb-0.5">TOTAL CALLS</p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.totalCalls : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Successful Calls */}
        <div className="bg-[#f0faf5] border border-emerald-50/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-full shadow-sm">
              <CheckCircle2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-widest mb-0.5">SUCCESSFUL CALLS</p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.successfulCalls : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Failed Calls */}
        <div className="bg-[#fff6f6] border border-rose-50/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 text-rose-500 p-2.5 rounded-full shadow-sm">
              <XCircle size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-widest mb-0.5">FAILED CALLS</p>
              <p className="text-xl font-extrabold text-slate-800">
                {data ? data.failedCalls : '-'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Success Rate */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-slate-800">Success Rate</span>
          <span className="text-[14px] font-bold text-emerald-600">{successRate}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 pb-4 border-t border-slate-100 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="text-[12px] font-medium">Last updated: {lastUpdated}</span>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-1.5 border-2 border-emerald-500 text-emerald-600 rounded-lg text-[13px] font-bold hover:bg-emerald-50 transition-colors"
        >
          Refresh Now
        </button>
      </div>

      {/* View Dashboard Button */}
      <button 
        onClick={() => setIsFullDashboard(true)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-[14px] shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
      >
        View Dashboard <ArrowRight size={18} strokeWidth={2.5} />
      </button>

      {error && (
        <p className="text-[11px] text-rose-500 mt-3 font-medium text-center">Unable to connect to analytics backend.</p>
      )}
    </div>
  );
}
