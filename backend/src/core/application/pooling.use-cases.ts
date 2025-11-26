import { CreatePoolDTO, PoolResult, PoolMemberResult, PoolValidationResult } from '../domain/pooling';
import { PoolingRepository } from '../ports/outbound/pooling.repository';

export class CreatePoolUseCase {
  constructor(private poolingRepository: PoolingRepository) {}

  async execute(dto: CreatePoolDTO): Promise<PoolResult> {
    // Validate pool
    const validation = this.validatePool(dto);
    if (!validation.valid) {
      throw new Error(`Pool validation failed: ${validation.errors.join(', ')}`);
    }

    // Allocate surplus using greedy algorithm
    const allocatedMembers = this.allocateSurplus(dto.members);

    // Create pool
    const pool = await this.poolingRepository.createPool(dto.year);

    // Add members
    await this.poolingRepository.addMembers(
      pool.id,
      allocatedMembers.map((m) => ({
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbAfter,
      }))
    );

    const poolSum = allocatedMembers.reduce((sum, m) => sum + m.cbAfter, 0);

    return {
      poolId: pool.id,
      year: dto.year,
      members: allocatedMembers,
      poolSum,
      valid: true,
    };
  }

  private validatePool(dto: CreatePoolDTO): PoolValidationResult {
    const errors: string[] = [];

    // Rule 1: Sum of CB must be >= 0
    const totalCB = dto.members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCB < 0) {
      errors.push('Sum of compliance balances must be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private allocateSurplus(
    members: Array<{ shipId: string; cbBefore: number }>
  ): PoolMemberResult[] {
    // Sort members by CB descending (surplus ships first)
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);

    const results: PoolMemberResult[] = sorted.map((m) => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbBefore,
    }));

    // Greedy allocation: transfer surplus to deficits
    for (let i = 0; i < results.length; i++) {
      if (results[i].cbAfter <= 0) continue; // No surplus to give

      for (let j = results.length - 1; j > i; j--) {
        if (results[j].cbAfter >= 0) continue; // Not a deficit

        // Transfer surplus
        const transfer = Math.min(results[i].cbAfter, -results[j].cbAfter);
        results[i].cbAfter -= transfer;
        results[j].cbAfter += transfer;

        if (results[i].cbAfter <= 0) break;
      }
    }

    // Validate constraints
    for (const result of results) {
      // Deficit ship cannot exit worse
      if (result.cbBefore < 0 && result.cbAfter < result.cbBefore) {
        throw new Error(`Deficit ship ${result.shipId} cannot exit worse`);
      }

      // Surplus ship cannot exit negative
      if (result.cbBefore > 0 && result.cbAfter < 0) {
        throw new Error(`Surplus ship ${result.shipId} cannot exit negative`);
      }
    }

    return results;
  }
}
