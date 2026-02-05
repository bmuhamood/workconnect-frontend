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
  const getTokenFromCookies = () => {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Helper function to set token in cookies
  const setTokenInCookies = (token, name = 'access_token', days = 1) => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/`;
  };

  // Create axios instance
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token interceptor
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token') || getTokenFromCookies();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
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

    const token = localStorage.getItem('access_token') || getTokenFromCookies();
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // Verify token is still valid by checking profile
        await api.get('/profile/');
        setUser(JSON.parse(userData));
      } catch (error) {
        console.log('Token invalid, clearing...');
        await logout();
      }
    }
    setLoading(false);
  };

// In your login function
const login = async (credentials) => {
  try {
    setLoading(true);
    
    // Call the correct endpoint
    const response = await api.post('/auth/login/', credentials);
    
    if (response.data.tokens && response.data.user) {
      // Store in localStorage
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Also store in cookies for middleware - USE SAME ATTRIBUTES
      const cookieOptions = {
        path: '/',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      };
      
      // Set cookies properly
      document.cookie = `access_token=${response.data.tokens.access}; ${serializeCookie(cookieOptions)}`;
      document.cookie = `refresh_token=${response.data.tokens.refresh}; ${serializeCookie({
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })}`;
      
      // Update state
      setUser(response.data.user);
      
      return response.data;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    // Error handling...
  }
};

// Helper function to serialize cookie
const serializeCookie = (options) => {
  return Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
};

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          await api.post('/auth/logout/', { refresh: refreshToken });
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
        
        // Clear cookies
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      setUser(null);
      router.push('/login');
    }
  };

  const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token') || getTokenFromCookies();
    return !!user && !!token;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};