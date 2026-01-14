import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';

function Risk() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const loadRiskData = async () => {
    try {
      console.log('Loading risk data...');
      
      // First, try to get risk analysis from Portfolio calculation
      const savedRiskAnalysis = localStorage.getItem('lastRiskAnalysis');
      if (savedRiskAnalysis) {
        try {
          const riskAnalysisData = JSON.parse(savedRiskAnalysis);
          console.log('Risk analysis from Portfolio:', riskAnalysisData);
          setRiskData(riskAnalysisData);
          setLastUpdated(new Date());
          return;
        } catch (error) {
          console.error('Error parsing saved risk analysis:', error);
        }
      }
      
      // Try to get risk analysis from dedicated API endpoint first
      try {
        const riskAnalysisData = await ApiService.getRiskAnalysis();
        console.log('Risk analysis from API:', riskAnalysisData);
        
        if (riskAnalysisData) {
          const apiRiskData = {
            portfolio_risk: riskAnalysisData.portfolio_risk || 0.15,
            volatility: riskAnalysisData.volatility || 0.25,
            predicted_return: riskAnalysisData.predicted_return || 0.12,
            risk_level: riskAnalysisData.risk_level || 'Medium'
          };
          setRiskData(apiRiskData);
          setLastUpdated(new Date());
          return;
        }
      } catch (apiError) {
        console.log('Risk API not available, falling back to dashboard data:', apiError.message);
      }
      
      // Fallback: Calculate from dashboard data
      const portfolioData = await ApiService.getDashboardSummary();
      console.log('Portfolio data from dashboard:', portfolioData);
      
      // Calculate risk metrics if not provided by API
      if (portfolioData && portfolioData.assets) {
        const totalInvestment = portfolioData.total_value || 1;
        const cryptoWeights = {
          'BTC': 0.4,    // High risk, high return
          'ETH': 0.3,    // Medium risk, medium return  
          'BNB': 0.1,    // Low risk, low return
          'ADA': 0.1,    // Low risk, low return
          'SOL': 0.1     // High risk, high return
        };
        
        let weightedReturn = 0;
        portfolioData.assets.forEach(asset => {
          const weight = cryptoWeights[asset.symbol] || 0.2;
          const assetReturn = (asset.change_percentage_24h || 0) / 100;
          weightedReturn += weight * assetReturn;
        });
        
        // Calculate portfolio volatility (weighted average of individual volatilities)
        let portfolioVolatility = 0;
        portfolioData.assets.forEach(asset => {
          const assetVolatility = Math.abs(asset.change_percentage_24h || 0) / 100;
          const assetWeight = (asset.value / totalInvestment);
          portfolioVolatility += assetWeight * assetVolatility;
        });
        
        // Calculate risk level based on portfolio diversity
        const uniqueSymbols = new Set(portfolioData.assets.map(asset => asset.symbol));
        const diversificationScore = uniqueSymbols.size / 5;
        
        let riskLevel = 'Medium';
        if (diversificationScore >= 0.8 && portfolioVolatility < 0.2) {
          riskLevel = 'Low';
        } else if (diversificationScore >= 0.6 && portfolioVolatility < 0.3) {
          riskLevel = 'Medium';
        } else {
          riskLevel = 'High';
        }
        
        const calculatedRiskData = {
          portfolio_risk: portfolioVolatility,
          volatility: portfolioVolatility,
          predicted_return: weightedReturn,
          risk_level: riskLevel
        };
        
        console.log('Calculated risk data:', calculatedRiskData);
        setRiskData(calculatedRiskData);
        setLastUpdated(new Date());
      } else {
        // Final fallback to localStorage if both APIs fail
        const portfolioData = JSON.parse(localStorage.getItem('currentPortfolio') || '{}');
        const fallbackData = {
          portfolio_risk: portfolioData.portfolio_risk || 0.15,
          volatility: portfolioData.volatility || 0.25,
          predicted_return: portfolioData.predicted_return || 0.12,
          risk_level: portfolioData.risk_level || 'Medium'
        };
        console.log('Using localStorage fallback data:', fallbackData);
        setRiskData(fallbackData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading risk data:', error);
      // Get portfolio data from localStorage as final fallback
      const portfolioData = JSON.parse(localStorage.getItem('currentPortfolio') || '{}');
      const fallbackData = {
        portfolio_risk: portfolioData.portfolio_risk || 0.15,
        volatility: portfolioData.volatility || 0.25,
        predicted_return: portfolioData.predicted_return || 0.12,
        risk_level: portfolioData.risk_level || 'Medium'
      };
      console.log('Error fallback data:', fallbackData);
      setRiskData(fallbackData);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated first
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadRiskData();
    // Refresh data every 30 seconds to match Dashboard
    const interval = setInterval(loadRiskData, 30000);
    
    // Listen for portfolio changes from Dashboard
    const handlePortfolioChange = (event) => {
      console.log('Portfolio change event received in Risk:', event.detail);
      if (event.detail && event.detail.portfolio) {
        const portfolio = event.detail.portfolio;
        const newRiskData = {
          portfolio_risk: portfolio.portfolio_risk || 0.15,
          volatility: portfolio.volatility || 0.25,
          predicted_return: portfolio.predicted_return || 0.12,
          risk_level: portfolio.risk_level || 'Medium'
        };
        console.log('Risk page updated from portfolio change:', newRiskData);
        setRiskData(newRiskData);
        setLastUpdated(new Date());
      }
    };
    
    // Listen for risk analysis updates from Portfolio
    const handleRiskAnalysisUpdate = (event) => {
      console.log('Risk analysis update event received:', event.detail);
      if (event.detail && event.detail.riskAnalysis) {
        const riskAnalysis = event.detail.riskAnalysis;
        console.log('Risk page updated from Portfolio calculation:', riskAnalysis);
        setRiskData(riskAnalysis);
        setLastUpdated(new Date());
      }
    };
    
    // Custom event listeners
    window.addEventListener('portfolioUpdated', handlePortfolioChange);
    window.addEventListener('riskAnalysisUpdated', handleRiskAnalysisUpdate);
    
    return () => {
      // Cleanup event listeners and interval on unmount
      window.removeEventListener('portfolioUpdated', handlePortfolioChange);
      window.removeEventListener('riskAnalysisUpdated', handleRiskAnalysisUpdate);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Risk Analysis</h1>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={loadRiskData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {riskData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Portfolio Risk</p>
                      <p className="text-2xl font-bold text-red-900">
                        {((riskData.portfolio_risk || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Volatility</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {((riskData.volatility || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Predicted Return</p>
                      <p className="text-2xl font-bold text-green-900">
                        {((riskData.predicted_return || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Assessment</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Risk Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      riskData.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                      riskData.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {riskData.risk_level}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Portfolio Risk Score</span>
                    <span className="text-gray-900 font-medium">{(riskData.portfolio_risk || 0).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Market Volatility</span>
                    <span className="text-gray-900 font-medium">{(riskData.volatility * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected Annual Return</span>
                    <span className="text-gray-900 font-medium">{(riskData.predicted_return * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Recommendations</h2>
                <div className="space-y-3">
                  {riskData.risk_level === 'High' && (
                    <>
                      <p className="text-gray-700">• Consider diversifying your portfolio to reduce risk</p>
                      <p className="text-gray-700">• Allocate more to stable assets</p>
                      <p className="text-gray-700">• Set stop-loss orders to limit potential losses</p>
                    </>
                  )}
                  {riskData.risk_level === 'Medium' && (
                    <>
                      <p className="text-gray-700">• Your portfolio has balanced risk-reward profile</p>
                      <p className="text-gray-700">• Consider periodic rebalancing</p>
                      <p className="text-gray-700">• Monitor market conditions regularly</p>
                    </>
                  )}
                  {riskData.risk_level === 'Low' && (
                    <>
                      <p className="text-gray-700">• Your portfolio is conservative with lower risk</p>
                      <p className="text-gray-700">• Consider adding growth assets for higher returns</p>
                      <p className="text-gray-700">• Maintain diversification strategy</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Risk;
