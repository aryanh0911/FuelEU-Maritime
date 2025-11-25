export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO' | 'Methanol' | 'Ammonia';

export interface Route {
  id: string;
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteComparison {
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
  target: number;
}

export interface RouteFilters {
  vesselType?: VesselType;
  fuelType?: FuelType;
  year?: number;
}
