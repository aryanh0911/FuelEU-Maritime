import {
  BankEntry,
  BankSurplusRequest,
  ApplyBankedRequest,
  BankingResult,
} from '../domain/banking';

export interface BankingRepository {
  getBankingRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankSurplus(request: BankSurplusRequest): Promise<BankEntry>;
  applyBanked(request: ApplyBankedRequest): Promise<BankingResult>;
}
