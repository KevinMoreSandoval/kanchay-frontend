import { apiRequest } from './http-client';
import { getCurrentSession } from './session-service';

export interface AdminSummary {
  totalReservas: number;
  ingresosEstimados: number;
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const session = getCurrentSession();
  if (!session) throw new Error('Inicia sesión para consultar el resumen.');
  return apiRequest<AdminSummary>('/admin/dashboard', { token: session.token });
}
