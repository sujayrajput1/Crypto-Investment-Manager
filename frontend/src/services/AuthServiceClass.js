import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

class AuthServiceClass {
  async signup(userData) {
    try {
      console.log('Attempting signup with:', userData);
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      console.log('Signup response:', response.data);
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  }

  async login(credentials) {
    try {
      console.log('Attempting login with:', credentials);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      console.log('Login response:', response.data);
      const { access_token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', access_token);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  logout() {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const AuthService = new AuthServiceClass();