export interface HealthResponse {
  application: string;
  status: 'running' | 'degraded' | 'down';
  database: 'connected' | 'disconnected' | 'error';
  message: string;
}

export type ConnectionStatus = 'checking' | 'online' | 'offline';
