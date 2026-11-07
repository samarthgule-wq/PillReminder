'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchBackendHealth } from '@/services/health';
import { buildApiUrl, ApiError } from '@/services/api';
import { HealthResponse, ConnectionStatus } from '@/types/health';
import { CheckCircle2, AlertCircle, RefreshCw, Database, Clock, WifiOff, AlertTriangle } from 'lucide-react';

export function BackendStatusBadge({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const targetUrl = buildApiUrl('/health');

  const isMountedRef = useRef(true);

  const performHealthCheck = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const data = await fetchBackendHealth({
        onWaking: () => {
          if (isMountedRef.current) {
            setStatus('waking');
          }
        },
      });

      if (!isMountedRef.current) return;

      setHealthData(data);
      if (data.status === 'running' && data.database === 'connected') {
        setStatus('online');
      } else if (data.database !== 'connected' || data.status === 'degraded') {
        setStatus('db_disconnected');
      } else {
        setStatus('unreachable');
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;

      setHealthData(null);
      if (err instanceof ApiError) {
        if (err.isTimeout) {
          setStatus('waking');
          setErrorMessage('Request timed out. Render server may still be spinning up.');
        } else if (err.isNetworkError) {
          setStatus('unreachable');
          setErrorMessage('Network connection failure or CORS restriction.');
        } else {
          setStatus('unreachable');
          setErrorMessage(`HTTP Error ${err.status}`);
        }
      } else {
        setStatus('unreachable');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown network failure');
      }
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
        setLastChecked(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Run initial health check in microtask to avoid synchronous setState in effect body
    queueMicrotask(() => {
      if (isMountedRef.current) {
        performHealthCheck();
      }
    });

    // Dynamically adjust polling frequency:
    // Faster (10s) when waking or connecting to detect spin-up promptly; standard (30s) when online/unreachable
    const pollInterval = status === 'waking' || status === 'connecting' ? 10000 : 30000;
    const interval = setInterval(() => {
      performHealthCheck();
    }, pollInterval);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [performHealthCheck, status]);

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
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all border font-semibold select-none ${
          status === 'online'
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/70'
            : status === 'waking'
            ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100/70 animate-pulse'
            : status === 'db_disconnected'
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/70'
            : status === 'unreachable'
            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70'
            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70'
        }`}
        title="Click to view API & Database Health Diagnostics"
      >
        <span className="relative flex h-2 w-2">
          {status === 'online' ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </>
          ) : status === 'waking' ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          ) : status === 'db_disconnected' ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          ) : status === 'unreachable' ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          ) : (
            <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          )}
        </span>

        <span className="font-semibold">
          {status === 'online'
            ? 'Backend Online'
            : status === 'waking'
            ? 'Waking Up...'
            : status === 'db_disconnected'
            ? 'Database Disconnected'
            : status === 'unreachable'
            ? 'Backend Unreachable'
            : 'Connecting...'}
        </span>

        {!compact && (
          <span className="text-[10px] text-slate-500 ml-0.5 border-l border-slate-300 pl-1">
            API
          </span>
        )}
      </div>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white p-4 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 text-slate-700">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              API &amp; Database Diagnostics
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                performHealthCheck(true);
              }}
              disabled={isRefreshing}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Target Endpoint:</span>
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-700 truncate max-w-[170px]" title={targetUrl}>
                {targetUrl}
              </code>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Application:</span>
              <span className="font-semibold text-slate-900">
                {healthData?.application ||
                  (status === 'waking'
                    ? 'Spinning up (Render)...'
                    : status === 'unreachable'
                    ? 'Unreachable'
                    : 'Detecting...')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Server Status:</span>
              <span className="flex items-center gap-1 font-semibold">
                {status === 'online' ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Running (HTTP 200)
                  </span>
                ) : status === 'waking' ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> Waking (~30-50s)
                  </span>
                ) : status === 'db_disconnected' ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Running (Database Down)
                  </span>
                ) : status === 'connecting' ? (
                  <span className="text-blue-600 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connecting...
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Down / Unreachable
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">PostgreSQL Database:</span>
              <span className="font-semibold">
                {status === 'online' ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected (Neon)
                  </span>
                ) : status === 'db_disconnected' ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                  </span>
                ) : status === 'waking' ? (
                  <span className="text-amber-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Awaiting server wake-up
                  </span>
                ) : status === 'connecting' ? (
                  <span className="text-blue-600 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <WifiOff className="w-3.5 h-3.5" /> Unknown (Backend unreachable)
                  </span>
                )}
              </span>
            </div>

            {/* Contextual Guidance Callouts */}
            {status === 'waking' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] leading-relaxed">
                <strong>Render Free Tier Notice:</strong> Web services spin down after 15 minutes of inactivity. Initial boot takes 30–50 seconds. The page will auto-connect once ready.
              </div>
            )}

            {status === 'db_disconnected' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] leading-relaxed">
                <strong>Database Notice:</strong> The backend is running, but cannot connect to PostgreSQL. Check your Neon database status and connection pooling URLs.
              </div>
            )}

            {status === 'unreachable' && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[10.5px] leading-relaxed">
                <strong>Troubleshooting Tip:</strong> If the service was sleeping or deploying, click the refresh button above. Ensure your Render backend is running and CORS allows this domain.
                {errorMessage && (
                  <div className="mt-1 font-mono text-[9.5px] text-red-600 bg-red-100/50 p-1 rounded">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}

            {healthData?.message && status === 'online' && (
              <div className="pt-2 border-t border-slate-100 text-[10.5px] text-slate-500 italic">
                &ldquo;{healthData.message}&rdquo;
              </div>
            )}

            <div className="pt-1.5 text-[10px] text-slate-400 text-right">
              Checked at {lastChecked || 'just now'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
