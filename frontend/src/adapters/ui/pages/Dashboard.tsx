import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import RoutesTab from '../components/RoutesTab';
import CompareTab from '../components/CompareTab';
import BankingTab from '../components/BankingTab';
import PoolingTab from '../components/PoolingTab';

const tabs = [
  { name: 'Routes', path: 'routes' },
  { name: 'Compare', path: 'compare' },
  { name: 'Banking', path: 'banking' },
  { name: 'Pooling', path: 'pooling' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">FuelEU Maritime Compliance</h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                {tab.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="routes" element={<RoutesTab />} />
          <Route path="compare" element={<CompareTab />} />
          <Route path="banking" element={<BankingTab />} />
          <Route path="pooling" element={<PoolingTab />} />
        </Routes>
      </main>
    </div>
  );
}
