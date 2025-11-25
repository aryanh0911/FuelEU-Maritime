import { query } from '../connection';

export async function runMigrations(): Promise<void> {
  try {
    console.log('Running migrations...');

    // Create routes table
    await query(`
      CREATE TABLE IF NOT EXISTS routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id VARCHAR(50) UNIQUE NOT NULL,
        vessel_type VARCHAR(50) NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        ghg_intensity DECIMAL(10, 4) NOT NULL,
        fuel_consumption DECIMAL(10, 2) NOT NULL,
        distance DECIMAL(10, 2) NOT NULL,
        total_emissions DECIMAL(10, 2) NOT NULL,
        is_baseline BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ship_compliance table
    await query(`
      CREATE TABLE IF NOT EXISTS ship_compliance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ship_id VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        cb_gco2eq DECIMAL(15, 2) NOT NULL,
        target_intensity DECIMAL(10, 4) NOT NULL,
        actual_intensity DECIMAL(10, 4) NOT NULL,
        energy_in_scope DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ship_id, year)
      )
    `);

    // Create bank_entries table
    await query(`
      CREATE TABLE IF NOT EXISTS bank_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ship_id VARCHAR(50) NOT NULL,
        year INTEGER NOT NULL,
        amount_gco2eq DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create pools table
    await query(`
      CREATE TABLE IF NOT EXISTS pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create pool_members table
    await query(`
      CREATE TABLE IF NOT EXISTS pool_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
        ship_id VARCHAR(50) NOT NULL,
        cb_before DECIMAL(15, 2) NOT NULL,
        cb_after DECIMAL(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
