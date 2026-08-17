import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';
import { formatINR, formatINRPlain } from '../utils/currency.jsx';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [suggestedAlerts, setSuggestedAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: 'BTC',
    condition: 'above',
    threshold: '',
    type: 'price',
    message: ''
  });

  useEffect(() => {
    // Check if user is authenticated first
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadAlerts();
    loadPortfolioData();
    generateSuggestedAlerts();
    
    // Listen for portfolio updates
    const handlePortfolioChange = (event) => {
      if (event.detail && event.detail.portfolio) {
        setPortfolio(event.detail.portfolio);
        generateSuggestedAlerts(event.detail.portfolio);
        // Auto-generate alerts when portfolio changes
        checkAndAutoGenerateAlerts(event.detail.portfolio);
      }
    };
    
    window.addEventListener('portfolioUpdated', handlePortfolioChange);
    
    // Check for auto-alerts every 30 seconds
    const alertInterval = setInterval(() => {
      if (portfolio) {
        checkAndAutoGenerateAlerts(portfolio);
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioChange);
      clearInterval(alertInterval);
    };
  }, [portfolio]);

  const loadPortfolioData = async () => {
    try {
      const portfolioData = await ApiService.getDashboardSummary();
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      // Fallback to localStorage
      const savedPortfolio = localStorage.getItem('currentPortfolio');
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }
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
          console.log('Loading user-specific alerts:', userAlerts);
          setAlerts(userAlerts);
        } else {
          console.log('No user alerts found, creating empty alerts array');
          setAlerts([]);
          localStorage.setItem(userAlertsKey, JSON.stringify([]));
        }
      } else {
        console.log('No current user, using default alerts');
        const defaultAlerts = [
          {
            symbol: 'BTC',
            condition: 'above',
            threshold: 45000,
            triggered: false,
            message: 'Bitcoin price alert when above $45,000 (≈₹37,35,000)',
            type: 'price'
          },
          {
            symbol: 'ETH',
            condition: 'below',
            threshold: 3000,
            triggered: true,
            message: 'Ethereum dropped below $3,000 (≈₹2,49,000) - consider buying opportunity',
            type: 'price'
          },
          {
            symbol: 'Portfolio',
            condition: 'above',
            threshold: 150000,
            triggered: false,
            message: 'Portfolio value alert when above $150,000 (≈₹1,24,50,000)',
            type: 'portfolio'
          }
        ];
        setAlerts(defaultAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Use mock data as fallback
      setAlerts([
        {
          id: 1,
          symbol: 'BTC',
          condition: 'above',
          threshold: 45000,
          triggered: false,
          message: 'Bitcoin price alert when above $45,000',
          type: 'price'
        },
        {
          id: 2,
          symbol: 'ETH',
          condition: 'below',
          threshold: 3000,
          triggered: true,
          message: 'Ethereum dropped below $3,000 - consider buying opportunity',
          type: 'price'
        },
        {
          id: 3,
          symbol: 'Portfolio',
          condition: 'above',
          threshold: 150000,
          triggered: false,
          message: 'Portfolio value alert when above $150,000',
          type: 'portfolio'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestedAlerts = (portfolioData = null) => {
    const currentPortfolio = portfolioData || portfolio;
    if (!currentPortfolio || !currentPortfolio.assets) {
      setSuggestedAlerts([]);
      return;
    }

    const totalValue = currentPortfolio.total_value || 0;
    const suggestions = [];

    // High investment amount alerts
    if (totalValue > 100000) {
      suggestions.push({
        title: 'High Value Portfolio Alert',
        description: 'Set alerts for significant portfolio changes',
        alerts: [
          { symbol: 'Portfolio', condition: 'below', threshold: totalValue * 0.9, type: 'portfolio', message: 'Portfolio dropped below 90% of peak value' },
          { symbol: 'Portfolio', condition: 'above', threshold: totalValue * 1.1, type: 'portfolio', message: 'Portfolio increased by 10% - consider taking profits' }
        ]
      });
    }

    if (totalValue > 50000) {
      suggestions.push({
        title: 'Medium Value Portfolio Alert',
        description: 'Monitor portfolio performance',
        alerts: [
          { symbol: 'Portfolio', condition: 'below', threshold: totalValue * 0.85, type: 'portfolio', message: 'Portfolio dropped below 85% - review investments' },
          { symbol: 'Portfolio', condition: 'above', threshold: totalValue * 1.15, type: 'portfolio', message: 'Portfolio increased by 15% - rebalancing recommended' }
        ]
      });
    }

    // Asset-specific alerts based on holdings
    currentPortfolio.assets.forEach(asset => {
      const currentValue = asset.current_price || 0;
      const value = asset.value || 0;
      const amount = asset.amount || 0;

      // Large holdings alerts
      if (value > 25000) {
        suggestions.push({
          title: `${asset.symbol} Large Holding Alert`,
          description: `Monitor your ${asset.symbol} position`,
          alerts: [
            { symbol: asset.symbol, condition: 'below', threshold: currentValue * 0.9, type: 'price', message: `${asset.symbol} dropped 10% - consider buying more` },
            { symbol: asset.symbol, condition: 'above', threshold: currentValue * 1.15, type: 'price', message: `${asset.symbol} up 15% - consider taking profits` }
          ]
        });
      }

      // Price volatility alerts
      if (Math.abs(asset.change_percentage_24h || 0) > 5) {
        suggestions.push({
          title: `${asset.symbol} Volatility Alert`,
          description: `High volatility detected for ${asset.symbol}`,
          alerts: [
            { symbol: asset.symbol, condition: 'below', threshold: currentValue * 0.95, type: 'price', message: `${asset.symbol} dropped 5% - watch for further decline` },
            { symbol: asset.symbol, condition: 'above', threshold: currentValue * 1.05, type: 'price', message: `${asset.symbol} up 5% - potential breakout` }
          ]
        });
      }
    });

    // Risk-based alerts
    if (currentPortfolio.risk_level === 'High') {
      suggestions.push({
        title: 'High Risk Portfolio Alert',
        description: 'Monitor your high-risk investments closely',
        alerts: [
          { symbol: 'Portfolio', condition: 'below', threshold: totalValue * 0.8, type: 'portfolio', message: 'High risk portfolio dropped 20% - consider reducing exposure' },
          { symbol: 'Portfolio', condition: 'above', threshold: totalValue * 1.05, type: 'portfolio', message: 'High risk portfolio up 5% - review risk management' }
        ]
      });
    }

    setSuggestedAlerts(suggestions);
  };

  const addAlert = async () => {
    try {
      const alertData = {
        symbol: newAlert.symbol,
        condition: newAlert.condition,
        threshold: parseFloat(newAlert.threshold),
        type: newAlert.type,
        message: newAlert.message || `${newAlert.symbol} ${newAlert.condition.replace('_', ' ')} ${newAlert.threshold}`
      };

      // Add alert to user-specific storage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userAlertsKey = `alerts_${currentUser.email}`;
        const updatedAlerts = [...alerts, { ...alertData, id: Date.now(), triggered: false }];
        setAlerts(updatedAlerts);
        localStorage.setItem(userAlertsKey, JSON.stringify(updatedAlerts));
        console.log('Saved alert to user-specific storage:', currentUser.email);
        
        // Emit alerts update event for Dashboard
        window.dispatchEvent(new CustomEvent('alertsUpdated', { 
          detail: { alerts: updatedAlerts, timestamp: Date.now() } 
        }));
      } else {
        const updatedAlerts = [...alerts, { ...alertData, id: Date.now(), triggered: false }];
        setAlerts(updatedAlerts);
        
        // Emit alerts update event for Dashboard
        window.dispatchEvent(new CustomEvent('alertsUpdated', { 
          detail: { alerts: updatedAlerts, timestamp: Date.now() } 
        }));
      }
      
      setShowAddAlert(false);
      setNewAlert({
        symbol: 'BTC',
        condition: 'above',
        threshold: '',
        type: 'price',
        message: ''
      });
    } catch (error) {
      console.error('Error creating alert:', error);
      // Fallback for demo
      const alertData = {
        ...newAlert,
        id: Date.now(),
        triggered: false
      };
      
      // Add alert to user-specific storage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userAlertsKey = `alerts_${currentUser.email}`;
        const updatedAlerts = [...alerts, alertData];
        setAlerts(updatedAlerts);
        localStorage.setItem(userAlertsKey, JSON.stringify(updatedAlerts));
      } else {
        setAlerts([...alerts, alertData]);
      }
      
      setShowAddAlert(false);
      setNewAlert({
        symbol: 'BTC',
        condition: 'above',
        threshold: '',
        type: 'price',
        message: ''
      });
    }
  };

  const removeAlert = async (alertId) => {
    try {
      await ApiService.removeAlert(alertId);
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      
      // Save to user-specific storage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userAlertsKey = `alerts_${currentUser.email}`;
        setAlerts(updatedAlerts);
        localStorage.setItem(userAlertsKey, JSON.stringify(updatedAlerts));
        console.log('Removed alert from user-specific storage:', currentUser.email);
        
        // Emit alerts update event for Dashboard
        window.dispatchEvent(new CustomEvent('alertsUpdated', { 
          detail: { alerts: updatedAlerts, timestamp: Date.now() } 
        }));
      } else {
        setAlerts(updatedAlerts);
        
        // Emit alerts update event for Dashboard
        window.dispatchEvent(new CustomEvent('alertsUpdated', { 
          detail: { alerts: updatedAlerts, timestamp: Date.now() } 
        }));
      }
    } catch (error) {
      console.error('Error removing alert:', error);
      // Fallback for demo
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      
      // Save to user-specific storage
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userAlertsKey = `alerts_${currentUser.email}`;
        setAlerts(updatedAlerts);
        localStorage.setItem(userAlertsKey, JSON.stringify(updatedAlerts));
      } else {
        setAlerts(updatedAlerts);
      }
      
      // Emit alerts update event for Dashboard (even in fallback)
      window.dispatchEvent(new CustomEvent('alertsUpdated', { 
        detail: { alerts: updatedAlerts, timestamp: Date.now() } 
      }));
    }
  };

  const applySuggestedAlert = (suggestedAlert, alertTemplate) => {
    setNewAlert({
      symbol: alertTemplate.symbol,
      condition: alertTemplate.condition,
      threshold: alertTemplate.threshold,
      type: alertTemplate.type,
      message: alertTemplate.message
    });
    setShowAddAlert(true);
  };

  const checkAndAutoGenerateAlerts = (portfolioData) => {
    if (!portfolioData || !portfolioData.assets) return;

    const totalValue = portfolioData.total_value || 0;
    const autoAlerts = [];

    // Check portfolio value criteria
    if (totalValue > 100000) {
      const portfolioDropThreshold = totalValue * 0.9;
      const portfolioGainThreshold = totalValue * 1.1;
      
      // Auto-generate portfolio alerts if not already present
      if (!alerts.some(alert => alert.type === 'portfolio' && alert.condition === 'below' && alert.threshold === portfolioDropThreshold)) {
        autoAlerts.push({
          id: Date.now() + Math.random(),
          symbol: 'Portfolio',
          condition: 'below',
          threshold: portfolioDropThreshold,
          type: 'portfolio',
          message: `Portfolio dropped below 90% of peak value (${formatINRPlain(portfolioDropThreshold)})`,
          triggered: false,
          autoGenerated: true
        });
      }
      
      if (!alerts.some(alert => alert.type === 'portfolio' && alert.condition === 'above' && alert.threshold === portfolioGainThreshold)) {
        autoAlerts.push({
          id: Date.now() + Math.random() + 1,
          symbol: 'Portfolio',
          condition: 'above',
          threshold: portfolioGainThreshold,
          type: 'portfolio',
          message: `Portfolio increased by 10% - consider taking profits (${formatINRPlain(portfolioGainThreshold)})`,
          triggered: false,
          autoGenerated: true
        });
      }
    }

    // Check individual asset criteria
    portfolioData.assets.forEach(asset => {
      const currentValue = asset.current_price || 0;
      const value = asset.value || 0;
      
      // Large holdings auto-alerts
      if (value > 25000) {
        const dropThreshold = currentValue * 0.9;
        const gainThreshold = currentValue * 1.15;
        
        if (!alerts.some(alert => alert.symbol === asset.symbol && alert.condition === 'below' && Math.abs(alert.threshold - dropThreshold) < 1)) {
          autoAlerts.push({
            id: Date.now() + Math.random() + 2,
            symbol: asset.symbol,
            condition: 'below',
            threshold: dropThreshold,
            type: 'price',
            message: `${asset.symbol} dropped 10% - consider buying more (${formatINRPlain(dropThreshold)})`,
            triggered: false,
            autoGenerated: true
          });
        }
        
        if (!alerts.some(alert => alert.symbol === asset.symbol && alert.condition === 'above' && Math.abs(alert.threshold - gainThreshold) < 1)) {
          autoAlerts.push({
            id: Date.now() + Math.random() + 3,
            symbol: asset.symbol,
            condition: 'above',
            threshold: gainThreshold,
            type: 'price',
            message: `${asset.symbol} up 15% - consider taking profits (${formatINRPlain(gainThreshold)})`,
            triggered: false,
            autoGenerated: true
          });
        }
      }

      // High volatility auto-alerts
      if (Math.abs(asset.change_percentage_24h || 0) > 5) {
        const volatilityThreshold = currentValue * 0.95;
        
        if (!alerts.some(alert => alert.symbol === asset.symbol && alert.condition === 'below' && Math.abs(alert.threshold - volatilityThreshold) < 1)) {
          autoAlerts.push({
            id: Date.now() + Math.random() + 4,
            symbol: asset.symbol,
            condition: 'below',
            threshold: volatilityThreshold,
            type: 'price',
            message: `${asset.symbol} high volatility - watch for further decline (${formatINRPlain(volatilityThreshold)})`,
            triggered: false,
            autoGenerated: true
          });
        }
      }
    });

    // Check risk-based criteria
    if (portfolioData.risk_level === 'High') {
      const riskDropThreshold = totalValue * 0.8;
      const riskGainThreshold = totalValue * 1.05;
      
      if (!alerts.some(alert => alert.type === 'portfolio' && alert.condition === 'below' && alert.threshold === riskDropThreshold)) {
        autoAlerts.push({
          id: Date.now() + Math.random() + 5,
          symbol: 'Portfolio',
          condition: 'below',
          threshold: riskDropThreshold,
          type: 'portfolio',
          message: `High risk portfolio dropped 20% - consider reducing exposure (${formatINRPlain(riskDropThreshold)})`,
          triggered: false,
          autoGenerated: true
        });
      }
      
      if (!alerts.some(alert => alert.type === 'portfolio' && alert.condition === 'above' && alert.threshold === riskGainThreshold)) {
        autoAlerts.push({
          id: Date.now() + Math.random() + 6,
          symbol: 'Portfolio',
          condition: 'above',
          threshold: riskGainThreshold,
          type: 'portfolio',
          message: `High risk portfolio up 5% - review risk management (${formatINRPlain(riskGainThreshold)})`,
          triggered: false,
          autoGenerated: true
        });
      }
    }

    // Add auto-generated alerts to the list
    if (autoAlerts.length > 0) {
      setAlerts(prevAlerts => [...prevAlerts, ...autoAlerts]);
      console.log(`Auto-generated ${autoAlerts.length} alerts based on portfolio criteria`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <BellIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Investment Alerts</h2>
              {portfolio && (
                <span className="ml-4 text-sm text-gray-600">
                  Portfolio: ${portfolio.total_value?.toLocaleString() || 0}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddAlert(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Alert
            </button>
          </div>

          {/* Suggested Alerts Section */}
          {suggestedAlerts.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                Suggested Alerts Based on Your Portfolio
              </h3>
              <div className="space-y-4">
                {suggestedAlerts.map((suggestion, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {suggestion.alerts.map((alertTemplate, alertIndex) => (
                        <div key={alertIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {alertTemplate.condition === 'above' ? (
                              <ArrowUpIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm text-gray-700">
                              {alertTemplate.symbol} {alertTemplate.condition} ${alertTemplate.threshold}
                            </span>
                          </div>
                          <button
                            onClick={() => applySuggestedAlert(suggestion, alertTemplate)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-Generated Alerts Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-green-600" />
              Auto-Generated Alerts
            </h3>
            {alerts.filter(alert => alert.autoGenerated).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No auto-generated alerts yet</p>
                <p className="text-sm text-gray-400 mt-2">Alerts will be automatically created based on your portfolio criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.filter(alert => alert.autoGenerated).map((alert) => (
                  <div key={alert.id} className="border border-green-200 rounded-lg p-4 hover:bg-green-50 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${
                          alert.triggered ? 'bg-green-100' : 'bg-green-100'
                        }`}>
                          {alert.type === 'portfolio' ? (
                            <CurrencyDollarIcon className={`h-5 w-5 text-green-600`} />
                          ) : (
                            <BellIcon className={`h-5 w-5 text-green-600`} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {alert.symbol} {alert.condition.replace('_', ' ')} {alert.threshold}
                            </h3>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Auto-Generated
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {alert.message}
                          </p>
                          {alert.type === 'portfolio' && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mt-1">
                              Portfolio Alert
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          alert.triggered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.triggered ? 'Triggered' : 'Active'}
                        </span>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Alerts */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Alerts</h3>
            {alerts.filter(alert => !alert.autoGenerated).length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No manual alerts configured</p>
                <p className="text-sm text-gray-400 mt-2">Create custom alerts or use auto-generated alerts based on portfolio criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.filter(alert => !alert.autoGenerated).map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${
                          alert.triggered ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {alert.type === 'portfolio' ? (
                            <CurrencyDollarIcon className={`h-5 w-5 ${
                              alert.triggered ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                          ) : (
                            <BellIcon className={`h-5 w-5 ${
                              alert.triggered ? 'text-green-600' : 'text-yellow-600'
                            }`} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {alert.symbol} {alert.condition.replace('_', ' ')} {alert.threshold}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {alert.message || `${alert.symbol} price alert`}
                          </p>
                          {alert.type === 'portfolio' && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 mt-1">
                              Portfolio Alert
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          alert.triggered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.triggered ? 'Triggered' : 'Active'}
                        </span>
                        <button
                          onClick={() => removeAlert(alert.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <BellIcon className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              <p className="text-sm text-gray-600">Total Alerts</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <SparklesIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.autoGenerated).length}
              </p>
              <p className="text-sm text-gray-600">Auto-Generated</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <BellIcon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.triggered).length}
              </p>
              <p className="text-sm text-gray-600">Triggered Today</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {portfolio?.total_value ? `$${(portfolio.total_value / 1000).toFixed(1)}K` : '$0K'}
              </p>
              <p className="text-sm text-gray-600">Portfolio Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="price">Price Alert</option>
                  <option value="portfolio">Portfolio Value Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newAlert.type === 'portfolio' ? 'Portfolio' : 'Symbol'}
                </label>
                {newAlert.type === 'portfolio' ? (
                  <input
                    type="text"
                    value="Portfolio"
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                ) : (
                  <input
                    type="text"
                    value={newAlert.symbol}
                    onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                    placeholder="BTC, ETH, etc."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold
                </label>
                <input
                  type="number"
                  value={newAlert.threshold}
                  onChange={(e) => setNewAlert({...newAlert, threshold: e.target.value})}
                  placeholder={newAlert.type === 'portfolio' ? '100000' : '45000'}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step={newAlert.type === 'portfolio' ? '1000' : '1'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                  placeholder="Custom alert message"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddAlert(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;
