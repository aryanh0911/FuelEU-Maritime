import { Pool, PoolMember } from '../../domain/pooling';

export interface PoolingRepository {
  createPool(year: number): Promise<Pool>;
  addMembers(poolId: string, members: Omit<PoolMember, 'id' | 'poolId'>[]): Promise<PoolMember[]>;
  findPoolById(poolId: string): Promise<Pool | null>;
  findMembersByPoolId(poolId: string): Promise<PoolMember[]>;
}
