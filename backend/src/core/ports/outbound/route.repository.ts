import { Route, CreateRouteDTO } from '../../domain/route';

export interface RouteRepository {
  findAll(): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  findBaseline(year?: number): Promise<Route | null>;
  create(dto: CreateRouteDTO): Promise<Route>;
  update(id: string, route: Partial<Route>): Promise<Route>;
  setBaseline(id: string): Promise<Route>;
  findByFilters(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
}
