export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BankSurplusDTO {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface ApplyBankedDTO {
  shipId: string;
  year: number;
  amountGco2eq: number;
}

export interface BankingQuery {
  shipId: string;
  year: number;
}

export interface BankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}
