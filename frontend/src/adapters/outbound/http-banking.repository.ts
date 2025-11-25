import {
  BankEntry,
  BankSurplusRequest,
  ApplyBankedRequest,
  BankingResult,
} from '../../core/domain/banking';
import { BankingRepository } from '../../core/ports/outbound/banking.repository';
import { apiClient } from '../infrastructure/api-client';

export class HttpBankingRepository implements BankingRepository {
  async getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return apiClient.get<BankEntry[]>(`/banking/records?shipId=${shipId}&year=${year}`);
  }

  async bankSurplus(request: BankSurplusRequest): Promise<BankEntry> {
    return apiClient.post<BankEntry>('/banking/bank', request);
  }

  async applyBanked(request: ApplyBankedRequest): Promise<BankingResult> {
    return apiClient.post<BankingResult>('/banking/apply', request);
  }
}
