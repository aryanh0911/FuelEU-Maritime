import { useState } from 'react';
import { HttpPoolingRepository } from '../../outbound/http-pooling.repository';
import { PoolMember } from '../../../core/domain/pooling';

const poolingRepo = new HttpPoolingRepository();

export default function PoolingTab() {
  const [year, setYear] = useState(2025);
  const [members, setMembers] = useState<Array<{ shipId: string; cbBefore: number }>>([
    { shipId: 'R001', cbBefore: 1000 },
    { shipId: 'R002', cbBefore: -500 },
  ]);
  const [result, setResult] = useState<PoolMember[] | null>(null);
  const [poolSum, setPoolSum] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addMember = () => {
    setMembers([...members, { shipId: '', cbBefore: 0 }]);
  };

  const updateMember = (index: number, field: 'shipId' | 'cbBefore', value: string | number) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const calculatePoolSum = () => {
    return members.reduce((sum, m) => sum + m.cbBefore, 0);
  };

  const handleCreatePool = async () => {
    try {
      const poolData = await poolingRepo.createPool({ year, members });
      setResult(poolData.members);
      setPoolSum(poolData.poolSum);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  };

  const currentSum = calculatePoolSum();
  const isValid = currentSum >= 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pooling</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Pool Members</h3>

        {members.map((member, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 mb-3">
            <input
              type="text"
              placeholder="Ship ID (e.g., R001)"
              className="border rounded px-3 py-2"
              value={member.shipId}
              onChange={(e) => updateMember(index, 'shipId', e.target.value)}
            />
            <input
              type="number"
              placeholder="CB Before"
              className="border rounded px-3 py-2"
              value={member.cbBefore}
              onChange={(e) => updateMember(index, 'cbBefore', parseFloat(e.target.value))}
            />
            <button
              onClick={() => removeMember(index)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addMember}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
        >
          + Add Member
        </button>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-lg font-semibold">
            Pool Sum: <span className={isValid ? 'text-green-600' : 'text-red-600'}>{currentSum.toFixed(2)} gCO₂eq</span>
          </p>
          {!isValid && (
            <p className="text-sm text-red-600 mt-2">
              ⚠ Pool sum must be non-negative to create pool
            </p>
          )}
        </div>

        <button
          onClick={handleCreatePool}
          disabled={!isValid}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Create Pool
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded">Error: {error}</div>
        )}
      </div>

      {result && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pool Results</h3>

          <div className="mb-4 p-4 bg-green-50 rounded">
            <p className="text-lg font-semibold text-green-800">
              ✓ Pool created successfully! Sum: {poolSum?.toFixed(2)} gCO₂eq
            </p>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ship ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CB Before
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  CB After
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.map((member, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.shipId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.cbBefore.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.cbAfter.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={
                        member.cbAfter - member.cbBefore > 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {member.cbAfter - member.cbBefore > 0 ? '+' : ''}
                      {(member.cbAfter - member.cbBefore).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
