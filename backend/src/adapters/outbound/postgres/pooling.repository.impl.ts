import { Pool, PoolMember } from '../../../core/domain/pooling';
import { PoolingRepository } from '../../../core/ports/outbound/pooling.repository';
import { query } from '../../../infrastructure/db/connection';

export class PostgresPoolingRepository implements PoolingRepository {
  async createPool(year: number): Promise<Pool> {
    const result = await query('INSERT INTO pools (year) VALUES ($1) RETURNING *', [year]);
    return this.mapToPool(result.rows[0]);
  }

  async addMembers(
    poolId: string,
    members: Omit<PoolMember, 'id' | 'poolId'>[]
  ): Promise<PoolMember[]> {
    const results: PoolMember[] = [];

    for (const member of members) {
      const result = await query(
        'INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after) VALUES ($1, $2, $3, $4) RETURNING *',
        [poolId, member.shipId, member.cbBefore, member.cbAfter]
      );
      results.push(this.mapToPoolMember(result.rows[0]));
    }

    return results;
  }

  async findPoolById(poolId: string): Promise<Pool | null> {
    const result = await query('SELECT * FROM pools WHERE id = $1', [poolId]);
    return result.rows.length > 0 ? this.mapToPool(result.rows[0]) : null;
  }

  async findMembersByPoolId(poolId: string): Promise<PoolMember[]> {
    const result = await query('SELECT * FROM pool_members WHERE pool_id = $1', [poolId]);
    return result.rows.map(this.mapToPoolMember);
  }

  private mapToPool(row: Record<string, unknown>): Pool {
    return {
      id: row.id as string,
      year: row.year as number,
      createdAt: row.created_at as Date,
    };
  }

  private mapToPoolMember(row: Record<string, unknown>): PoolMember {
    return {
      id: row.id as string,
      poolId: row.pool_id as string,
      shipId: row.ship_id as string,
      cbBefore: parseFloat(row.cb_before as string),
      cbAfter: parseFloat(row.cb_after as string),
      createdAt: row.created_at as Date,
    };
  }
}
