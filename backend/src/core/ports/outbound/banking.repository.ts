import { BankEntry, BankSurplusDTO, BankingQuery } from '../../domain/banking';

export interface BankingRepository {
  findByShipAndYear(query: BankingQuery): Promise<BankEntry[]>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  create(dto: BankSurplusDTO): Promise<BankEntry>;
  updateAmount(id: string, amountGco2eq: number): Promise<BankEntry>;
}
