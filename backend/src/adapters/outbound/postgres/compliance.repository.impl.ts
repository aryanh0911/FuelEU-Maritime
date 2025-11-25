import {
  ComplianceBalance,
  CreateComplianceBalanceDTO,
  ComplianceBalanceQuery,
  AdjustedComplianceBalance,
} from '../../../core/domain/compliance';
import { ComplianceRepository } from '../../../core/ports/outbound/compliance.repository';
import { query } from '../../db/connection';

export class PostgresComplianceRepository implements ComplianceRepository {
  async findByShipAndYear(queryParams: ComplianceBalanceQuery): Promise<ComplianceBalance | null> {
    const result = await query(
      'SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2',
      [queryParams.shipId, queryParams.year]
    );
    return result.rows.length > 0 ? this.mapToComplianceBalance(result.rows[0]) : null;
  }

  async create(dto: CreateComplianceBalanceDTO): Promise<ComplianceBalance> {
    const result = await query(
      `INSERT INTO ship_compliance 
      (ship_id, year, cb_gco2eq, target_intensity, actual_intensity, energy_in_scope)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        dto.shipId,
        dto.year,
        dto.cbGco2eq,
        dto.targetIntensity,
        dto.actualIntensity,
        dto.energyInScope,
      ]
    );
    return this.mapToComplianceBalance(result.rows[0]);
  }

  async update(id: string, cb: Partial<ComplianceBalance>): Promise<ComplianceBalance> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(cb).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${this.camelToSnake(key)} = $${paramCount++}`);
        values.push(value);
      }
    });

    values.push(id);

    const result = await query(
      `UPDATE ship_compliance 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return this.mapToComplianceBalance(result.rows[0]);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    // Get current CB
    const cbResult = await query(
      'SELECT cb_gco2eq FROM ship_compliance WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );

    const cbBefore = cbResult.rows.length > 0 ? parseFloat(cbResult.rows[0].cb_gco2eq) : 0;

    // Get total banked amount
    const bankResult = await query(
      'SELECT COALESCE(SUM(amount_gco2eq), 0) as total FROM bank_entries WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );

    const bankedAmount = parseFloat(bankResult.rows[0].total);
    const cbAfter = cbBefore + bankedAmount;

    return {
      shipId,
      year,
      cbBefore,
      bankedAmount,
      cbAfter,
    };
  }

  private mapToComplianceBalance(row: Record<string, unknown>): ComplianceBalance {
    return {
      id: row.id as string,
      shipId: row.ship_id as string,
      year: row.year as number,
      cbGco2eq: parseFloat(row.cb_gco2eq as string),
      targetIntensity: parseFloat(row.target_intensity as string),
      actualIntensity: parseFloat(row.actual_intensity as string),
      energyInScope: parseFloat(row.energy_in_scope as string),
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
