import { ComplianceBalance, CreateComplianceBalanceDTO, ComplianceBalanceQuery, AdjustedComplianceBalance } from '../../domain/compliance';

export interface ComplianceRepository {
  findByShipAndYear(query: ComplianceBalanceQuery): Promise<ComplianceBalance | null>;
  create(dto: CreateComplianceBalanceDTO): Promise<ComplianceBalance>;
  update(id: string, cb: Partial<ComplianceBalance>): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance>;
}
