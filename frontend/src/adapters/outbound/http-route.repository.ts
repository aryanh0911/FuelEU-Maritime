import { Route, RouteComparison, RouteFilters } from '../../core/domain/route';
import { RouteRepository } from '../../core/ports/outbound/route.repository';
import { apiClient } from '../infrastructure/api-client';

export class HttpRouteRepository implements RouteRepository {
  async getAll(): Promise<Route[]> {
    return apiClient.get<Route[]>('/routes');
  }

  async getByFilters(filters: RouteFilters): Promise<Route[]> {
    const params = new URLSearchParams();
    if (filters.vesselType) params.append('vesselType', filters.vesselType);
    if (filters.fuelType) params.append('fuelType', filters.fuelType);
    if (filters.year) params.append('year', filters.year.toString());

    const queryString = params.toString();
    return apiClient.get<Route[]>(`/routes${queryString ? `?${queryString}` : ''}`);
  }

  async setBaseline(routeId: string): Promise<Route> {
    return apiClient.post<Route>(`/routes/${routeId}/baseline`, {});
  }

  async getComparison(): Promise<RouteComparison[]> {
    return apiClient.get<RouteComparison[]>('/routes/comparison');
  }
}
