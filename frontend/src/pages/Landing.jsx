import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon, ArrowUpIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { INRIcon } from '../utils/currency.jsx';

function Landing() {
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCryptoPrices = async () => {
    try {
      const prices = await ApiService.getCryptoPrices();
      setCryptoPrices(prices);
    } catch (error) {
      console.error('Error loading crypto prices:', error);
      // Use mock data as fallback
      setCryptoPrices([
        {
          symbol: "BTC",
          price: 42500.50,
          change_24h: 2.5,
          change_percentage_24h: 2.5,
          timestamp: new Date().toISOString()
        },
        {
          symbol: "ETH",
          price: 3150.25,
          change_24h: -1.2,
          change_percentage_24h: -1.2,
          timestamp: new Date().toISOString()
        },
        {
          symbol: "BNB",
          price: 320.75,
          change_24h: 0.8,
          change_percentage_24h: 0.8,
          timestamp: new Date().toISOString()
        },
        {
          symbol: "ADA",
          price: 0.52,
          change_24h: 1.5,
          change_percentage_24h: 1.5,
          timestamp: new Date().toISOString()
        },
        {
          symbol: "SOL",
          price: 98.30,
          change_24h: -0.5,
          change_percentage_24h: -0.5,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCryptoPrices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-white text-xl font-bold">
              Crypto Investment Manager
            </div>
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Smart Crypto Investment Manager
            <span className="block text-blue-300">with Real-Time Risk Control</span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Optimize your cryptocurrency portfolio with AI-powered investment mix, 
            real-time risk analysis, and automated alerts for smarter trading decisions.
          </p>
          <div className="space-x-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-block"
            >
              View Dashboard
            </Link>
            <Link
              to="/login"
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-block border border-white/30"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <ChartBarIcon className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Investment Mix Optimization
            </h3>
            <p className="text-gray-200">
              Rule-based portfolio optimization with weight sliders and strategy options
              to minimize risk and maximize returns.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <ShieldCheckIcon className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">
              Risk Analysis & Predictions
            </h3>
            <p className="text-gray-200">
              Real-time risk assessment with historical charts, risk heatmaps,
              and AI-powered prediction models.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <INRIcon />
            <h3 className="text-xl font-semibold text-white mb-3">
              Automation & Alerts
            </h3>
            <p className="text-gray-200">
              Smart alerts, automated rebalancing rules, and market scenario
              simulation for proactive portfolio management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;