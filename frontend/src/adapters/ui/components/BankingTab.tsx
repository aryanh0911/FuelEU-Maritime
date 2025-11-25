import { useState } from 'react';
import { HttpComplianceRepository } from '../../outbound/http-compliance.repository';
import { HttpBankingRepository } from '../../outbound/http-banking.repository';

const complianceRepo = new HttpComplianceRepository();
const bankingRepo = new HttpBankingRepository();

export default function BankingTab() {
  const [shipId, setShipId] = useState('R001');
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCB = async () => {
    try {
      const data = await complianceRepo.getComplianceBalance(shipId, year);
      setCb(data.cbGco2eq);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBank = async () => {
    try {
      await bankingRepo.bankSurplus({
        shipId,
        year,
        amountGco2eq: parseFloat(amount),
      });
      setResult('Successfully banked surplus');
      setAmount('');
      await loadCB();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleApply = async () => {
    try {
      const data = await bankingRepo.applyBanked({
        shipId,
        year,
        amountGco2eq: parseFloat(amount),
      });
      setResult(`Applied ${data.applied} gCO₂eq. CB: ${data.cbBefore} → ${data.cbAfter}`);
      setAmount('');
      await loadCB();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Banking</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ship ID</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>
        </div>

        <button
          onClick={loadCB}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Load Compliance Balance
        </button>

        {cb !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-lg font-semibold">
              Current CB: <span className={cb >= 0 ? 'text-green-600' : 'text-red-600'}>{cb.toFixed(2)} gCO₂eq</span>
            </p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Banking Actions</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (gCO₂eq)</label>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleBank}
            disabled={!amount || cb === null || cb <= 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Bank Surplus
          </button>

          <button
            onClick={handleApply}
            disabled={!amount}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Apply Banked
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded">{result}</div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded">Error: {error}</div>
        )}
      </div>
    </div>
  );
}
