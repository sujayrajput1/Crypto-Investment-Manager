import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, PlusIcon, TrashIcon, SparklesIcon, BookmarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { formatINR, formatINRWithDecimals, INRIcon } from '../utils/currency.jsx';

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [mixCalculation, setMixCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualCoins, setManualCoins] = useState([]);
  const [savedPresets, setSavedPresets] = useState([]);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [defaultCoinPrices, setDefaultCoinPrices] = useState({
    bitcoin: 42500.50,
    ethereum: 3150.25,
    cardano: 0.52
  });
  
  const [formData, setFormData] = useState({
    symbols: ['bitcoin', 'ethereum', 'cardano'],
    weights: [40, 35, 25],
    strategy: 'balanced',
    investmentAmount: 10000
  });

  // Load saved presets from localStorage
  useEffect(() => {
    const presets = localStorage.getItem('investmentPresets');
    if (presets) {
      setSavedPresets(JSON.parse(presets));
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
    const handlePortfolioChange = () => {
      loadPortfolioData();
    };
    
    window.addEventListener('portfolioUpdated', handlePortfolioChange);
    
    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioChange);
    };
  }, []);

  const loadPortfolioData = async () => {
    try {
      const portfolioData = await ApiService.getDashboardSummary();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      setPortfolio({
        total_value: 125000,
        predicted_return: 0.08,
        risk_level: 'Medium',
        assets: [
          {
            symbol: 'BTC',
            amount: 1.5,
            current_price: 42500.50,
            value: 63750.75,
            change_percentage_24h: 2.5
          },
          {
            symbol: 'ETH',
            amount: 10,
            current_price: 3150.25,
            value: 31502.50,
            change_percentage_24h: -1.2
          },
          {
            symbol: 'BNB',
            amount: 50,
            current_price: 320.75,
            value: 16037.50,
            change_percentage_24h: 0.8
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const removeManualCoin = (index) => {
    setManualCoins(manualCoins.filter((_, i) => i !== index));
  };

  const updateDefaultCoinSymbol = (index, newSymbol) => {
    const newSymbols = [...formData.symbols];
    newSymbols[index] = newSymbol.toLowerCase();
    setFormData({...formData, symbols: newSymbols});
  };

  const updateDefaultCoinPrice = (symbol, newPrice) => {
    setDefaultCoinPrices({
      ...defaultCoinPrices,
      [symbol]: parseFloat(newPrice) || 0
    });
  };

  const addDefaultCoin = () => {
    const newSymbol = `coin${Date.now()}`;
    setFormData({
      ...formData,
      symbols: [...formData.symbols, newSymbol],
      weights: [...formData.weights, 0]
    });
    setDefaultCoinPrices({
      ...defaultCoinPrices,
      [newSymbol]: 100
    });
  };

  const removeDefaultCoin = (index) => {
    const symbolToRemove = formData.symbols[index];
    const newSymbols = formData.symbols.filter((_, i) => i !== index);
    const newWeights = formData.weights.filter((_, i) => i !== index);
    
    setFormData({...formData, symbols: newSymbols, weights: newWeights});
    
    const newPrices = {...defaultCoinPrices};
    delete newPrices[symbolToRemove];
    setDefaultCoinPrices(newPrices);
  };

  const calculateMix = async () => {
    setValidationError('');
    
    const totalWeight = formData.weights.reduce((a, b) => a + b, 0);
    
    if (totalWeight !== 100) {
      setValidationError(`Total allocation must be exactly 100%. Current: ${totalWeight}%`);
      return;
    }
    
    try {
      const calculationData = {
        symbols: formData.symbols,
        weights: formData.weights,
        strategy: formData.strategy,
        investmentAmount: formData.investmentAmount
      };
      
      const result = await ApiService.calculateInvestmentMix(calculationData);
      
      // Calculate real risk analysis
      const riskAnalysis = calculateRiskAnalysis(formData.symbols, formData.weights, formData.investmentAmount);
      
      // Enhance results with default coin calculations and risk analysis
      const enhancedResult = {
        ...result,
        investmentBreakdown: calculateInvestmentBreakdown(formData.symbols, formData.weights, formData.investmentAmount),
        totalInvestment: formData.investmentAmount,
        strategy: formData.strategy,
        riskAnalysis: riskAnalysis
      };
      
      setMixCalculation(enhancedResult);
      
      // Save to localStorage for Reports page and Risk page
      localStorage.setItem('lastInvestmentBreakdown', JSON.stringify(enhancedResult));
      localStorage.setItem('lastRiskAnalysis', JSON.stringify(riskAnalysis));
      
      // Emit risk analysis event for Risk page
      window.dispatchEvent(new CustomEvent('riskAnalysisUpdated', { 
        detail: { riskAnalysis, timestamp: Date.now() } 
      }));
      
    } catch (error) {
      console.error('Error calculating mix:', error);
      // Fallback calculation with risk analysis
      const riskAnalysis = calculateRiskAnalysis(formData.symbols, formData.weights, formData.investmentAmount);
      
      const fallbackResult = {
        expected_return: riskAnalysis.predicted_return,
        risk_score: riskAnalysis.risk_score,
        suggested_mix: Object.fromEntries(formData.symbols.map((symbol, i) => [symbol, formData.weights[i]])),
        investmentBreakdown: calculateInvestmentBreakdown(formData.symbols, formData.weights, formData.investmentAmount),
        totalInvestment: formData.investmentAmount,
        strategy: formData.strategy,
        riskAnalysis: riskAnalysis
      };
      
      setMixCalculation(fallbackResult);
      
      // Save fallback to localStorage for Reports page and Risk page
      localStorage.setItem('lastInvestmentBreakdown', JSON.stringify(fallbackResult));
      localStorage.setItem('lastRiskAnalysis', JSON.stringify(riskAnalysis));
      
      // Emit risk analysis event for Risk page
      window.dispatchEvent(new CustomEvent('riskAnalysisUpdated', { 
        detail: { riskAnalysis, timestamp: Date.now() } 
      }));
    }
  };

  const calculateInvestmentBreakdown = (symbols, weights, totalAmount) => {
    return symbols.map((symbol, index) => {
      const weight = weights[index] / 100;
      const investment = totalAmount * weight;
      const price = defaultCoinPrices[symbol] || 100;
      const quantity = investment / price;
      
      return {
        symbol: symbol.toUpperCase(),
        weight: weights[index],
        investment: investment,
        price: price,
        quantity: quantity,
        isDefault: true
      };
    });
  };

  const calculateRiskAnalysis = (symbols, weights, investmentAmount) => {
    // Calculate portfolio volatility based on asset weights and historical volatility
    const cryptoVolatility = {
      'bitcoin': 0.85,    // High volatility
      'ethereum': 0.75,   // Medium-high volatility
      'binancecoin': 0.65, // Medium volatility
      'cardano': 0.55,    // Medium-low volatility
      'solana': 0.80      // High volatility
    };

    const cryptoReturns = {
      'bitcoin': 0.20,     // High expected return
      'ethereum': 0.25,    // High expected return
      'binancecoin': 0.15,  // Medium expected return
      'cardano': 0.18,    // Medium expected return
      'solana': 0.30      // Very high expected return
    };

    // Calculate weighted average volatility
    let portfolioVolatility = 0;
    let weightedReturn = 0;
    
    symbols.forEach((symbol, index) => {
      const weight = weights[index] / 100;
      const volatility = cryptoVolatility[symbol] || 0.7; // Default to medium volatility
      const expectedReturn = cryptoReturns[symbol] || 0.2; // Default to medium return
      
      portfolioVolatility += weight * volatility;
      weightedReturn += weight * expectedReturn;
    });

    // Calculate diversification score
    const uniqueSymbols = new Set(symbols);
    const diversificationScore = uniqueSymbols.size / 5; // Assuming max 5 different assets

    // Adjust risk based on diversification
    const diversificationBonus = diversificationScore > 0.6 ? 0.1 : 0;
    const adjustedVolatility = Math.max(0.1, portfolioVolatility - diversificationBonus);

    // Determine risk level
    let riskLevel = 'Medium';
    if (adjustedVolatility < 0.3 && diversificationScore >= 0.8) {
      riskLevel = 'Low';
    } else if (adjustedVolatility > 0.6 || diversificationScore < 0.4) {
      riskLevel = 'High';
    }

    // Calculate portfolio risk score (0-10 scale, where 0 is lowest risk)
    const portfolioRiskScore = Math.min(10, adjustedVolatility * 10);

    // Strategy-based adjustments
    let strategyAdjustment = 0;
    if (formData.strategy === 'conservative') {
      strategyAdjustment = -0.2; // Reduce risk for conservative
      riskLevel = riskLevel === 'High' ? 'Medium' : riskLevel === 'Medium' ? 'Low' : 'Low';
    } else if (formData.strategy === 'aggressive') {
      strategyAdjustment = 0.2; // Increase risk for aggressive
      riskLevel = riskLevel === 'Low' ? 'Medium' : riskLevel === 'Medium' ? 'High' : 'High';
    }

    return {
      portfolio_risk: Math.max(0.05, adjustedVolatility + strategyAdjustment),
      volatility: adjustedVolatility,
      predicted_return: weightedReturn + strategyAdjustment,
      risk_level: riskLevel,
      risk_score: portfolioRiskScore,
      diversification_score: diversificationScore,
      strategy: formData.strategy,
      investment_amount: investmentAmount
    };
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      setValidationError('Please enter a preset name');
      return;
    }
    
    const preset = {
      id: Date.now(),
      name: presetName,
      symbols: formData.symbols,
      weights: formData.weights,
      strategy: formData.strategy,
      investmentAmount: formData.investmentAmount,
      defaultCoinPrices: defaultCoinPrices,
      createdAt: new Date().toISOString()
    };
    
    const updatedPresets = [...savedPresets, preset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('investmentPresets', JSON.stringify(updatedPresets));
    setPresetName('');
    setShowPresetDialog(false);
  };

  const loadPreset = (preset) => {
    setFormData({
      symbols: preset.symbols,
      weights: preset.weights,
      strategy: preset.strategy,
      investmentAmount: preset.investmentAmount
    });
    setDefaultCoinPrices(preset.defaultCoinPrices || {
      bitcoin: 42500.50,
      ethereum: 3150.25,
      cardano: 0.52
    });
    setMixCalculation(null);
  };

  const deletePreset = (presetId) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('investmentPresets', JSON.stringify(updatedPresets));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        {portfolio && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Investment Portfolio</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <INRIcon />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Value</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatINR(portfolio.total_value)}
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
                      {(portfolio.predicted_return * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Risk Level</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {portfolio.risk_level}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Holdings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolio.assets.map((asset, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {asset.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatINR(asset.current_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatINR(asset.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Investment Mix Calculator */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Investment Mix Calculator</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPresetDialog(true)}
                className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                <BookmarkIcon className="h-4 w-4 mr-1" />
                Save Preset
              </button>
            </div>
          </div>

          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Strategy Configuration */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Configure Your Strategy
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strategy Type
                      </label>
                      <select
                        value={formData.strategy}
                        onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="balanced">Balanced</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="conservative">Conservative</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount (USD)
                      </label>
                      <input
                        type="number"
                        value={formData.investmentAmount}
                        onChange={(e) => setFormData({...formData, investmentAmount: parseFloat(e.target.value) || 0})}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10000"
                        min="0"
                        step="100"
                      />
                      <p className="mt-1 text-xs text-gray-500">≈ {formatINR(formData.investmentAmount || 0)} INR</p>
                    </div>
                  </div>
                </div>

                {/* Default Assets */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-800 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Default Assets
                    </h4>
                    <button
                      onClick={addDefaultCoin}
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                    >
                      <PlusIcon className="h-3 w-3 mr-1" />
                      Add Coin
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.symbols.map((symbol, index) => (
                      <div key={symbol} className="bg-blue-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                          <input
                            type="text"
                            value={symbol}
                            onChange={(e) => updateDefaultCoinSymbol(index, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium"
                            placeholder="Symbol"
                          />
                          <input
                            type="number"
                            value={defaultCoinPrices[symbol] || ''}
                            onChange={(e) => updateDefaultCoinPrice(symbol, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            placeholder="Price ($)"
                            min="0.01"
                            step="0.01"
                          />
                          <input
                            type="number"
                            value={formData.weights[index]}
                            onChange={(e) => {
                              const newWeights = [...formData.weights];
                              newWeights[index] = parseInt(e.target.value) || 0;
                              setFormData({...formData, weights: newWeights});
                            }}
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm text-gray-600">%</span>
                          <button
                            onClick={() => removeDefaultCoin(index)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Allocation: {formData.weights[index]}%</span>
                            <span>Price: ${defaultCoinPrices[symbol] || 'N/A'}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${formData.weights[index]}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Allocation */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Total Allocation</span>
                    <span className={`text-lg font-bold ${
                      formData.weights.reduce((a, b) => a + b, 0) === 100 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.weights.reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        formData.weights.reduce((a, b) => a + b, 0) === 100 
                          ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(formData.weights.reduce((a, b) => a + b, 0), 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
                Results
              </h3>

              {mixCalculation ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-600">Expected Annual Return</p>
                    <p className="text-2xl font-bold text-green-900">
                      {(mixCalculation.expected_return * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Expected profit: {formatINR(formData.investmentAmount * mixCalculation.expected_return)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Total value after return: {formatINR(formData.investmentAmount + (formData.investmentAmount * mixCalculation.expected_return))}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-600">Risk Score</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {mixCalculation.risk_score.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {mixCalculation.risk_score < 3 ? 'Low Risk' : 
                       mixCalculation.risk_score < 7 ? 'Medium Risk' : 'High Risk'}
                    </p>
                  </div>

                  {/* Real Risk Analysis Section */}
                  {mixCalculation.riskAnalysis && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-600">Real Risk Analysis</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-red-700">Portfolio Risk</p>
                          <p className="text-lg font-bold text-red-900">
                            {(mixCalculation.riskAnalysis.portfolio_risk * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-red-700">Market Volatility</p>
                          <p className="text-lg font-bold text-red-900">
                            {(mixCalculation.riskAnalysis.volatility * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-red-700">Risk Level</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            mixCalculation.riskAnalysis.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                            mixCalculation.riskAnalysis.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {mixCalculation.riskAnalysis.risk_level}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-red-700">Diversification</p>
                          <p className="text-lg font-bold text-red-900">
                            {(mixCalculation.riskAnalysis.diversification_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-red-700">
                        Strategy: {mixCalculation.riskAnalysis.strategy} | 
                        Investment: {formatINR(mixCalculation.riskAnalysis.investment_amount)}
                      </div>
                    </div>
                  )}

                  {/* Investment Breakdown */}
                  {mixCalculation.investmentBreakdown && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-3">Investment Breakdown</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {mixCalculation.investmentBreakdown.map((item, index) => (
                          <div key={index} className={`p-2 rounded text-sm bg-blue-100 border border-blue-200`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{item.symbol}</span>
                              <span className="text-gray-600">{item.weight}%</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{formatINR(item.investment)}</span>
                              <span>{item.quantity.toFixed(4)} units @ ${item.price}</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="px-1 py-0.5 rounded bg-blue-200 text-blue-800">
                                Default
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Configure your strategy and click calculate to see results</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={calculateMix}
              disabled={formData.weights.reduce((a, b) => a + b, 0) !== 100}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Calculate Investment Mix
            </button>
          </div>
        </div>

        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Saved Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPresets.map((preset) => (
                <div key={preset.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{preset.name}</h4>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {preset.symbols.length} assets • {preset.strategy} • {formatINR(preset.investmentAmount)}
                  </p>
                  <button
                    onClick={() => loadPreset(preset)}
                    className="w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Load Preset
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Preset Dialog */}
        {showPresetDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Save Investment Preset</h3>
              <input
                type="text"
                placeholder="Preset Name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowPresetDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={savePreset}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
