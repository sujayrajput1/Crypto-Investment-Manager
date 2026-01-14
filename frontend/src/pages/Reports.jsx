import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DocumentTextIcon, ArrowDownTrayIcon, ChartBarIcon, CalculatorIcon, SparklesIcon, PlusIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { ApiService } from '../services/ApiService';
import { AuthService } from '../services/AuthService';

function Reports() {
  const [reports, setReports] = useState([]);
  const [investmentBreakdown, setInvestmentBreakdown] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddReport, setShowAddReport] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'Portfolio Summary',
    value: 0,
    risk_level: 'Medium'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated first
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    loadReports();
    loadInvestmentBreakdown();
    loadDashboardData();
    
    // Listen for portfolio updates from Dashboard
    const handlePortfolioChange = (event) => {
      console.log('Portfolio change event received in Reports:', event.detail);
      if (event.detail && event.detail.portfolio) {
        setDashboardData(event.detail.portfolio);
        // Update new report form with current portfolio value
        setNewReport(prev => ({
          ...prev,
          value: event.detail.portfolio.total_value || 0,
          risk_level: event.detail.portfolio.risk_level || 'Medium'
        }));
      }
    };
    
    window.addEventListener('portfolioUpdated', handlePortfolioChange);
    
    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const portfolioData = await ApiService.getDashboardSummary();
      setDashboardData(portfolioData);
      // Update new report form with current portfolio value
      setNewReport(prev => ({
        ...prev,
        value: portfolioData.total_value || 0,
        risk_level: portfolioData.risk_level || 'Medium'
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Try to get from localStorage as fallback
      const savedPortfolio = localStorage.getItem('currentPortfolio');
      if (savedPortfolio) {
        try {
          const portfolioData = JSON.parse(savedPortfolio);
          setDashboardData(portfolioData);
          setNewReport(prev => ({
            ...prev,
            value: portfolioData.total_value || 0,
            risk_level: portfolioData.risk_level || 'Medium'
          }));
        } catch (parseError) {
          console.error('Error parsing saved portfolio:', parseError);
        }
      }
    }
  };

  const loadReports = async () => {
    try {
      // Get current user to load user-specific reports
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        // Load user-specific reports
        const userReportsKey = `reports_${currentUser.email}`;
        const userReportsData = localStorage.getItem(userReportsKey);
        
        if (userReportsData) {
          const userReports = JSON.parse(userReportsData);
          console.log('Loading user-specific reports:', userReports);
          setReports(userReports);
        } else {
          console.log('No user reports found, creating empty reports array');
          setReports([]);
          localStorage.setItem(userReportsKey, JSON.stringify([]));
        }
      } else {
        console.log('No current user, using mock reports');
        setReports([
          {
            id: 1,
            type: 'Portfolio Summary',
            date: new Date().toISOString(),
            value: 125000,
            risk_level: 'Medium'
          },
          {
            id: 2,
            type: 'Risk Analysis',
            date: new Date(Date.now() - 86400000).toISOString(),
            value: 125000,
            risk_level: 'Medium'
          },
          {
            id: 3,
            type: 'Performance Report',
            date: new Date(Date.now() - 172800000).toISOString(),
            value: 118500,
            risk_level: 'Low'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      // Use mock data as fallback
      setReports([
        {
          id: 1,
          type: 'Portfolio Summary',
          date: new Date().toISOString(),
          value: 125000,
          risk_level: 'Medium'
        },
        {
          id: 2,
          type: 'Risk Analysis',
          date: new Date(Date.now() - 86400000).toISOString(),
          value: 125000,
          risk_level: 'Medium'
        },
        {
          id: 3,
          type: 'Performance Report',
          date: new Date(Date.now() - 172800000).toISOString(),
          value: 118500,
          risk_level: 'Low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvestmentBreakdown = () => {
    // Get investment breakdown from localStorage (saved from Portfolio page)
    const savedBreakdown = localStorage.getItem('lastInvestmentBreakdown');
    if (savedBreakdown) {
      try {
        setInvestmentBreakdown(JSON.parse(savedBreakdown));
      } catch (error) {
        console.error('Error loading investment breakdown:', error);
        // Add mock data for testing
        setInvestmentBreakdown({
          expected_return: 0.12,
          risk_score: 6.5,
          totalInvestment: 10000,
          strategy: 'balanced',
          investmentBreakdown: [
            {
              symbol: 'BTC',
              weight: 40,
              investment: 4000,
              price: 42500.50,
              quantity: 0.094118,
              isDefault: true
            },
            {
              symbol: 'ETH',
              weight: 35,
              investment: 3500,
              price: 3150.25,
              quantity: 1.111111,
              isDefault: true
            },
            {
              symbol: 'ADA',
              weight: 25,
              investment: 2500,
              price: 0.52,
              quantity: 4807.692308,
              isDefault: true
            }
          ]
        });
      }
    } else {
      // Add mock data for testing when no saved data exists
      console.log('No saved breakdown found, using mock data');
      setInvestmentBreakdown({
        expected_return: 0.12,
        risk_score: 6.5,
        totalInvestment: 10000,
        strategy: 'balanced',
        investmentBreakdown: [
          {
            symbol: 'BTC',
            weight: 40,
            investment: 4000,
            price: 42500.50,
            quantity: 0.094118,
            isDefault: true
          },
          {
            symbol: 'ETH',
            weight: 35,
            investment: 3500,
            price: 3150.25,
            quantity: 1.111111,
            isDefault: true
          },
          {
            symbol: 'ADA',
            weight: 25,
            investment: 2500,
            price: 0.52,
            quantity: 4807.692308,
            isDefault: true
          }
        ]
      });
    }
  };

  const exportInvestmentBreakdownToCsv = () => {
    console.log('Export Investment Breakdown clicked');
    console.log('Investment breakdown data:', investmentBreakdown);
    
    if (!investmentBreakdown || !investmentBreakdown.investmentBreakdown) {
      alert('No investment breakdown data available. Please calculate an investment mix first.');
      return;
    }

    const headers = [
      'Symbol',
      'Allocation (%)',
      'Investment Amount ($)',
      'Price per Unit ($)',
      'Quantity',
      'Type',
      'Date Generated'
    ];

    const rows = investmentBreakdown.investmentBreakdown.map(item => [
      item.symbol,
      item.weight,
      item.investment.toFixed(2),
      item.price.toFixed(2),
      item.quantity.toFixed(6),
      item.isDefault ? 'Default' : 'Manual',
      new Date().toLocaleDateString()
    ]);

    // Add summary row
    const totalInvestment = investmentBreakdown.investmentBreakdown.reduce((sum, item) => sum + item.investment, 0);
    const expectedReturn = investmentBreakdown.expected_return || 0;
    const riskScore = investmentBreakdown.risk_score || 0;
    
    rows.push([]);
    rows.push(['SUMMARY', '', '', '', '', '', '']);
    rows.push(['Total Investment', totalInvestment.toFixed(2), '', '', '', '', '']);
    rows.push(['Expected Return', `${(expectedReturn * 100).toFixed(1)}%`, '', '', '', '', '']);
    rows.push(['Risk Score', riskScore.toFixed(2), '', '', '', '', '']);
    rows.push(['Strategy', investmentBreakdown.strategy || 'N/A', '', '', '', '', '']);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    console.log('CSV Content generated:', csvContent.substring(0, 200) + '...');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment_breakdown_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed');
  };

  const exportCombinedReport = () => {
    console.log('Export Combined Report clicked');
    console.log('Investment breakdown data:', investmentBreakdown);
    
    if (!investmentBreakdown || !investmentBreakdown.investmentBreakdown) {
      alert('No investment breakdown data available. Please calculate an investment mix first.');
      return;
    }

    // Create combined CSV with reports and investment breakdown
    let csvContent = 'CRYPTO INVESTMENT MANAGER - COMPREHENSIVE REPORT\n';
    csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Investment Breakdown Section
    csvContent += 'INVESTMENT BREAKDOWN\n';
    csvContent += 'Symbol,Allocation (%),Investment Amount ($),Price per Unit ($),Quantity,Type\n';
    
    investmentBreakdown.investmentBreakdown.forEach(item => {
      csvContent += `${item.symbol},${item.weight},${item.investment.toFixed(2)},${item.price.toFixed(2)},${item.quantity.toFixed(6)},${item.isDefault ? 'Default' : 'Manual'}\n`;
    });

    // Summary Section
    const totalInvestment = investmentBreakdown.investmentBreakdown.reduce((sum, item) => sum + item.investment, 0);
    const expectedReturn = investmentBreakdown.expected_return || 0;
    const riskScore = investmentBreakdown.risk_score || 0;
    
    csvContent += '\nSUMMARY\n';
    csvContent += `Total Investment,${totalInvestment.toFixed(2)}\n`;
    csvContent += `Expected Return,${(expectedReturn * 100).toFixed(1)}%\n`;
    csvContent += `Risk Score,${riskScore.toFixed(2)}\n`;
    csvContent += `Strategy,${investmentBreakdown.strategy || 'N/A'}\n`;

    // Historical Reports Section
    csvContent += '\nHISTORICAL REPORTS\n';
    csvContent += 'Date,Type,Value ($),Risk Level\n';
    
    reports.forEach(report => {
      csvContent += `${new Date(report.date).toLocaleDateString()},${report.type},${report.value},${report.risk_level}\n`;
    });

    console.log('Combined CSV Content generated:', csvContent.substring(0, 200) + '...');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Combined download completed');
  };

  const addReport = () => {
    // Get current portfolio data for Portfolio Summary reports
    const currentPortfolio = JSON.parse(localStorage.getItem('currentPortfolio') || '{}');
    const portfolioValue = currentPortfolio.total_value || dashboardData?.total_value || 0;
    const portfolioRisk = currentPortfolio.risk_level || dashboardData?.risk_level || 'Medium';
    
    const report = {
      id: Date.now(),
      type: newReport.type,
      date: new Date().toISOString(),
      value: newReport.type === 'Portfolio Summary' ? portfolioValue : newReport.value,
      risk_level: newReport.type === 'Portfolio Summary' ? portfolioRisk : newReport.risk_level
    };
    
    // Add report to user-specific storage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const userReportsKey = `reports_${currentUser.email}`;
      const updatedReports = [...reports, report];
      setReports(updatedReports);
      localStorage.setItem(userReportsKey, JSON.stringify(updatedReports));
      console.log('Saved report to user-specific storage:', currentUser.email);
    } else {
      setReports([...reports, report]);
    }
    
    setShowAddReport(false);
    setNewReport({
      type: 'Portfolio Summary',
      value: portfolioValue,
      risk_level: portfolioRisk
    });
  };

  const removeReport = (reportId) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    
    // Save to user-specific storage
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      const userReportsKey = `reports_${currentUser.email}`;
      setReports(updatedReports);
      localStorage.setItem(userReportsKey, JSON.stringify(updatedReports));
      console.log('Removed report from user-specific storage:', currentUser.email);
    } else {
      setReports(updatedReports);
    }
  };

  const updateReportValue = (value) => {
    setNewReport({
      ...newReport,
      value: parseFloat(value) || 0
    });
  };

  const downloadReport = (report) => {
    console.log('Downloading individual report:', report);
    
    // Get current portfolio data if available
    const currentPortfolio = JSON.parse(localStorage.getItem('currentPortfolio') || '{}');
    const currentAssets = currentPortfolio.assets || [];
    
    // Create CSV content for individual report
    let csvContent = [
      'CRYPTO INVESTMENT MANAGER - INDIVIDUAL REPORT',
      `Report Type: ${report.type}`,
      `Generated on: ${new Date(report.date).toLocaleString()}`,
      ''
    ];

    // Add current portfolio information if this is a Portfolio Summary
    if (report.type === 'Portfolio Summary' && currentAssets.length > 0) {
      csvContent.push('CURRENT PORTFOLIO HOLDINGS');
      csvContent.push('Asset,Amount,Current Price ($),Value ($),24h Change (%)');
      
      currentAssets.forEach(asset => {
        csvContent.push(`${asset.symbol},${asset.amount},${asset.current_price},${asset.value},${asset.change_percentage_24h || 0}`);
      });
      
      csvContent.push('');
      csvContent.push('PORTFOLIO SUMMARY');
      csvContent.push(`Total Value,${currentPortfolio.total_value || 0}`);
      csvContent.push(`Predicted Return,${((currentPortfolio.predicted_return || 0) * 100).toFixed(1)}%`);
      csvContent.push(`Risk Level,${currentPortfolio.risk_level || 'Medium'}`);
      csvContent.push(`Total Assets,${currentAssets.length}`);
      csvContent.push('');
    }

    csvContent.push('REPORT DETAILS');
    csvContent.push('Type,Value ($),Risk Level,Date');
    csvContent.push(`${report.type},${report.value},${report.risk_level},${new Date(report.date).toLocaleDateString()}`);
    csvContent.push('');
    csvContent.push('SUMMARY');
    csvContent.push(`Report Value,${report.value}`);
    csvContent.push(`Risk Level,${report.risk_level}`);
    csvContent.push(`Report Date,${new Date(report.date).toLocaleDateString()}`);
    csvContent.push('');
    csvContent.push('ADDITIONAL INFO');
    csvContent.push(`Report ID,${report.id}`);
    csvContent.push(`Export Date,${new Date().toLocaleString()}`);

    // Create and download CSV file
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.type.replace(/\s+/g, '_')}_${new Date(report.date).toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`Downloaded ${report.type} report`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              {dashboardData && (
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Current Portfolio Value: 
                    <span className="font-semibold text-green-600">
                      ${dashboardData.total_value?.toLocaleString() || 0}
                    </span>
                  </span>
                  <span className="text-sm text-gray-600">
                    Risk Level: 
                    <span className={`font-semibold ${
                      dashboardData.risk_level === 'High' ? 'text-red-600' :
                      dashboardData.risk_level === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                    {dashboardData.risk_level || 'Medium'}
                  </span>
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddReport(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Report
              </button>
              <button
                onClick={exportInvestmentBreakdownToCsv}
                disabled={!investmentBreakdown}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                Export Investment Breakdown
              </button>
              <button
                onClick={exportCombinedReport}
                disabled={!investmentBreakdown}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Export Combined Report
              </button>
            </div>
          </div>

          {/* Investment Breakdown Section */}
          {investmentBreakdown && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CalculatorIcon className="h-6 w-6 mr-2 text-blue-600" />
                Latest Investment Breakdown
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Allocation Summary</h3>
                  <div className="space-y-2">
                    {investmentBreakdown.investmentBreakdown.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{item.symbol}</span>
                          <span className="text-sm text-gray-600">{item.weight}%</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          ${item.investment.toLocaleString()} ({item.quantity.toFixed(4)} units @ ${item.price})
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.weight}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm font-medium text-green-600">Expected Annual Return</p>
                      <p className="text-2xl font-bold text-green-900">
                        {((investmentBreakdown.expected_return || 0) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-700">
                        ${(investmentBreakdown.totalInvestment * (investmentBreakdown.expected_return || 0)).toLocaleString()} profit
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-medium text-blue-600">Risk Score</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(investmentBreakdown.risk_score || 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-blue-700">
                        {(investmentBreakdown.risk_score || 0) < 3 ? 'Low Risk' : 
                         (investmentBreakdown.risk_score || 0) < 7 ? 'Medium Risk' : 'High Risk'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <p className="text-sm font-medium text-purple-600">Total Investment</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${(investmentBreakdown.totalInvestment || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-purple-700">
                        Strategy: {investmentBreakdown.strategy || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Reports Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              Historical Reports
            </h2>
            
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No reports available</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 rounded-full p-2">
                          <ChartBarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{report.type}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${report.value.toLocaleString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            report.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                            report.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.risk_level} Risk
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadReport(report)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-600 mb-2">Portfolio Summary</h3>
              <p className="text-2xl font-bold text-blue-900">
                {reports.filter(r => r.type === 'Portfolio Summary').length}
              </p>
              <p className="text-sm text-blue-600">Reports generated</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-600 mb-2">Total Value</h3>
              <p className="text-2xl font-bold text-green-900">
                ${reports.reduce((sum, r) => sum + r.value, 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">Across all reports</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-600 mb-2">Average Risk</h3>
              <p className="text-2xl font-bold text-purple-900">Medium</p>
              <p className="text-sm text-purple-600">Risk level</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Report Modal */}
      {showAddReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Report</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Portfolio Summary">Portfolio Summary</option>
                  <option value="Risk Analysis">Risk Analysis</option>
                  <option value="Performance Report">Performance Report</option>
                  <option value="Tax Report">Tax Report</option>
                  <option value="Custom Report">Custom Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Value ($)
                </label>
                <input
                  type="number"
                  value={newReport.value}
                  onChange={(e) => updateReportValue(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  disabled={newReport.type === 'Portfolio Summary'}
                />
                {newReport.type === 'Portfolio Summary' && (
                  <p className="text-xs text-green-600 mt-1">
                    Auto-populated from current portfolio
                  </p>
                )}
                {newReport.type !== 'Portfolio Summary' && dashboardData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current portfolio: ${dashboardData.total_value?.toLocaleString() || 0}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={newReport.risk_level}
                  onChange={(e) => setNewReport({...newReport, risk_level: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={newReport.type === 'Portfolio Summary'}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {newReport.type === 'Portfolio Summary' && (
                  <p className="text-xs text-green-600 mt-1">
                    Auto-populated from current portfolio
                  </p>
                )}
                {newReport.type !== 'Portfolio Summary' && dashboardData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current risk: {dashboardData.risk_level || 'Medium'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddReport(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addReport}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
