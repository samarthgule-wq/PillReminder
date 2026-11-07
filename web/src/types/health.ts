export interface HealthResponse {
  application: string;
  status: 'running' | 'degraded' | 'down' | string;
  database: 'connected' | 'disconnected' | 'error' | string;
  timestamp?: string;
  message: string;
}

export type ConnectionStatus =
  | 'connecting'
  | 'online'
  | 'db_disconnected'
  | 'unreachable'
  | 'waking';


