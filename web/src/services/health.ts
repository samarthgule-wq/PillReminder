import { apiClient, ApiError } from './api';
import { HealthResponse } from '@/types/health';

export interface HealthCheckOptions {
  onWaking?: () => void;
  timeoutMs?: number;
}

export async function fetchBackendHealth(
  options: HealthCheckOptions = {}
): Promise<HealthResponse> {
  const timeoutMs = options.timeoutMs ?? 45000; // Allow 45s for Render free tier cold-start

  // If the request hasn't completed in 4.5s, notify caller that server is likely cold-starting
  let wakingTimer: NodeJS.Timeout | null = null;
  if (options.onWaking) {
    wakingTimer = setTimeout(() => {
      options.onWaking?.();
    }, 4500);
  }

  try {
    const data = await apiClient<HealthResponse>('/health', {
      timeoutMs,
    });
    if (wakingTimer) clearTimeout(wakingTimer);
    return data;
  } catch (error) {
    if (wakingTimer) clearTimeout(wakingTimer);

    // If backend responded with 503 Service Unavailable (e.g. database disconnected),
    // extract and return the server's diagnostic health payload
    if (
      error instanceof ApiError &&
      error.status === 503 &&
      error.data &&
      typeof error.data === 'object'
    ) {
      const data = error.data as Partial<HealthResponse>;
      if (data.application && (data.database || data.status)) {
        return data as HealthResponse;
      }
    }

    // If it timed out or was a network failure, retry once with a 30s window
    // in case Render just completed its spin-up sequence
    if (error instanceof ApiError && (error.isTimeout || error.isNetworkError)) {
      options.onWaking?.();
      try {
        await new Promise((r) => setTimeout(r, 2000));
        return await apiClient<HealthResponse>('/health', {
          timeoutMs: 30000,
        });
      } catch (retryError) {
        throw retryError;
      }
    }

    throw error;
  }
}

