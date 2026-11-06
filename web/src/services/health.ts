import { apiClient } from './api';
import { HealthResponse } from '@/types/health';

export async function fetchBackendHealth(): Promise<HealthResponse> {
  return apiClient<HealthResponse>('/health');
}
