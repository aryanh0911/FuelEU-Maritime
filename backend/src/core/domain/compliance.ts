export interface ComplianceBalance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number; // Compliance Balance in gCO2eq
  targetIntensity: number;
  actualIntensity: number;
  energyInScope: number; // MJ
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdjustedComplianceBalance {
  shipId: string;
  year: number;
  cbBefore: number;
  bankedAmount: number;
  cbAfter: number;
}

export interface CreateComplianceBalanceDTO {
  shipId: string;
  year: number;
  cbGco2eq: number;
  targetIntensity: number;
  actualIntensity: number;
  energyInScope: number;
}

export interface ComplianceBalanceQuery {
  shipId: string;
  year: number;
}
