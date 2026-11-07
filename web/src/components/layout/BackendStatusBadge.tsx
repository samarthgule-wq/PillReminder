'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchBackendHealth } from '@/services/health';
import { HealthResponse, ConnectionStatus } from '@/types/health';
import { CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';

export function BackendStatusBadge({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchBackendHealth();
      setHealthData(data);
      if (data.status === 'running' && data.database === 'connected') {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch {
      setStatus('offline');
      setHealthData(null);
    } finally {
      setIsRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      try {
        const data = await fetchBackendHealth();
        if (!isMounted) return;
        setHealthData(data);
        if (data.status === 'running' && data.database === 'connected') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch {
        if (!isMounted) return;
        setStatus('offline');
        setHealthData(null);
      } finally {
        if (isMounted) {
          setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    };

    execute();
    const interval = setInterval(execute, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative inline-block text-xs">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetails(!showDetails)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowDetails(!showDetails);
          }
        }}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all border font-semibold ${
          status === 'online'
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/70'
            : status === 'offline'
            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
        }`}
        title="Click to view API & Database Health"
      >
        <span className="relative flex h-2 w-2">
          {status === 'online' ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </>
          ) : status === 'offline' ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          ) : (
            <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          )}
        </span>

        <span className="font-semibold">
          {status === 'online'
            ? 'Backend Online'
            : status === 'offline'
            ? 'Backend Offline'
            : 'Checking API...'}
        </span>

        {!compact && (
          <span className="text-[10px] text-slate-500 ml-0.5 border-l border-slate-300 pl-1">
            API
          </span>
        )}
      </div>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              API &amp; DB Diagnostics
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                checkStatus();
              }}
              disabled={isRefreshing}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
              title="Refresh connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mt-2.5 space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Target Endpoint:</span>
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700">
                {`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/health`}
              </code>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Application:</span>
              <span className="font-semibold text-slate-900">
                {healthData?.application || (status === 'offline' ? 'Unreachable' : 'Detecting...')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Server Status:</span>
              <span className="flex items-center gap-1 font-semibold">
                {status === 'online' ? (
                  <span className="text-green-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Running
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Down
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">PostgreSQL Database:</span>
              <span className="font-semibold">
                {healthData?.database === 'connected' ? (
                  <span className="text-green-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> Disconnected
                  </span>
                )}
              </span>
            </div>

            {healthData?.message && (
              <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 italic">
                &ldquo;{healthData.message}&rdquo;
              </div>
            )}

            <div className="pt-1 text-[10px] text-slate-400 text-right">
              Checked at {lastChecked || 'just now'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


