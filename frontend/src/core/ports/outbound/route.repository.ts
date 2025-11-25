import { Route, RouteComparison, RouteFilters } from '../domain/route';

export interface RouteRepository {
  getAll(): Promise<Route[]>;
  getByFilters(filters: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<RouteComparison[]>;
}
