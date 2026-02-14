// hooks/useWorkers.ts - FULLY FIXED
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import api from '@/lib/api';

export interface WorkerProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  age?: string;
  gender?: string;
  national_id?: string;
  profile_photo_url?: string;
  bio?: string;
  city: string;
  district?: string;
  location_lat?: string;
  location_lng?: string;
  experience_years: number;
  education_level?: string;
  languages?: Record<string, string>;
  profession?: string;
  additional_skills?: string[];
  hourly_rate: number;
  availability: 'available' | 'unavailable' | 'on_assignment' | 'full_time' | 'part_time' | 'flexible';
  expected_salary_min?: number;
  expected_salary_max?: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  trust_score: number;
  rating_average: number;
  total_reviews: number;
  total_placements: number;
  completion_percentage: number;
  subscription_tier: 'basic' | 'premium' | 'pro';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export function useWorkers() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ✅ FIXED: Changed from [] to null

  /**
   * Fetch worker profile by ID - ✅ CORRECT ENDPOINT
   */
  const fetchWorkerProfile = useCallback(async (workerId: string) => {
    if (!workerId) throw new Error('Worker ID is required');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<WorkerProfile>(`/users/workers/profile/${workerId}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching worker profile:', err);
      setError(err.response?.data?.detail || 'Failed to fetch worker profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch current user's worker profile - ✅ CORRECT ENDPOINT
   */
  const fetchMyWorkerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<WorkerProfile>('/users/workers/profile/me/');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching my worker profile:', err);
      setError(err.response?.data?.detail || 'Failed to fetch your profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch worker skills - ✅ CORRECT ENDPOINT
   */
  const fetchWorkerSkills = useCallback(async (workerId: string) => {
    try {
      const response = await api.get(`/users/workers/skills/?worker=${workerId}`);
      return response.data.results || response.data;
    } catch (err) {
      console.error('Error fetching worker skills:', err);
      return [];
    }
  }, []);

  /**
   * Fetch worker verifications - ✅ CORRECT ENDPOINT
   */
  const fetchWorkerVerifications = useCallback(async (workerId: string) => {
    try {
      const response = await api.get(`/users/verifications/?worker=${workerId}`);
      return response.data.results || response.data;
    } catch (err) {
      console.error('Error fetching worker verifications:', err);
      return [];
    }
  }, []);

  /**
   * Fetch worker reviews - ✅ CORRECT ENDPOINT
   */
  const fetchWorkerReviews = useCallback(async (workerId: string) => {
    try {
      const response = await api.get(`/reviews/reviews/?reviewee_type=worker&reviewee_id=${workerId}`);
      return response.data.results || response.data;
    } catch (err) {
      console.error('Error fetching worker reviews:', err);
      return [];
    }
  }, []);

  /**
   * Search workers with filters - ✅ CORRECT ENDPOINT
   */
  const searchWorkers = useCallback(async (filters?: {
    profession?: string;
    city?: string;
    availability?: string;
    min_rating?: number;
    min_experience?: number;
    search?: string;
    page?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.profession) params.append('profession', filters.profession);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.availability) params.append('availability', filters.availability);
      if (filters?.min_rating) params.append('rating_average__gte', String(filters.min_rating));
      if (filters?.min_experience) params.append('experience_years__gte', String(filters.min_experience));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', String(filters.page));
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/users/workers/profile/${queryString}`);
      return response.data;
    } catch (err: any) {
      console.error('Error searching workers:', err);
      setError(err.response?.data?.detail || 'Failed to search workers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchWorkerProfile,
    fetchMyWorkerProfile,
    fetchWorkerSkills,
    fetchWorkerVerifications,
    fetchWorkerReviews,
    searchWorkers
  };
}