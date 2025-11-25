import { BankEntry, BankSurplusDTO, ApplyBankedDTO, BankingResult } from '../domain/banking';
import { BankingRepository } from '../ports/outbound/banking.repository';
import { ComplianceRepository } from '../ports/outbound/compliance.repository';

export class BankSurplusUseCase {
  constructor(
    private bankingRepository: BankingRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async execute(dto: BankSurplusDTO): Promise<BankEntry> {
    // Verify CB is positive
    const cb = await this.complianceRepository.findByShipAndYear({
      shipId: dto.shipId,
      year: dto.year,
    });

    if (!cb) {
      throw new Error('Compliance balance not found');
    }

    if (cb.cbGco2eq <= 0) {
      throw new Error('Cannot bank negative or zero compliance balance');
    }

    if (dto.amountGco2eq > cb.cbGco2eq) {
      throw new Error('Cannot bank more than available compliance balance');
    }

    return this.bankingRepository.create(dto);
  }
}

export class ApplyBankedSurplusUseCase {
  constructor(
    private bankingRepository: BankingRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async execute(dto: ApplyBankedDTO): Promise<BankingResult> {
    // Get current CB
    const cb = await this.complianceRepository.findByShipAndYear({
      shipId: dto.shipId,
      year: dto.year,
    });

    if (!cb) {
      throw new Error('Compliance balance not found');
    }

    // Get total banked amount
    const totalBanked = await this.bankingRepository.getTotalBanked(dto.shipId, dto.year);

    if (dto.amountGco2eq > totalBanked) {
      throw new Error('Insufficient banked surplus');
    }

    const cbBefore = cb.cbGco2eq;
    const cbAfter = cbBefore + dto.amountGco2eq;

    // Update CB
    await this.complianceRepository.update(cb.id, {
      cbGco2eq: cbAfter,
    });

    // Record banking application (reduce banked amount)
    const entries = await this.bankingRepository.findByShipAndYear({
      shipId: dto.shipId,
      year: dto.year,
    });

    let remaining = dto.amountGco2eq;
    for (const entry of entries) {
      if (remaining <= 0) break;
      const deduction = Math.min(entry.amountGco2eq, remaining);
      await this.bankingRepository.updateAmount(entry.id, entry.amountGco2eq - deduction);
      remaining -= deduction;
    }

    return {
      cbBefore,
      applied: dto.amountGco2eq,
      cbAfter,
    };
  }
}

export class GetBankingRecordsUseCase {
  constructor(private bankingRepository: BankingRepository) {}

  async execute(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankingRepository.findByShipAndYear({ shipId, year });
  }
}
