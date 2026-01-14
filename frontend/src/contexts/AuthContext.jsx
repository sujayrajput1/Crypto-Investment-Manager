import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/AuthServiceClass';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    if (AuthService.isAuthenticated()) {
      // In a real app, you might want to validate the token with the backend
      setUser({ authenticated: true });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const userData = await AuthService.login(credentials);
    setUser(userData);
  };

  const signup = async (userData) => {
    const response = await AuthService.signup(userData);
    setUser(response);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};