// services/dashboardService.ts
import api from '@/lib/api';

export const dashboardService = {
  // Get user profile
  getUserProfile: () => api.get('/users/auth/profile/'),
  
  // Get worker profile
  getWorkerProfile: () => api.get('/users/workers/profile/me/'),
  
  // Get employer profile
  getEmployerProfile: () => api.get('/users/employers/profile/me/'),
  
  // Get contracts
  getContracts: (params?: any) => api.get('/contracts/contracts/', { params }),
  
  // Get active contracts
  getActiveContracts: () => api.get('/contracts/contracts/active/'),
  
  // Get contract history
  getContractHistory: () => api.get('/contracts/contracts/history/'),
  
  // Get dashboard documents from analytics (not regular documents endpoint)
  getDashboardDocuments: () => api.get('/analytics/dashboard/documents/'),
  
  // Get dashboard notifications from analytics
  getDashboardNotifications: () => api.get('/analytics/dashboard/notifications/'),
  
  // Get dashboard contracts from analytics
  getDashboardContracts: () => api.get('/analytics/dashboard/contracts/'),
  
  // Get analytics dashboard data
  getDashboardData: (userType: 'worker' | 'employer' | 'admin') => 
    api.get(`/analytics/dashboard-data/?user_type=${userType}`),
  
  // Get platform metrics (for admin)
  getPlatformMetrics: () => api.get('/analytics/metrics/summary/'),
  
  // Get notifications
  getNotifications: () => api.get('/notifications/notifications/'),
  
  // Get unread notifications
  getUnreadNotifications: () => api.get('/notifications/notifications/unread/'),
  
  // Get messages
  getMessages: () => api.get('/messaging/messages/'),
  
  // Get job postings (for employer)
  getJobPostings: (params?: any) => api.get('/job_postings/job-postings/', { params }),
  
  // Get my job postings
  getMyJobPostings: () => api.get('/job_postings/job-postings/?mine=true'),
  
  // Get workers (for admin/employer)
  getWorkers: (params?: any) => api.get('/users/workers/profile/', { params }),
  
  // Get recent activity
  getRecentActivity: () => api.get('/analytics/activity-logs/recent/'),
  
  // Get today's metrics for admin
  getTodayMetrics: () => api.get('/analytics/metrics/today/'),
  
  // Get revenue metrics for admin
  getRevenueMetrics: () => api.get('/analytics/metrics/revenue/'),
  
  // Get all metrics
  getAllMetrics: () => api.get('/analytics/metrics/'),
};

// Helper function to fetch all dashboard data
export const fetchDashboardData = async (userRole: 'worker' | 'employer' | 'admin' | 'super_admin') => {
  try {
    const requests = [];
    
    // Always fetch user profile
    requests.push(dashboardService.getUserProfile());
    
    // Fetch role-specific data
    if (userRole === 'worker') {
      requests.push(dashboardService.getWorkerProfile());
      requests.push(dashboardService.getActiveContracts());
      requests.push(dashboardService.getDashboardDocuments()); // Use analytics endpoint
      requests.push(dashboardService.getDashboardNotifications()); // Use analytics endpoint
      requests.push(dashboardService.getUnreadNotifications());
    } else if (userRole === 'employer') {
      requests.push(dashboardService.getEmployerProfile());
      requests.push(dashboardService.getContracts());
      requests.push(dashboardService.getMyJobPostings());
      requests.push(dashboardService.getDashboardDocuments()); // Use analytics endpoint
      requests.push(dashboardService.getUnreadNotifications());
    } else if (userRole === 'admin' || userRole === 'super_admin') {
      requests.push(dashboardService.getPlatformMetrics());
      requests.push(dashboardService.getTodayMetrics());
      requests.push(dashboardService.getDashboardData('admin'));
      requests.push(dashboardService.getAllMetrics());
      requests.push(dashboardService.getContracts({ page_size: 10 }));
      requests.push(dashboardService.getWorkers({ page_size: 10 }));
      requests.push(dashboardService.getRecentActivity());
      requests.push(dashboardService.getDashboardNotifications());
    }
    
    const results = await Promise.allSettled(requests);
    
    return processDashboardResults(results, userRole);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const processDashboardResults = (results: any[], userRole: string) => {
  const data: any = {};
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      switch (index) {
        case 0: // User profile
          data.user = result.value.data;
          break;
        
        case 1: // Role-specific profile
          if (userRole === 'worker') {
            data.workerProfile = result.value.data;
          } else if (userRole === 'employer') {
            data.employerProfile = result.value.data;
          } else if (userRole === 'admin' || userRole === 'super_admin') {
            data.metrics = { ...result.value.data };
          }
          break;
        
        case 2: // Role-specific data
          if (userRole === 'worker') {
            data.contracts = result.value.data.results || result.value.data;
          } else if (userRole === 'employer') {
            data.contracts = result.value.data.results || result.value.data;
          } else if (userRole === 'admin' || userRole === 'super_admin') {
            data.todayMetrics = result.value.data;
          }
          break;
        
        case 3: 
          if (userRole === 'worker') {
            data.documents = result.value.data.results || result.value.data;
          } else if (userRole === 'employer') {
            data.jobPostings = result.value.data.results || result.value.data;
          } else if (userRole === 'admin' || userRole === 'super_admin') {
            data.dashboardData = result.value.data;
          }
          break;
        
        case 4:
          if (userRole === 'worker') {
            data.notifications = result.value.data.results || result.value.data;
          } else if (userRole === 'employer') {
            data.documents = result.value.data.results || result.value.data;
          } else if (userRole === 'admin' || userRole === 'super_admin') {
            data.allMetrics = result.value.data.results || result.value.data;
          }
          break;
        
        case 5:
          if (userRole === 'worker') {
            // Worker unread notifications
            data.unreadNotifications = result.value.data.results || result.value.data;
          } else if (userRole === 'admin' || userRole === 'super_admin') {
            data.recentContracts = result.value.data.results || result.value.data;
          }
          break;
        
        case 6:
          if (userRole === 'admin' || userRole === 'super_admin') {
            data.recentWorkers = result.value.data.results || result.value.data;
          }
          break;
        
        case 7:
          if (userRole === 'admin' || userRole === 'super_admin') {
            data.recentActivity = result.value.data.results || result.value.data;
          }
          break;
        
        case 8:
          if (userRole === 'admin' || userRole === 'super_admin') {
            data.notifications = result.value.data.results || result.value.data;
          }
          break;
      }
    }
  });
  
  // Merge data for better structure
  if (userRole === 'worker') {
    // Combine notifications
    data.notifications = {
      ...data.notifications,
      unread: data.unreadNotifications
    };
    delete data.unreadNotifications;
    
    // For worker, documents come from analytics/dashboard/documents/
    // You might need to transform this data
    if (data.documents) {
      data.documents = Array.isArray(data.documents) ? data.documents : [];
    } else {
      data.documents = [];
    }
  }
  
  if (userRole === 'employer') {
    // For employer, documents come from analytics/dashboard/documents/
    if (data.documents) {
      data.documents = Array.isArray(data.documents) ? data.documents : [];
    } else {
      data.documents = [];
    }
  }
  
  // Merge all metrics for admin dashboard
  if (userRole === 'admin' || userRole === 'super_admin') {
    data.metrics = {
      ...data.metrics,
      ...data.todayMetrics,
      ...data.dashboardData,
      all_metrics: data.allMetrics,
      total_users: data.recentWorkers?.length || 0,
      active_contracts: data.recentContracts?.length || 0,
      pending_verifications: data.documents?.filter((d: any) => d.status === 'pending')?.length || 0
    };
  }
  
  return data;
};