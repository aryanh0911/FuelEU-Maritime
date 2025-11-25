import { ComplianceBalance, ComplianceBalanceQuery } from '../domain/compliance';
import { ComplianceRepository } from '../ports/outbound/compliance.repository';
import { RouteRepository } from '../ports/outbound/route.repository';

const ENERGY_CONVERSION_FACTOR = 41000; // MJ/tonne
const TARGET_INTENSITY_2025 = 89.3368;

export class ComputeComplianceBalanceUseCase {
  constructor(
    private complianceRepository: ComplianceRepository,
    private routeRepository: RouteRepository
  ) {}

  async execute(query: ComplianceBalanceQuery): Promise<ComplianceBalance> {
    // Check if CB already exists
    const existing = await this.complianceRepository.findByShipAndYear(query);
    if (existing) {
      return existing;
    }

    // Compute CB from route data (simplified - assuming shipId matches routeId)
    const route = await this.routeRepository.findByRouteId(query.shipId);
    if (!route) {
      throw new Error(`Route not found for ship ${query.shipId}`);
    }

    // Energy in scope = fuel consumption × 41,000 MJ/t
    const energyInScope = route.fuelConsumption * ENERGY_CONVERSION_FACTOR;

    // CB = (Target - Actual) × Energy in scope
    const cbGco2eq = (TARGET_INTENSITY_2025 - route.ghgIntensity) * energyInScope;

    const cb = await this.complianceRepository.create({
      shipId: query.shipId,
      year: query.year,
      cbGco2eq,
      targetIntensity: TARGET_INTENSITY_2025,
      actualIntensity: route.ghgIntensity,
      energyInScope,
    });

    return cb;
  }
}

export class GetAdjustedCBUseCase {
  constructor(private complianceRepository: ComplianceRepository) {}

  async execute(shipId: string, year: number) {
    return this.complianceRepository.getAdjustedCB(shipId, year);
  }
}
