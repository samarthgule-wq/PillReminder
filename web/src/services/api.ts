const rawBaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL?.trim()) ||
  'http://localhost:4000';

export const API_BASE_URL = rawBaseUrl
  .replace(/^["']|["']$/g, '')
  .replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${cleanPath}`;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
    public isTimeout: boolean = false,
    public isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const timeoutMs = options.timeoutMs ?? 30000; // 30s default timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: options.signal || controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new ApiError(
        response.status,
        `HTTP Error ${response.status}`,
        errorBody,
        false,
        false
      );
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }

    const isAbort =
      err instanceof DOMException && err.name === 'AbortError';

    if (isAbort) {
      throw new ApiError(
        0,
        `Request timed out after ${Math.round(timeoutMs / 1000)}s (Render service may be spinning up)`,
        undefined,
        true,
        false
      );
    }

    const message =
      err instanceof Error ? err.message : 'Network error';
    throw new ApiError(
      0,
      `Network error: ${message}`,
      undefined,
      false,
      true
    );
  }
}

