export interface Pool {
  id: string;
  year: number;
  createdAt?: Date;
}

export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  createdAt?: Date;
}

export interface CreatePoolDTO {
  year: number;
  members: PoolMemberInput[];
}

export interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export interface PoolResult {
  poolId: string;
  year: number;
  members: PoolMemberResult[];
  poolSum: number;
  valid: boolean;
}

export interface PoolMemberResult {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface PoolValidationResult {
  valid: boolean;
  errors: string[];
}
