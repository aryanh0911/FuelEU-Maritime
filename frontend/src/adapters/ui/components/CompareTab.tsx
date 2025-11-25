import { useState, useEffect } from 'react';
import { RouteComparison } from '../../../core/domain/route';
import { HttpRouteRepository } from '../../outbound/http-route.repository';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const routeRepo = new HttpRouteRepository();

export default function CompareTab() {
  const [comparisons, setComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparisons();
  }, []);

  const loadComparisons = async () => {
    try {
      setLoading(true);
      const data = await routeRepo.getComparison();
      setComparisons(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>;

  const chartData = comparisons.map((comp) => ({
    name: comp.comparison.routeId,
    baseline: comp.baseline.ghgIntensity,
    comparison: comp.comparison.ghgIntensity,
    target: comp.target,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Compare Routes vs Baseline</h2>

      {comparisons.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Baseline: <span className="font-semibold">{comparisons[0].baseline.routeId}</span> (
            {comparisons[0].baseline.ghgIntensity.toFixed(4)} gCO₂e/MJ)
          </p>
          <p className="text-sm text-gray-600">
            Target Intensity: <span className="font-semibold">{comparisons[0].target.toFixed(4)} gCO₂e/MJ</span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">GHG Intensity Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'gCO₂e/MJ', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="baseline" fill="#3b82f6" name="Baseline" />
            <Bar dataKey="comparison" fill="#10b981" name="Comparison" />
            <Bar dataKey="target" fill="#ef4444" name="Target" />
          </BarChart>
        </ResponsiveContainer>
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
                GHG Intensity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                % Difference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Compliant
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisons.map((comp) => (
              <tr key={comp.comparison.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comp.comparison.routeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {comp.comparison.ghgIntensity.toFixed(4)} gCO₂e/MJ
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={comp.percentDiff > 0 ? 'text-red-600' : 'text-green-600'}>
                    {comp.percentDiff > 0 ? '+' : ''}
                    {comp.percentDiff.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {comp.compliant ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      ✓ Compliant
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      ✗ Non-Compliant
                    </span>
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
