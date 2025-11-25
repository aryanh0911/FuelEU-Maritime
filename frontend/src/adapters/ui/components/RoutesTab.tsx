import { useState, useEffect } from 'react';
import { Route, RouteFilters } from '../../../core/domain/route';
import { HttpRouteRepository } from '../../outbound/http-route.repository';

const routeRepo = new HttpRouteRepository();

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({});

  useEffect(() => {
    loadRoutes();
  }, [filters]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeRepo.getByFilters(filters);
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeRepo.setBaseline(routeId);
      await loadRoutes();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Routes</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="border rounded px-3 py-2"
          value={filters.vesselType || ''}
          onChange={(e) => setFilters({ ...filters, vesselType: e.target.value || undefined })}
        >
          <option value="">All Vessel Types</option>
          <option value="Container">Container</option>
          <option value="BulkCarrier">Bulk Carrier</option>
          <option value="Tanker">Tanker</option>
          <option value="RoRo">RoRo</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filters.fuelType || ''}
          onChange={(e) => setFilters({ ...filters, fuelType: e.target.value || undefined })}
        >
          <option value="">All Fuel Types</option>
          <option value="HFO">HFO</option>
          <option value="LNG">LNG</option>
          <option value="MGO">MGO</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filters.year || ''}
          onChange={(e) =>
            setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })
          }
        >
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Route ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vessel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fuel Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                GHG Intensity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Fuel Consumption
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Emissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Baseline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {route.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.vesselType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.fuelType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.ghgIntensity.toFixed(4)} gCO₂e/MJ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.fuelConsumption.toFixed(2)} t
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.distance.toFixed(2)} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {route.totalEmissions.toFixed(2)} t
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {route.isBaseline && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      ✓ Baseline
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {!route.isBaseline && (
                    <button
                      onClick={() => handleSetBaseline(route.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Set Baseline
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
