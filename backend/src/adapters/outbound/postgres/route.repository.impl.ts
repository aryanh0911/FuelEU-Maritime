import { Route, CreateRouteDTO } from '../../../core/domain/route';
import { RouteRepository } from '../../../core/ports/outbound/route.repository';
import { query } from '../../db/connection';

export class PostgresRouteRepository implements RouteRepository {
  async findAll(): Promise<Route[]> {
    const result = await query('SELECT * FROM routes ORDER BY year DESC, route_id');
    return result.rows.map(this.mapToRoute);
  }

  async findById(id: string): Promise<Route | null> {
    const result = await query('SELECT * FROM routes WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapToRoute(result.rows[0]) : null;
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const result = await query('SELECT * FROM routes WHERE route_id = $1', [routeId]);
    return result.rows.length > 0 ? this.mapToRoute(result.rows[0]) : null;
  }

  async findBaseline(year?: number): Promise<Route | null> {
    let sql = 'SELECT * FROM routes WHERE is_baseline = TRUE';
    const params: unknown[] = [];
    
    if (year) {
      sql += ' AND year = $1';
      params.push(year);
    }
    
    sql += ' LIMIT 1';
    
    const result = await query(sql, params);
    return result.rows.length > 0 ? this.mapToRoute(result.rows[0]) : null;
  }

  async create(dto: CreateRouteDTO): Promise<Route> {
    const result = await query(
      `INSERT INTO routes 
      (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        dto.routeId,
        dto.vesselType,
        dto.fuelType,
        dto.year,
        dto.ghgIntensity,
        dto.fuelConsumption,
        dto.distance,
        dto.totalEmissions,
      ]
    );
    return this.mapToRoute(result.rows[0]);
  }

  async update(id: string, route: Partial<Route>): Promise<Route> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(route).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${this.camelToSnake(key)} = $${paramCount++}`);
        values.push(value);
      }
    });

    values.push(id);
    
    const result = await query(
      `UPDATE routes 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );
    
    return this.mapToRoute(result.rows[0]);
  }

  async setBaseline(id: string): Promise<Route> {
    // First, unset any existing baseline
    await query('UPDATE routes SET is_baseline = FALSE WHERE is_baseline = TRUE');
    
    // Then set the new baseline
    const result = await query(
      'UPDATE routes SET is_baseline = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    
    return this.mapToRoute(result.rows[0]);
  }

  async findByFilters(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (filters.vesselType) {
      conditions.push(`vessel_type = $${paramCount++}`);
      values.push(filters.vesselType);
    }

    if (filters.fuelType) {
      conditions.push(`fuel_type = $${paramCount++}`);
      values.push(filters.fuelType);
    }

    if (filters.year) {
      conditions.push(`year = $${paramCount++}`);
      values.push(filters.year);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT * FROM routes ${whereClause} ORDER BY year DESC, route_id`,
      values
    );

    return result.rows.map(this.mapToRoute);
  }

  private mapToRoute(row: Record<string, unknown>): Route {
    return {
      id: row.id as string,
      routeId: row.route_id as string,
      vesselType: row.vessel_type as Route['vesselType'],
      fuelType: row.fuel_type as Route['fuelType'],
      year: row.year as number,
      ghgIntensity: parseFloat(row.ghg_intensity as string),
      fuelConsumption: parseFloat(row.fuel_consumption as string),
      distance: parseFloat(row.distance as string),
      totalEmissions: parseFloat(row.total_emissions as string),
      isBaseline: row.is_baseline as boolean,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
