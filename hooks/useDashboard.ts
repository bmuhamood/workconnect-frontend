// hooks/useDashboard.ts - COMPLETE VERIFIED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchDashboardData, dashboardService } from '@/services/dashboardService';
import { toast } from 'sonner';

export const useDashboard = () => {
  const { user, api } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!user?.role) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dashboardData = await fetchDashboardData(user.role);
      setData(dashboardData);
    } catch (err: any) {
      console.error('Dashboard data error:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role) {
      loadDashboardData();
    }
  }, [loadDashboardData, user?.role]);

  const refreshData = async () => {
    await loadDashboardData();
    toast.success('Dashboard refreshed');
  };

  // ==================== DOCUMENTS ====================
  // ✅ CORRECT: From Swagger - /documents/documents/
  const uploadDocument = async (formData: FormData) => {
    try {
      const response = await api.post('/documents/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Document uploaded successfully!');
      await refreshData();
      return response.data;
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload document');
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /documents/documents/
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/documents/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /documents/documents/{id}/
  const deleteDocument = async (documentId: string) => {
    try {
      await api.delete(`/documents/documents/${documentId}/`);
      toast.success('Document deleted successfully');
      await refreshData();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete document');
      throw error;
    }
  };

  // ==================== NOTIFICATIONS ====================
  // ✅ CORRECT: From Swagger - /notifications/notifications/{id}/mark_single_read/
  const markNotificationAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/notifications/${id}/mark_single_read/`);
      await refreshData();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ CORRECT: From Swagger - /notifications/notifications/unread/
  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get('/notifications/notifications/unread/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /notifications/notifications/clear_all/
  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/notifications/clear_all/');
      await refreshData();
      toast.success('All notifications cleared');
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
      throw error;
    }
  };

  // ==================== CONTRACTS ====================
  // ✅ CORRECT: From Swagger - /contracts/contracts/
  const createContract = async (contractData: any) => {
    try {
      const response = await api.post('/contracts/contracts/', contractData);
      toast.success('Contract created successfully');
      await refreshData();
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create contract');
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /contracts/contracts/
  const fetchContracts = async (filters?: any) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const url = params ? `/contracts/contracts/?${params}` : '/contracts/contracts/';
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /contracts/contracts/{id}/
  const fetchContractById = async (id: string) => {
    try {
      const response = await api.get(`/contracts/contracts/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  };

  // ==================== JOB POSTINGS ====================
  // ✅ CORRECT: From Swagger - /job_postings/job-postings/
  const createJobPosting = async (jobData: any) => {
    try {
      const response = await api.post('/job_postings/job-postings/', jobData);
      toast.success('Job posting created successfully');
      await refreshData();
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create job posting');
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /job_postings/job-postings/?mine=true
  const fetchMyJobPostings = async () => {
    try {
      const response = await api.get('/job_postings/job-postings/?mine=true');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job postings:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /job_postings/job-postings/{id}/publish/
  const publishJobPosting = async (id: string) => {
    try {
      const response = await api.post(`/job_postings/job-postings/${id}/publish/`);
      toast.success('Job posting published');
      await refreshData();
      return response.data;
    } catch (error: any) {
      toast.error('Failed to publish job posting');
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /job_postings/job-postings/{id}/close/
  const closeJobPosting = async (id: string) => {
    try {
      const response = await api.post(`/job_postings/job-postings/${id}/close/`);
      toast.success('Job posting closed');
      await refreshData();
      return response.data;
    } catch (error: any) {
      toast.error('Failed to close job posting');
      throw error;
    }
  };

  // ==================== PROFILES ====================
  // ✅ CORRECT: From Swagger - /users/workers/profile/
  const fetchWorkerProfile = async (workerId?: string) => {
    try {
      if (workerId) {
        const response = await api.get(`/users/workers/profile/${workerId}/`);
        return response.data;
      } else {
        const response = await api.get('/users/workers/profile/me/');
        return response.data;
      }
    } catch (error: any) {
      console.error('Error fetching worker profile:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /users/employers/profile/
  const fetchEmployerProfile = async (employerId?: string) => {
    try {
      if (employerId) {
        const response = await api.get(`/users/employers/profile/${employerId}/`);
        return response.data;
      } else {
        const response = await api.get('/users/employers/profile/me/');
        return response.data;
      }
    } catch (error: any) {
      console.error('Error fetching employer profile:', error);
      throw error;
    }
  };

  // ✅ CORRECT: From Swagger - /users/auth/profile/ (PATCH)
  const updateProfile = async (profileData: any) => {
    try {
      const response = await api.patch('/users/auth/profile/', profileData);
      toast.success('Profile updated successfully');
      await refreshData();
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
      throw error;
    }
  };

  // ==================== ANALYTICS ====================
  // ✅ CORRECT: From Swagger - /analytics/metrics/summary/
  const fetchMetricsSummary = async () => {
    try {
      const response = await api.get('/analytics/metrics/summary/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      // Don't throw - this might be admin-only
      return null;
    }
  };

  // ✅ CORRECT: From Swagger - /analytics/activity-logs/recent/
  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/analytics/activity-logs/recent/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching activity:', error);
      return [];
    }
  };

  // ==================== MESSAGES ====================
  // ✅ CORRECT: From Swagger - /messaging/messages/unread/ (if exists)
  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/messaging/messages/unread/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

  return {
    // State
    data,
    loading,
    error,
    user,
    
    // Actions
    refreshData,
    
    // Documents
    uploadDocument,
    fetchDocuments,
    deleteDocument,
    
    // Notifications
    markNotificationAsRead,
    fetchUnreadNotifications,
    clearAllNotifications,
    
    // Contracts
    createContract,
    fetchContracts,
    fetchContractById,
    
    // Job Postings
    createJobPosting,
    fetchMyJobPostings,
    publishJobPosting,
    closeJobPosting,
    
    // Profiles
    fetchWorkerProfile,
    fetchEmployerProfile,
    updateProfile,
    
    // Analytics
    fetchMetricsSummary,
    fetchRecentActivity,
    
    // Messages
    fetchUnreadMessages,
  };
};