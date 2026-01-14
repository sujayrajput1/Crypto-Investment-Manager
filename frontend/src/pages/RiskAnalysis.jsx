import React from 'react';
import { Link } from 'react-router-dom';

function RiskAnalysis() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-xl font-bold text-gray-900">
              Crypto Investment Manager
            </div>
            <div className="flex space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link to="/portfolio" className="text-gray-600 hover:text-gray-900">Portfolio</Link>
              <Link to="/risk" className="text-blue-600 font-medium">Risk Analysis</Link>
              <Link to="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
              <Link to="/rules" className="text-gray-600 hover:text-gray-900">Rules</Link>
              <Link to="/alerts" className="text-gray-600 hover:text-gray-900">Alerts</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Risk Analysis</h1>
          <p className="text-gray-600">Portfolio risk analysis and predictions coming soon.</p>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalysis;