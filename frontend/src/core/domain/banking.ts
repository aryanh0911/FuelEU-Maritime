export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankSurplusRequest {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface ApplyBankedRequest {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}
