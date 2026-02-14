// lib/api.ts - FIXED ENDPOINTS
import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse,
  AxiosError 
} from 'axios';
import {
  LoginCredentials,
  RegisterWorkerRequest,
  RegisterEmployerRequest,
  RegisterWorkerResponse,
  RegisterEmployerResponse,
  LoginResponse,
  PhoneVerificationRequest,
  VerifyPhoneRequest,
  RefreshTokenResponse,
} from '@/types/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Create axios instances
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Type-safe API service - FIXED ENDPOINTS (added /users prefix)
export const authService = {
  // Registration
  registerWorker: (data: RegisterWorkerRequest): Promise<AxiosResponse<RegisterWorkerResponse>> => 
    authApi.post('/users/auth/register/worker/', data), // FIXED: Added /users prefix
  
  registerEmployer: (data: RegisterEmployerRequest): Promise<AxiosResponse<RegisterEmployerResponse>> => 
    authApi.post('/users/auth/register/employer/', data), // FIXED: Added /users prefix
  
  // Login
  login: (credentials: LoginCredentials): Promise<AxiosResponse<LoginResponse>> => 
    authApi.post('/users/auth/login/', credentials), // FIXED: Added /users prefix
  
  // Phone verification
  requestPhoneVerification: (phone: string): Promise<AxiosResponse<PhoneVerificationRequest>> => 
    authApi.post('/users/auth/phone/request-verification/', { phone }), // FIXED
  
  verifyPhone: (data: VerifyPhoneRequest): Promise<AxiosResponse<any>> => 
    authApi.post('/users/auth/phone/verify/', data), // FIXED
  
  resendOTP: (phone: string): Promise<AxiosResponse<any>> => 
    authApi.post('/users/auth/phone/resend-otp/', { phone }), // FIXED
  
  // Logout
  logout: (refreshToken: string): Promise<AxiosResponse<any>> => 
    api.post('/users/auth/logout/', { refresh: refreshToken }), // FIXED
  
  logoutAll: (): Promise<AxiosResponse<any>> => 
    api.post('/users/auth/logout-all/'), // FIXED
  
  // Token refresh
  refreshToken: (refreshToken: string): Promise<AxiosResponse<RefreshTokenResponse>> => 
    authApi.post('/users/auth/login/refresh/', { refresh: refreshToken }), // FIXED
  
  // Password
  changePassword: (data: any): Promise<AxiosResponse<any>> => 
    api.post('/users/auth/password/change/', data), // FIXED
  
  resetPassword: (email: string): Promise<AxiosResponse<any>> => 
    authApi.post('/users/auth/password/reset/', { email }), // FIXED
  
  confirmResetPassword: (data: any): Promise<AxiosResponse<any>> => 
    authApi.post('/users/auth/password/reset/confirm/', data), // FIXED
  
  // Profile
  getProfile: (): Promise<AxiosResponse<any>> => 
    api.get('/users/auth/profile/'), // FIXED
  
  updateProfile: (data: any): Promise<AxiosResponse<any>> => 
    api.patch('/users/auth/profile/', data), // FIXED
  
  // Check auth
  checkAuth: (): Promise<AxiosResponse<any>> => 
    api.get('/users/auth/check-auth/'), // FIXED
};

// Rest of your code remains the same...

// FIXED: Use InternalAxiosRequestConfig instead of AxiosRequestConfig
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add authApi interceptor as well
authApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// FIXED: Properly typed response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          clearAuth();
          redirectToLogin();
          return Promise.reject(error);
        }
        
        const response = await authService.refreshToken(refreshToken);
        const { access } = response.data;
        
        localStorage.setItem('access_token', access);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        clearAuth();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_role');
    
    // Clear cookies if using them
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// Export types and instances
export { api, authApi };
export default api;