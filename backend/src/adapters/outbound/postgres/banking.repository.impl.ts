import { BankEntry, BankSurplusDTO, BankingQuery } from '../../../core/domain/banking';
import { BankingRepository } from '../../../core/ports/outbound/banking.repository';
import { query } from '../../../infrastructure/db/connection';

export class PostgresBankingRepository implements BankingRepository {
  async findByShipAndYear(queryParams: BankingQuery): Promise<BankEntry[]> {
    const result = await query(
      'SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY created_at',
      [queryParams.shipId, queryParams.year]
    );
    return result.rows.map(this.mapToBankEntry);
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const result = await query(
      'SELECT COALESCE(SUM(amount_gco2eq), 0) as total FROM bank_entries WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    return parseFloat(result.rows[0].total);
  }

  async create(dto: BankSurplusDTO): Promise<BankEntry> {
    const result = await query(
      'INSERT INTO bank_entries (ship_id, year, amount_gco2eq) VALUES ($1, $2, $3) RETURNING *',
      [dto.shipId, dto.year, dto.amountGco2eq]
    );
    return this.mapToBankEntry(result.rows[0]);
  }

  async updateAmount(id: string, amountGco2eq: number): Promise<BankEntry> {
    const result = await query(
      'UPDATE bank_entries SET amount_gco2eq = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [amountGco2eq, id]
    );
    return this.mapToBankEntry(result.rows[0]);
  }

  private mapToBankEntry(row: Record<string, unknown>): BankEntry {
    return {
      id: row.id as string,
      shipId: row.ship_id as string,
      year: row.year as number,
      amountGco2eq: parseFloat(row.amount_gco2eq as string),
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }
}
