import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon, BellIcon, PlusIcon, TrashIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';
import { formatINR, INRIcon } from '../utils/currency.jsx';

function Dashboard() {
  // Currency formatter for INR
  const [portfolio, setPortfolio] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    symbol: 'BTC',
    amount: '',
    price_per_unit: ''
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    // Check if user is authenticated first
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Load current user data first
    loadCurrentUserData();
    loadDashboardData();
    loadAlerts();
    
    // Refresh crypto prices every 30 seconds
    const interval = setInterval(loadCryptoPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAlertsChange = (event) => {
      if (event.detail && event.detail.alerts) {
        console.log('Dashboard received alerts update:', event.detail.alerts);
        setAlerts(event.detail.alerts);
      }
    };
    
    window.addEventListener('alertsUpdated', handleAlertsChange);
    
    return () => {
      window.removeEventListener('alertsUpdated', handleAlertsChange);
    };
  }, []);

  const loadCurrentUserData = async () => {
    try {
      console.log('Loading current user data...');
      
      // Get current user from AuthService
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setCurrentUser(currentUser);
        console.log('Current user loaded:', currentUser);
        
        // Load portfolio from database first
        try {
          const freshUserData = await AuthService.getUserData();
          if (freshUserData && freshUserData.portfolio) {
            console.log('Loading portfolio from database:', freshUserData.portfolio);
            setPortfolio(freshUserData.portfolio);
            
            // Also save to localStorage as backup
            const userPortfolioKey = `portfolio_${currentUser.email}`;
            localStorage.setItem(userPortfolioKey, JSON.stringify(freshUserData.portfolio));
            localStorage.setItem('currentPortfolio', JSON.stringify(freshUserData.portfolio));
            
            // Emit portfolio update event for other pages
            window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
              detail: { portfolio: freshUserData.portfolio, timestamp: Date.now() } 
            }));
          } else {
            // Fallback to localStorage if no database data
            const userPortfolioKey = `portfolio_${currentUser.email}`;
            const userPortfolioData = localStorage.getItem(userPortfolioKey);
            
            if (userPortfolioData) {
              const userPortfolio = JSON.parse(userPortfolioData);
              console.log('Loading user-specific portfolio from localStorage:', userPortfolio);
              setPortfolio(userPortfolio);
              localStorage.setItem('currentPortfolio', JSON.stringify(userPortfolio));
              
              // Emit portfolio update event for other pages
              window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
                detail: { portfolio: userPortfolio, timestamp: Date.now() } 
              }));
              
              // Sync to database
              try {
                await ApiService.updatePortfolio(userPortfolio);
                console.log('Portfolio synced to database');
              } catch (syncError) {
                console.log('Could not sync portfolio to database:', syncError);
              }
            } else {
              console.log('No portfolio found, creating default portfolio');
              // Create a default portfolio for new users
              const defaultPortfolio = {
                total_value: 0,
                predicted_return: 0.0,
                risk_level: 'Low',
                assets: []
              };
              setPortfolio(defaultPortfolio);
              localStorage.setItem('currentPortfolio', JSON.stringify(defaultPortfolio));
              localStorage.setItem(userPortfolioKey, JSON.stringify(defaultPortfolio));
              
              // Save to database
              try {
                await ApiService.updatePortfolio(defaultPortfolio);
                console.log('Default portfolio saved to database');
              } catch (dbError) {
                console.log('Could not save default portfolio to database:', dbError);
              }
            }
          }
        } catch (dbError) {
          console.log('Database not available, using localStorage only');
          // Fallback to localStorage-only mode
          const userPortfolioKey = `portfolio_${currentUser.email}`;
          const userPortfolioData = localStorage.getItem(userPortfolioKey);
          
          if (userPortfolioData) {
            const userPortfolio = JSON.parse(userPortfolioData);
            setPortfolio(userPortfolio);
            localStorage.setItem('currentPortfolio', JSON.stringify(userPortfolio));
          } else {
            const defaultPortfolio = {
              total_value: 0,
              predicted_return: 0.0,
              risk_level: 'Low',
              assets: []
            };
            setPortfolio(defaultPortfolio);
            localStorage.setItem('currentPortfolio', JSON.stringify(defaultPortfolio));
            localStorage.setItem(userPortfolioKey, JSON.stringify(defaultPortfolio));
          }
        }
      } else {
        console.log('No current user found, redirecting to login');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      // Fallback to anonymous user
      setCurrentUser(null);
      // Load generic data if user data fails
      loadDashboardData();
    } finally {
      // Always set loading to false
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Only load generic data if no user-specific portfolio is set
      if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
        console.log('No user portfolio found, loading generic dashboard data');
        const [portfolioData, pricesData] = await Promise.all([
          ApiService.getDashboardSummary(),
          ApiService.getCryptoPrices()
        ]);
        setPortfolio(portfolioData);
        const top5Prices = pricesData.slice(0, 5); // show only 5 examples
        setCryptoPrices(top5Prices);
      } else {
        console.log('User portfolio already loaded, skipping generic data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Only use mock data as fallback if no user data exists
      if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
        console.log('Using mock data as fallback');
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
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCryptoPrices = async () => {
    try {
      const prices = await ApiService.getCryptoPrices();
      const top5Prices = prices.slice(0, 5); // show only 5 examples
      setCryptoPrices(top5Prices);
    } catch (error) {
      console.error('Error loading crypto prices:', error);
      // Use mock data as fallback - show only 5 examples
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

  const loadAlerts = async () => {
    try {
      // Get current user to load user-specific alerts
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        // Load user-specific alerts
        const userAlertsKey = `alerts_${currentUser.email}`;
        const userAlertsData = localStorage.getItem(userAlertsKey);
        
        if (userAlertsData) {
          const userAlerts = JSON.parse(userAlertsData);
          console.log('Dashboard loading user-specific alerts:', userAlerts);
          setAlerts(userAlerts);
        } else {
          console.log('No user alerts found, creating empty alerts array');
          setAlerts([]);
          localStorage.setItem(userAlertsKey, JSON.stringify([]));
        }
      } else {
        console.log('No current user, using empty alerts');
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  const addInvestment = async () => {
    try {
      console.log('Adding investment:', newInvestment);
      
      // Get current price if not provided
      const currentCrypto = cryptoPrices.find(c => c.symbol === newInvestment.symbol);
      const price = newInvestment.price_per_unit || currentCrypto?.price || 0;
      const amount = parseFloat(newInvestment.amount);
      
      if (amount > 0 && price > 0) {
        // Create new asset object
        const newAsset = {
          symbol: newInvestment.symbol,
          amount: amount,
          current_price: price,
          value: amount * price,
          change_percentage_24h: currentCrypto?.change_percentage_24h || 0
        };

        // Update local state
        if (portfolio && portfolio.assets) {
          const existingAsset = portfolio.assets.find(a => a.symbol === newInvestment.symbol);
          if (existingAsset) {
            // Update existing asset
            existingAsset.amount += amount;
            existingAsset.value = existingAsset.amount * existingAsset.current_price;
          } else {
            // Add new asset
            portfolio.assets.push(newAsset);
          }
          
          // Recalculate total value
          portfolio.total_value = portfolio.assets.reduce((sum, asset) => sum + asset.value, 0);
          
          // Calculate dynamic predicted return based on portfolio composition
          const totalInvestment = portfolio.total_value;
          const cryptoWeights = {
            'BTC': 0.4,    // Bitcoin - high risk, high return
            'ETH': 0.3,    // Ethereum - medium risk, medium return  
            'BNB': 0.1,    // Binance Coin - low risk, low return
            'ADA': 0.1,    // Cardano - low risk, low return
            'SOL': 0.1     // Solana - high risk, high return
          };
          
          let weightedReturn = 0;
          portfolio.assets.forEach(asset => {
            const weight = crypto_weights[asset.symbol] || 0.2;
            const assetReturn = (asset.change_percentage_24h || 0) / 100;
            weightedReturn += weight * assetReturn;
          });
          
          // Update predicted return (weighted average of individual returns)
          portfolio.predicted_return = weightedReturn;
          
          // Calculate risk level based on portfolio diversity
          const uniqueSymbols = new Set(portfolio.assets.map(asset => asset.symbol));
          const diversificationScore = uniqueSymbols.size / 5; // 5 is max possible symbols
          
          if (diversificationScore >= 0.8) {
            portfolio.risk_level = 'Low';
          } else if (diversificationScore >= 0.6) {
            portfolio.risk_level = 'Medium';
          } else {
            portfolio.risk_level = 'High';
          }

          // Save to database
          try {
            console.log('Saving to database:', newAsset);
            const response = await ApiService.addPortfolioAsset(newAsset);
            console.log('Database response:', response);
            alert('Investment added successfully!');
          } catch (dbError) {
            console.error('Error saving to database:', dbError);
            console.error('Error details:', dbError.response?.data);
            console.error('Full error object:', dbError);
            alert('Investment added locally but failed to save to database');
          }
        }

        // Reset form
        setNewInvestment({ symbol: 'BTC', amount: '', price_per_unit: '' });
        setShowAddInvestment(false);
        
        alert('Investment added successfully!');
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Error adding investment');
    }
  };

  const removeAsset = async (symbol) => {
    try {
      if (portfolio && portfolio.assets) {
        const assetIndex = portfolio.assets.findIndex(a => a.symbol === symbol);
        if (assetIndex !== -1) {
          const removedAsset = portfolio.assets[assetIndex];
          portfolio.assets.splice(assetIndex, 1);
          
          // Recalculate total value
          portfolio.total_value = portfolio.assets.reduce((sum, asset) => sum + asset.value, 0);
          
          // Save to user-specific localStorage first
          if (currentUser) {
            const userPortfolioKey = `portfolio_${currentUser.email}`;
            localStorage.setItem(userPortfolioKey, JSON.stringify(portfolio));
            localStorage.setItem('currentPortfolio', JSON.stringify(portfolio));
            console.log('Portfolio saved to localStorage after removal');
          }
          
          // Try to save to database
          try {
            await ApiService.removePortfolioAsset(symbol);
            console.log('Investment removed from database');
          } catch (dbError) {
            console.error('Error removing from database:', dbError);
            console.error('Error details:', dbError.response?.data);
            console.error('Full error object:', dbError);
            
            // Try alternative method - update entire portfolio
            try {
              await ApiService.updatePortfolio(portfolio);
              console.log('Portfolio updated in database as fallback');
            } catch (fallbackError) {
              console.error('Fallback also failed:', fallbackError);
              alert('Investment removed locally but failed to update database. Data saved locally.');
            }
          }
          
          // Emit portfolio update event for other pages
          window.dispatchEvent(new CustomEvent('portfolioUpdated', { 
            detail: { portfolio, timestamp: Date.now() } 
          }));
          
          alert(`Successfully removed ${symbol} investment`);
        } else {
          alert(`${symbol} not found in portfolio`);
        }
      }
    } catch (error) {
      console.error('Error removing asset:', error);
      alert('Error removing asset');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        {portfolio && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
                {currentUser && (
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>Welcome, {currentUser.username || currentUser.email}</span>
                    {currentUser.portfolio && (
                      <span className="ml-3 text-blue-600">
                        ({currentUser.portfolio.assets?.length || 0} assets)
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAddInvestment(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Investment
                </button>
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
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
                  <ShieldCheckIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Risk Level</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {portfolio.risk_level}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <BellIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-purple-900">{alerts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Investment Modal */}
        {showAddInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Investment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cryptocurrency
                  </label>
                  <select
                    value={newInvestment.symbol}
                    onChange={(e) => setNewInvestment({...newInvestment, symbol: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="ADA">Cardano (ADA)</option>
                    <option value="SOL">Solana (SOL)</option>
                    <option value="BNB">Binance Coin (BNB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={newInvestment.amount}
                    onChange={(e) => setNewInvestment({...newInvestment, amount: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 0.5"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit (optional)
                  </label>
                  <input
                    type="number"
                    value={newInvestment.price_per_unit}
                    onChange={(e) => setNewInvestment({...newInvestment, price_per_unit: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 45000 USD (~₹37,35,000 INR)"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddInvestment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addInvestment}
                  disabled={!newInvestment.amount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Investment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Holdings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Holdings</h2>
          {portfolio && portfolio.assets && portfolio.assets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      24h Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.assets.map((asset) => (
                    <tr key={asset.symbol}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {asset.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatINR(asset.current_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatINR(asset.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          (asset.change_percentage_24h || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(asset.change_percentage_24h || 0) >= 0 ? '+' : ''}
                          {(asset.change_percentage_24h || 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => removeAsset(asset.symbol)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No holdings yet</p>
              <p className="text-gray-400 mt-2">Add your first investment to get started</p>
              <button
                onClick={() => setShowAddInvestment(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Investment
              </button>
            </div>
          )}
        </div>

        {/* Live Crypto Prices */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Crypto Prices</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {cryptoPrices.map((crypto) => (
              <div key={crypto.symbol} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 uppercase">
                      {crypto.symbol}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatINR(crypto.price || 0)}
                    </p>
                  </div>
                  <div className={`text-sm font-medium ${
                    (crypto.change_percentage_24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(crypto.change_percentage_24h || 0) >= 0 ? '+' : ''}
                    {(crypto.change_percentage_24h || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
