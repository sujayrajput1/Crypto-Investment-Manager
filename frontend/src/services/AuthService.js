import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

// Demo mode for testing without backend
const DEMO_MODE = false; // Set to true for demo mode without backend

class AuthServiceClass {
  async signup(userData) {
    // If demo mode is enabled, skip backend calls
    if (DEMO_MODE) {
      console.log('Demo mode: Creating mock user for signup');
      return this.createMockUser(userData);
    }
    
    try {
      console.log('Attempting signup with:', userData);
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData);
      console.log('Signup response:', response.data);
      const { access_token, user } = response.data;
      
      // Create user object if not returned by backend
      const userObj = user || {
        id: Date.now(),
        username: userData.full_name || userData.email.split('@')[0],
        email: userData.email,
        full_name: userData.full_name || userData.email.split('@')[0],
        portfolio: {
          total_value: 0,
          predicted_return: 0.08,
          risk_level: 'Medium',
          assets: []
        }
      };
      
      // Store token and user data in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { access_token, user: userObj };
    } catch (error) {
      console.error('Signup error:', error.response?.data);
      console.error('Full error:', error);
      
      // If backend is not available, create a mock user for demo purposes
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        console.log('Backend not available, creating mock user for demo');
        return this.createMockUser(userData);
      }
      
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  }

  async login(credentials) {
    // If demo mode is enabled, skip backend calls
    if (DEMO_MODE) {
      console.log('Demo mode: Creating mock user for login');
      return this.createMockUser(credentials);
    }
    
    try {
      console.log('Attempting login with:', credentials);
      
      // First try the real backend
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      console.log('Login response from backend:', response.data);
      const { access_token, user } = response.data;
      
      // Create user object if not returned by backend
      const userObj = user || {
        id: Date.now(),
        username: credentials.email.split('@')[0],
        email: credentials.email,
        full_name: credentials.email.split('@')[0],
        portfolio: {
          total_value: 0,
          predicted_return: 0.08,
          risk_level: 'Medium',
          assets: []
        }
      };
      
      // Store token and user data in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Store user data in database for persistence
      try {
        await this.storeUserData(userObj, access_token);
      } catch (storeError) {
        console.log('Could not store user data in database, using localStorage only');
      }
      
      return { access_token, user: userObj };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      console.error('Full error:', error);
      
      // If backend is not available, create a mock user for demo purposes
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error') || error.code === 'ECONNREFUSED') {
        console.log('Backend not available, creating mock user for demo');
        return this.createMockUser(credentials);
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Login failed');
    }
  }

  async storeUserData(user, token) {
    try {
      // Store user data in database via API
      const response = await axios.post(`${API_BASE_URL}/user/profile`, {
        user_data: user,
        access_token: token
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('User data stored in database:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error storing user data in database:', error);
      console.log('User data kept in localStorage only');
      // This is expected if the backend doesn't have the user profile endpoint
      // The user data is already stored in localStorage, so we can continue
    }
  }

  async getUserData() {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      // First try to get from database
      const response = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(response.data.user_data));
      return response.data.user_data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Fallback to localStorage with better error handling
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('No user data in localStorage for fallback');
        return null;
      }
      
      // Check if userData is valid JSON
      if (userData === 'undefined' || userData === 'null' || userData.trim() === '') {
        console.log('Invalid user data in localStorage, clearing it');
        localStorage.removeItem('user');
        return null;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Using localStorage fallback data:', parsedUser);
        return parsedUser;
      } catch (parseError) {
        console.error('Error parsing localStorage user data:', parseError);
        console.log('Clearing invalid user data from localStorage');
        localStorage.removeItem('user');
        return null;
      }
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('No user data found in localStorage');
        return null;
      }
      
      // Check if userData is valid JSON
      if (userData === 'undefined' || userData === 'null' || userData.trim() === '') {
        console.log('Invalid user data in localStorage, clearing it');
        localStorage.removeItem('user');
        return null;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log('Successfully parsed user data:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data:', error);
      console.log('Clearing invalid user data from localStorage');
      localStorage.removeItem('user');
      return null;
    }
  }

  async updateUserProfile(updates) {
    try {
      const token = this.getToken();
      const response = await axios.put(`${API_BASE_URL}/user/profile`, {
        user_data: updates
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update localStorage with updated user data
      const updatedUser = { ...this.getCurrentUser(), ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  createMockUser(userData) {
    console.log('Creating mock user for:', userData);
    
    // Create unique user ID based on email for consistency
    const userId = 'user_' + (userData.email || userData.email || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    // Create mock user data
    const mockUser = {
      id: userId,
      username: userData.full_name || userData.email?.split('@')[0] || 'user',
      email: userData.email,
      full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
      portfolio: {
        total_value: 0,
        predicted_return: 0.08,
        risk_level: 'Medium',
        assets: []
      }
    };
    
    // Create mock token
    const mockToken = 'mock_token_' + Date.now();
    
    // Store mock data with user-specific keys
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Store user-specific portfolio data
    const userPortfolioKey = `portfolio_${mockUser.email}`;
    const existingPortfolio = localStorage.getItem(userPortfolioKey);
    if (existingPortfolio) {
      // Use existing portfolio data
      mockUser.portfolio = JSON.parse(existingPortfolio);
      console.log('Using existing portfolio for user:', mockUser.email);
    } else {
      // Store new empty portfolio
      localStorage.setItem(userPortfolioKey, JSON.stringify(mockUser.portfolio));
      console.log('Created new portfolio for user:', mockUser.email);
    }
    
    // Store user-specific reports
    const userReportsKey = `reports_${mockUser.email}`;
    const existingReports = localStorage.getItem(userReportsKey);
    if (!existingReports) {
      localStorage.setItem(userReportsKey, JSON.stringify([]));
      console.log('Created new reports for user:', mockUser.email);
    }
    
    // Store user-specific alerts
    const userAlertsKey = `alerts_${mockUser.email}`;
    const existingAlerts = localStorage.getItem(userAlertsKey);
    if (!existingAlerts) {
      localStorage.setItem(userAlertsKey, JSON.stringify([]));
      console.log('Created new alerts for user:', mockUser.email);
    }
    
    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
    
    console.log('Mock user created successfully:', mockUser);
    
    return {
      access_token: mockToken,
      user: mockUser
    };
  }
}

export const AuthService = new AuthServiceClass();
