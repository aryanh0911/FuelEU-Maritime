export interface ComplianceBalance {
  id: string;
  shipId: string;
  year: number;
  cbGco2eq: number;
  targetIntensity: number;
  actualIntensity: number;
  energyInScope: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdjustedComplianceBalance {
  shipId: string;
  year: number;
  cbBefore: number;
  bankedAmount: number;
  cbAfter: number;
}
