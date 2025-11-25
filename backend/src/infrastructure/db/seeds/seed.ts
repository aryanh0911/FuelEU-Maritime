import { query } from '../connection';

export async function seedDatabase(): Promise<void> {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await query('DELETE FROM pool_members');
    await query('DELETE FROM pools');
    await query('DELETE FROM bank_entries');
    await query('DELETE FROM ship_compliance');
    await query('DELETE FROM routes');

    // Insert seed routes
    const routes = [
      {
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true,
      },
      {
        routeId: 'R002',
        vesselType: 'BulkCarrier',
        fuelType: 'LNG',
        year: 2024,
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false,
      },
      {
        routeId: 'R003',
        vesselType: 'Tanker',
        fuelType: 'MGO',
        year: 2024,
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
        distance: 12500,
        totalEmissions: 4700,
        isBaseline: false,
      },
      {
        routeId: 'R004',
        vesselType: 'RoRo',
        fuelType: 'HFO',
        year: 2025,
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
        distance: 11800,
        totalEmissions: 4300,
        isBaseline: false,
      },
      {
        routeId: 'R005',
        vesselType: 'Container',
        fuelType: 'LNG',
        year: 2025,
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
        distance: 11900,
        totalEmissions: 4400,
        isBaseline: false,
      },
    ];

    for (const route of routes) {
      await query(
        `INSERT INTO routes 
        (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          route.routeId,
          route.vesselType,
          route.fuelType,
          route.year,
          route.ghgIntensity,
          route.fuelConsumption,
          route.distance,
          route.totalEmissions,
          route.isBaseline,
        ]
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
