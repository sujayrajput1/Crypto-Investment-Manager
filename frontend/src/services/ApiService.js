import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

class ApiServiceClass {
  constructor() {
    // Set authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  async getDashboardSummary() {
    const response = await axios.get(`${API_BASE_URL}/dashboard/summary`);
    return response.data;
  }

  async getCryptoPrices() {
    const response = await axios.get(`${API_BASE_URL}/crypto/prices`);
    return response.data;
  }

  async calculateInvestmentMix(data) {
    const response = await axios.post(`${API_BASE_URL}/portfolio/mix`, data);
    return response.data;
  }

  async getRiskAnalysis() {
    const response = await axios.get(`${API_BASE_URL}/risk/analyze`);
    return response.data;
  }

  async getReports() {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data;
  }

  async exportReportsCsv() {
    const response = await axios.get(`${API_BASE_URL}/reports/export/csv`, { responseType: 'blob' });
    return response.data;
  }

  async createAlert(alertData) {
    const response = await axios.post(`${API_BASE_URL}/alerts`, alertData, { headers: { 'Content-Type': 'application/json' } });
    return response.data;
  }

  async getAlerts() {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data;
  }

  async removeAlert(alertId) {
    const response = await axios.delete(`${API_BASE_URL}/alerts/${alertId}`);
    return response.data;
  }

  async addPortfolioAsset(assetData) {
    const response = await axios.post(`${API_BASE_URL}/portfolio/add`, assetData);
    return response.data;
  }

  async removePortfolioAsset(symbol) {
    const response = await axios.delete(`${API_BASE_URL}/portfolio/remove/${symbol}`);
    return response.data;
  }

  async updatePortfolio(portfolioData) {
    const response = await axios.put(`${API_BASE_URL}/portfolio`, portfolioData);
    return response.data;
  }

  async createReport(reportData) {
    const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
    return response.data;
  }

  async removeReport(reportId) {
    const response = await axios.delete(`${API_BASE_URL}/reports/${reportId}`);
    return response.data;
  }
}

export const ApiService = new ApiServiceClass();