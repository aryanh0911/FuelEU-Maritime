export interface Pool {
  poolId: string;
  year: number;
  members: PoolMember[];
  poolSum: number;
  valid: boolean;
}

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface CreatePoolRequest {
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
  }>;
}
