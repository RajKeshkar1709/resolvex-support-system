import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState(null);

  // Check logged-in user on app start (Direct Axios call with silent refresh fallback)
  const fetchCurrentUser = async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (err) {
      // If /auth/me failed with 401, attempt silent refresh
      try {
        const refreshRes = await axiosClient.post('/auth/refresh');
        const user = refreshRes.data.data?.user;
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (refreshErr) {
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Direct login with axiosClient
  const login = async (credentials) => {
    setLoginLoading(true);
    setAuthError(null);
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      const loggedUser = response.data.data.user;
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoginLoading(false);
    }
  };

  // Direct register with axiosClient
  const register = async (userData) => {
    setRegisterLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);
    try {
      const response = await axiosClient.post('/auth/register', userData);
      setAuthSuccessMessage(response.data.message || 'Account registered successfully!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setRegisterLoading(false);
    }
  };

  // Direct logout with axiosClient
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        loginLoading,
        registerLoading,
        authError,
        authSuccessMessage,
        login,
        register,
        logout,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
