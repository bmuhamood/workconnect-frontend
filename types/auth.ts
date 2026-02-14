// types/auth.ts
import { User } from './dashboard';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterWorkerRequest {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  city: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profession: string;
  experience_years?: number;
  skills?: string[];
  availability?: 'available' | 'busy' | 'on_leave' | 'not_available' | 'part_time' | 'full_time';
}

export interface RegisterEmployerRequest {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  city: string;
  address?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
}

export interface PhoneVerificationRequest {
  phone: string;
}

export interface PhoneVerificationResponse {
  phone: string;
  otp: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface LogoutRequest {
  refresh: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Base response interface
export interface BaseResponse {
  status: 'success' | 'error';
  message: string;
}

// Response types for your API endpoints
export interface RegisterWorkerResponse extends BaseResponse {
  user_id: string;
  email: string;
  phone: string;
  role: string;
  phone_verified: boolean;
  tokens: AuthTokens;
}

export interface RegisterEmployerResponse extends BaseResponse {
  user_id: string;
  email: string;
  phone: string;
  role: string;
  phone_verified: boolean;
  tokens: AuthTokens;
}

export interface LoginResponse extends BaseResponse {
  user: {
    id: string;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    role: string;
    phone_verified: boolean;
    is_active: boolean;
  };
  tokens: AuthTokens;
}

export interface AuthResponse extends BaseResponse {
  tokens: AuthTokens;
  user: User;
}

// FIXED: Properly typed error response without index signature conflict
export interface ApiErrorResponse {
  detail?: string;
  email?: string[];
  phone?: string[];
  password?: string[];
  confirm_password?: string[];
  first_name?: string[];
  last_name?: string[];
  company_name?: string[];
  city?: string[];
  non_field_errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  data?: ApiErrorResponse;
}