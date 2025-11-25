import { ComplianceBalance, AdjustedComplianceBalance } from '../../core/domain/compliance';
import { ComplianceRepository } from '../../core/ports/outbound/compliance.repository';
import { apiClient } from '../infrastructure/api-client';

export class HttpComplianceRepository implements ComplianceRepository {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return apiClient.get<ComplianceBalance>(`/compliance/cb?shipId=${shipId}&year=${year}`);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    return apiClient.get<AdjustedComplianceBalance>(
      `/compliance/adjusted-cb?shipId=${shipId}&year=${year}`
    );
  }
}
