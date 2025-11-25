import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/compliance';

export interface ComplianceRepository {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance>;
}
