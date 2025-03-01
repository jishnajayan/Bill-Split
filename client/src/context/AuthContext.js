import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios to include credentials with all requests
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem('accessToken');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/auth/register', {
        name,
        email,
        password
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Setup axios interceptor for adding auth token to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If the error is 401 (Unauthorized) and not a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            const response = await axios.post('/api/v1/auth/refresh-token');
            const { accessToken } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            
            // Update the header and retry
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      register, 
      login, 
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};