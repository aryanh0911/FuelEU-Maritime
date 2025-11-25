import { Route, RouteComparison } from '../domain/route';
import { RouteRepository } from '../ports/outbound/route.repository';

const TARGET_INTENSITY_2025 = parseFloat(process.env.TARGET_INTENSITY_2025 || '89.3368');

export class GetAllRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(): Promise<Route[]> {
    return this.routeRepository.findAll();
  }
}

export class SetBaselineUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(routeId: string): Promise<Route> {
    const route = await this.routeRepository.findById(routeId);
    if (!route) {
      throw new Error('Route not found');
    }
    return this.routeRepository.setBaseline(routeId);
  }
}

export class GetRouteComparisonUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(): Promise<RouteComparison[]> {
    const baseline = await this.routeRepository.findBaseline();
    if (!baseline) {
      throw new Error('No baseline route set');
    }

    const allRoutes = await this.routeRepository.findAll();
    const comparisons: RouteComparison[] = [];

    for (const route of allRoutes) {
      if (route.id === baseline.id) continue;

      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = route.ghgIntensity <= TARGET_INTENSITY_2025;

      comparisons.push({
        baseline,
        comparison: route,
        percentDiff,
        compliant,
        target: TARGET_INTENSITY_2025,
      });
    }

    return comparisons;
  }
}

export class GetRoutesByFiltersUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    return this.routeRepository.findByFilters(filters);
  }
}
