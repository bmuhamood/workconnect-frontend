// hooks/useJobs.ts - UPDATED VERSION WITH JOB POSTING CREATION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  job_type: string;
  salary_range_min: number;
  salary_range_max: number;
  salary_currency: string;
  experience_level?: string;
  skills_required: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employer: {
    id: string | number;
    company_name: string;
    company_description?: string;
  };
  application_count?: number;
  category_id?: string;
  work_schedule?: string;
  start_date?: string;
  status?: string;
  is_featured?: boolean;
  views_count?: number;
  published_at?: string;
  expires_at?: string;
}

interface JobFilters {
  search?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
  min_salary?: number;
  max_salary?: number;
  skills?: string[];
  is_active?: boolean;
  status?: string;
}

export interface JobApplication {
  id: string | number;
  job_posting: string;
  worker: string | number;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_at: string;
  reviewed_at?: string;
}

// EXPORT THIS INTERFACE
export interface CreateJobData {
  title: string;
  description: string;
  requirements?: string;
  salary_min: number;
  salary_max: number;
  location: string;
  work_schedule?: string;
  start_date?: string;
  category_id: string;
  is_featured?: boolean;
  job_type?: string;
  experience_level?: string;
  skills_required?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const useJobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchJobs = useCallback(async (filters: JobFilters = {}, page: number = 1, pageSize: number = 12) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('page_size', pageSize.toString());
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.job_type) queryParams.append('job_type', filters.job_type);
      if (filters.experience_level) queryParams.append('experience_level', filters.experience_level);
      if (filters.min_salary) queryParams.append('salary_range_min', filters.min_salary.toString());
      if (filters.max_salary) queryParams.append('salary_range_max', filters.max_salary.toString());
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
      if (filters.status) queryParams.append('status', filters.status);
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/?${queryParams}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.results) {
        setJobs(data.results);
        setTotalJobs(data.count || data.results.length);
        setTotalPages(Math.ceil((data.count || data.results.length) / pageSize));
      } else {
        setJobs(data);
        setTotalJobs(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchJobById = useCallback(async (jobId: string): Promise<JobPosting | null> => {
    setLoading(true);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/${jobId}/`,
        {
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Job not found (ID: ${jobId})`);
        }
        throw new Error(`Failed to fetch job: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching job:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const applyForJob = useCallback(async (jobId: string, coverLetter?: string): Promise<JobApplication | null> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to apply for jobs');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/applications/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            job_posting: jobId,
            cover_letter: coverLetter || '',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to apply for job: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error applying for job:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply for job');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Create a job posting
  const createJobPosting = useCallback(async (jobData: CreateJobData): Promise<JobPosting | null> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to create job postings');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements || '',
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            location: jobData.location,
            work_schedule: jobData.work_schedule || '',
            start_date: jobData.start_date || null,
            category_id: jobData.category_id,
            is_featured: jobData.is_featured || false,
            job_type: jobData.job_type || 'Full-time',
            experience_level: jobData.experience_level || 'Mid',
            skills_required: jobData.skills_required || [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create job posting: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create job posting');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Update a job posting
  const updateJobPosting = useCallback(async (jobId: string, jobData: Partial<CreateJobData>): Promise<JobPosting | null> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to update job postings');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/${jobId}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jobData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update job posting: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error updating job posting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update job posting');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Delete a job posting
  const deleteJobPosting = useCallback(async (jobId: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to delete job postings');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/${jobId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete job posting: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      console.error('Error deleting job posting:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete job posting');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Publish a job posting
  const publishJobPosting = useCallback(async (jobId: string): Promise<JobPosting | null> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to publish job postings');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/${jobId}/publish/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to publish job posting: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error publishing job posting:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish job posting');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Close a job posting
  const closeJobPosting = useCallback(async (jobId: string): Promise<JobPosting | null> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to close job postings');
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/${jobId}/close/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to close job posting: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error closing job posting:', err);
      setError(err instanceof Error ? err.message : 'Failed to close job posting');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // NEW: Get employer's job postings
  const fetchEmployerJobs = useCallback(async (employerId?: string): Promise<JobPosting[]> => {
    setLoading(true);
    try {
      if (!token || token.trim() === '') {
        throw new Error('Authentication required to fetch employer jobs');
      }

      const queryParams = new URLSearchParams();
      if (employerId) {
        queryParams.append('employer', employerId);
      }
      
      const response = await fetch(
        `${API_URL}/job_postings/job-postings/?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch employer jobs: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (err) {
      console.error('Error fetching employer jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employer jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch all jobs on initial load
  useEffect(() => {
    fetchJobs({ is_active: true });
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    totalJobs,
    totalPages,
    fetchJobs,
    fetchJobById,
    applyForJob,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    publishJobPosting,
    closeJobPosting,
    fetchEmployerJobs,
  };
};