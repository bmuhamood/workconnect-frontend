// app/dashboard/page.tsx - Complete Version
'use client';

import { useEffect, useState, useRef } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ClientOnly from '@/components/ClientOnly';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LogOut, User, Home, Briefcase, FileText, Bell, Settings, 
  Users, BarChart3, Wallet, Shield, Upload, CheckCircle, 
  Clock, AlertCircle, TrendingUp, DollarSign, FileCheck,
  MessageSquare, Search, Plus, Download, AlertTriangle,
  BarChart2, ShieldCheck, UsersIcon, CreditCard, FileSpreadsheet,
  Building, Package, Globe, Server, Database, Cpu
} from 'lucide-react';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import WorkerDashboard from '@/components/dashboard/WorkerDashboard';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
import DocumentUploadModal from '@/components/dashboard/DocumentUploadModal';
import { toast } from 'sonner';
// import { Skeleton } from '@/components/ui/skeleton';

// Types
interface DashboardData {
  documents: any[];
  contracts: any[];
  payments: any[];
  notifications: any[];
  metrics: any;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated, refreshToken } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    documents: [],
    contracts: [],
    payments: [],
    notifications: [],
    metrics: {},
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
  }

  document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check for error messages from middleware
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'unauthorized_access':
          toast.error('You do not have permission to access that page.');
          break;
        case 'unauthorized_admin_access':
          toast.error('Admin access required for that page.');
          break;
        case 'session_expired':
          toast.error('Your session has expired. Please login again.');
          break;
      }
      // Clean URL
      router.replace('/dashboard');
    }

    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      loadDashboardData();
    }
  }, [isAuthenticated, router, searchParams]);

// Updated loadDashboardData function in app/dashboard/page.tsx
const loadDashboardData = async () => {
  try {
    setLoading(true);
    
    // Load data based on user role
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.log('No access token found');
      await refreshToken();
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    console.log('Loading dashboard data...');

    // Parallel API calls with error handling
    const endpoints = [
      { 
        key: 'documents', 
        url: '/api/documents/my-documents',
        fallback: () => [] 
      },
      { 
        key: 'contracts', 
        url: '/api/contracts/active',
        fallback: () => [] 
      },
      { 
        key: 'payments', 
        url: '/api/payments/recent',
        fallback: () => [] 
      },
      { 
        key: 'notifications', 
        url: '/api/notifications',
        fallback: () => [] 
      },
      { 
        key: 'metrics', 
        url: '/api/metrics/summary',
        fallback: () => ({}) 
      },
    ];

    const promises = endpoints.map(async ({ key, url, fallback }) => {
      try {
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          console.warn(`Failed to load ${key}:`, response.status);
          return { key, data: fallback() };
        }
        
        const data = await response.json();
        return { key, data };
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
        return { key, data: fallback() };
      }
    });

    const results = await Promise.all(promises);
    
    const newData: any = {};
    results.forEach(result => {
      newData[result.key] = result.data;
    });

    setData(newData);
    
    console.log('Dashboard data loaded:', {
      documents: newData.documents.length,
      contracts: newData.contracts.length,
      payments: newData.payments.length,
    });
    
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    toast.error('Failed to load dashboard data');
    
    // If token is invalid, logout
    if (error instanceof Error && error.message.includes('401')) {
      toast.error('Session expired. Please login again.');
      logout();
    }
  } finally {
    setLoading(false);
  }
};

  const handleDocumentUpload = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Refresh documents
      loadDashboardData();
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleNewContract = () => {
    router.push('/contracts/create');
  };

  const handleViewAll = (type: string) => {
    switch (type) {
      case 'documents':
        router.push('/documents');
        break;
      case 'contracts':
        router.push('/contracts');
        break;
      case 'payments':
        router.push('/payments');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Welcome';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}, ${user?.first_name || 'User'}!`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'employer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'worker': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !user) {
    return (
      <ClientOnly>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">WorkConnect Dashboard</h1>
                  <p className="text-sm text-gray-600">{getWelcomeMessage()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {data.notifications.filter((n: any) => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </div>
                
                {/* Messages */}
                <div className="relative">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                    <div className="flex items-center justify-end space-x-2">
                      <Badge variant="outline" className={`capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      {!user.phone_verified && (
                        <Badge variant="destructive" className="text-xs">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 p-2"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    </Button>
                    
                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 animate-in fade-in slide-in-from-top-1">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              router.push('/profile');
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </button>
                          <button
                            onClick={() => {
                              router.push('/settings');
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </button>
                          <div className="border-t my-1"></div>
                          <button
                            onClick={() => {
                              logout();
                              setShowDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>     

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDashboardData()}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (user.role === 'worker') {
                      setShowUploadModal(true);
                    } else if (user.role === 'employer') {
                      handleNewContract();
                    }
                  }}
                >
                  {user.role === 'worker' ? 'Upload Document' : 
                   user.role === 'employer' ? 'Hire Worker' : 
                   'Add User'}
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: 'Documents',
                  value: data.documents.length,
                  icon: FileText,
                  color: 'bg-blue-100 text-blue-600',
                  onClick: () => handleViewAll('documents')
                },
                {
                  label: 'Active Contracts',
                  value: data.contracts.length,
                  icon: Briefcase,
                  color: 'bg-green-100 text-green-600',
                  onClick: () => handleViewAll('contracts')
                },
                {
                  label: 'Pending Payments',
                  value: data.payments.filter((p: any) => p.status === 'pending').length,
                  icon: CreditCard,
                  color: 'bg-yellow-100 text-yellow-600',
                  onClick: () => handleViewAll('payments')
                },
                {
                  label: 'Unread Notifications',
                  value: data.notifications.filter((n: any) => !n.read).length,
                  icon: Bell,
                  color: 'bg-purple-100 text-purple-600',
                  onClick: () => handleViewAll('notifications')
                },
              ].map((stat, index) => (
                <button
                  key={index}
                  onClick={stat.onClick}
                  className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                    <div className={`p-2 rounded-full ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role-Based Dashboard */}
          {user.role === 'super_admin' || user.role === 'admin' ? (
            <SuperAdminDashboard 
              user={user} 
              data={data}
              onRefresh={loadDashboardData}
            />
          ) : user.role === 'worker' ? (
            <WorkerDashboard 
              user={user} 
              documents={data.documents}
              contracts={data.contracts}
              payments={data.payments}
              onUploadDocument={() => setShowUploadModal(true)}
              onViewAll={handleViewAll}
            />
          ) : (
            <EmployerDashboard 
              user={user} 
              contracts={data.contracts}
              payments={data.payments}
              onNewContract={handleNewContract}
              onViewAll={handleViewAll}
            />
          )}
        </main>

        {/* Document Upload Modal */}
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleDocumentUpload}
        />

        {/* Footer */}
        <footer className="mt-8 py-6 border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <Building className="h-6 w-6 text-blue-600" />
                  <span className="text-lg font-semibold">WorkConnect Uganda</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Connecting employers with verified domestic workers
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => router.push('/privacy')}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => router.push('/terms')}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => router.push('/help')}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Help Center
                </button>
                <button 
                  onClick={() => router.push('/contact')}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Contact Us
                </button>
              </div>
              
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} WorkConnect Uganda. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ClientOnly>
  );
}