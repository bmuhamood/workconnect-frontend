// hooks/useAuth.js
'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Create context
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
  const router = useRouter();

  // Helper function to get token from cookies
  const getTokenFromCookies = (name = 'access_token') => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Helper function to set token in cookies
  const setTokenInCookies = (name, value, days = 1) => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieString;
    console.log(`Cookie ${name} set:`, cookieString);
  };

  // Create axios instance with correct base URL
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor with proper token handling
  api.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        // Try localStorage first, then cookies
        let token = localStorage.getItem('access_token');
        if (!token) {
          token = getTokenFromCookies('access_token');
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor with correct refresh endpoint
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token') || getTokenFromCookies('refresh_token');
          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'}/users/auth/login/refresh/`,
              { refresh: refreshToken }
            );
            
            const { access } = response.data;
            
            // Store new token
            localStorage.setItem('access_token', access);
            setTokenInCookies('access_token', access);
            
            // Update Authorization header
            originalRequest.headers.Authorization = `Bearer ${access}`;
            
            // Retry original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log('Refresh token failed, logging out');
          await logout();
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token') || getTokenFromCookies('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const response = await api.get('/users/auth/profile/');
        setUser(response.data);
      } catch (error) {
        console.log('Token invalid, clearing...');
        await logout();
      }
    }
    setLoading(false);
  };

// hooks/useAuth.js - Update login function
const login = async (credentials) => {
  try {
    setLoading(true);
    
    console.log('Attempting login with:', credentials);
    
    const response = await api.post('/users/auth/login/', credentials);
    console.log('Login response:', response.data);
    
    if (response.data.tokens && response.data.tokens.access && response.data.user) {
      const { access, refresh } = response.data.tokens;
      const user = response.data.user;
      
      console.log('Login successful! User:', user);
      
      // Store in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_id', user.id);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_email', user.email);
      
      // Set cookies for middleware
      const cookieOptions = 'path=/; max-age=3600; SameSite=Lax;';
      document.cookie = `access_token=${encodeURIComponent(access)}; ${cookieOptions}`;
      document.cookie = `refresh_token=${encodeURIComponent(refresh)}; path=/; max-age=86400; SameSite=Lax;`;
      document.cookie = `user_role=${encodeURIComponent(user.role)}; ${cookieOptions}`;
      document.cookie = `user_id=${encodeURIComponent(user.id)}; ${cookieOptions}`;
      
      // Update state
      setUser(user);
      
      // ✅ Single redirect - just to dashboard
      // Your dashboard page will handle role-based rendering
      router.push('/dashboard');
      
      return response.data;
    }
  } catch (error) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};

  // FIXED: Logout function with complete cookie cleanup
  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token') || getTokenFromCookies('refresh_token');
        if (refreshToken) {
          await api.post('/users/auth/logout/', { refresh: refreshToken }).catch(err => {
            console.log('Logout API error (ignored):', err);
          });
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_phone');
        localStorage.removeItem('user_role');
        
        // Clear ALL cookies
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'phone_verified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token') || getTokenFromCookies('access_token');
    return !!user && !!token;
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/users/auth/profile/');
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    refreshUser,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};