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
    const response = await axios.get(`${API_BASE_URL}/reports/export/csv`);
    return response.data;
  }

  async createRule(ruleData) {
    const response = await axios.post(`${API_BASE_URL}/rules`, ruleData);
    return response.data;
  }

  async simulateRules() {
    const response = await axios.get(`${API_BASE_URL}/rules/simulate`);
    return response.data;
  }

  async createAlert(alertData) {
    const response = await axios.post(`${API_BASE_URL}/alerts`, alertData);
    return response.data;
  }

  async getAlerts() {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data;
  }
}

export const ApiService = new ApiServiceClass();