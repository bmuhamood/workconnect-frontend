// components/dashboard/SuperAdminDashboard.tsx - COMPLETE FIXED VERSION (NO DUMMY DATA)
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Briefcase, DollarSign, FileCheck, 
  BarChart3, Shield, AlertTriangle, Settings,
  TrendingUp, Clock, CheckCircle, Download,
  Server, Database, CreditCard, Globe,
  RefreshCw, ChevronRight, Eye, TrendingDown,
  UserPlus, FileText, Star,
  MapPin, Activity, Award,
  ArrowUpRight, ArrowDownRight,
  Mail, Phone, Calendar, Building,
  AlertCircle, Info
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '@/lib/api';
import { format, subDays, subMonths } from 'date-fns';
import { toast } from 'sonner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SuperAdminDashboardProps {
  user: any;
  data: any;
  onRefresh: () => Promise<void>;
}

// Types for real data from APIs
interface PlatformMetrics {
  total_users: number;
  total_employers: number;
  total_workers: number;
  active_contracts: number;
  trial_contracts: number;
  total_contracts: number;
  completed_contracts: number;
  total_revenue: number;
  monthly_revenue: number;
  revenue_growth: number;
  user_growth: number;
  contract_growth: number;
  pending_verifications: number;
  pending_documents: number;
  pending_contracts: number;
  pending_payments: number;
  pending_reports: number;
  platform_fee: number;
  average_contract_value: number;
  trial_success_rate: number;
}

interface ActivityLog {
  id: string;
  user_email: string;
  user_name: string;
  action_type: string;
  entity_type: string;
  created_at: string;
  ip_address: string;
}

interface UserGrowthData {
  date: string;
  workers: number;
  employers: number;
  total: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  service_fees: number;
  projections: number;
}

interface TopWorker {
  id: string;
  full_name: string;
  profession: string;
  rating_average: number;
  total_placements: number;
  trust_score: number;
}

interface TopEmployer {
  id: string;
  full_name: string;
  company_name: string;
  total_contracts: number;
  total_spent: number;
}

export default function SuperAdminDashboard({ user, data, onRefresh }: SuperAdminDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    total_users: 0,
    total_employers: 0,
    total_workers: 0,
    active_contracts: 0,
    trial_contracts: 0,
    total_contracts: 0,
    completed_contracts: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    revenue_growth: 0,
    user_growth: 0,
    contract_growth: 0,
    pending_verifications: 0,
    pending_documents: 0,
    pending_contracts: 0,
    pending_payments: 0,
    pending_reports: 0,
    platform_fee: 15,
    average_contract_value: 0,
    trial_success_rate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topWorkers, setTopWorkers] = useState<TopWorker[]>([]);
  const [topEmployers, setTopEmployers] = useState<TopEmployer[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    api: { status: 'operational', latency: 0, uptime: 0 },
    database: { status: 'operational', latency: 0, uptime: 0 },
    payment: { status: 'operational', latency: 0, uptime: 0 },
    email: { status: 'operational', latency: 0, uptime: 0 },
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [dataErrors, setDataErrors] = useState({
    metrics: false,
    activity: false,
    growth: false,
    revenue: false,
    performers: false,
    health: false,
  });

  // Fetch real data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    // Reset errors
    setDataErrors({
      metrics: false,
      activity: false,
      growth: false,
      revenue: false,
      performers: false,
      health: false,
    });
    
    try {
      await Promise.allSettled([
        fetchMetrics().catch(err => {
          setDataErrors(prev => ({ ...prev, metrics: true }));
          console.error('Metrics fetch failed:', err);
        }),
        fetchActivityLogs().catch(err => {
          setDataErrors(prev => ({ ...prev, activity: true }));
          console.error('Activity logs fetch failed:', err);
        }),
        fetchUserGrowth().catch(err => {
          setDataErrors(prev => ({ ...prev, growth: true }));
          console.error('User growth fetch failed:', err);
        }),
        fetchRevenueData().catch(err => {
          setDataErrors(prev => ({ ...prev, revenue: true }));
          console.error('Revenue data fetch failed:', err);
        }),
        fetchTopPerformers().catch(err => {
          setDataErrors(prev => ({ ...prev, performers: true }));
          console.error('Top performers fetch failed:', err);
        }),
        fetchSystemHealth().catch(err => {
          setDataErrors(prev => ({ ...prev, health: true }));
          console.error('System health fetch failed:', err);
        }),
      ]);

      // Show summary toast if there were errors
      const errorCount = Object.values(dataErrors).filter(Boolean).length;
      if (errorCount > 0) {
        toast.warning(`Loaded dashboard with ${errorCount} data source(s) unavailable`);
      } else {
        toast.success('Dashboard data updated');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      // Get summary metrics
      const summaryRes = await api.get('/analytics/metrics/summary/');
      
      // Get today's metrics for real-time data
      const todayRes = await api.get('/analytics/metrics/today/');
      
      // Get contracts for detailed stats
      const contractsRes = await api.get('/contracts/contracts/');
      const contracts = contractsRes.data?.results || contractsRes.data || [];
      
      // Get users for detailed stats
      const workersRes = await api.get('/users/workers/profile/');
      const employersRes = await api.get('/users/employers/profile/');
      
      const workers = workersRes.data?.results || workersRes.data || [];
      const employers = employersRes.data?.results || employersRes.data || [];
      
      // Calculate pending items
      const pendingVerifications = [
        ...workers.filter((w: any) => w.verification_status === 'pending'),
        ...employers.filter((e: any) => e.id_verified === false)
      ].length;
      
      const pendingContracts = contracts.filter((c: any) => 
        c.status === 'draft' || c.status === 'pending'
      ).length;
      
      const activeContracts = contracts.filter((c: any) => 
        ['active'].includes(c.status)
      ).length;
      
      const trialContracts = contracts.filter((c: any) => 
        c.status === 'trial'
      ).length;
      
      const completedContracts = contracts.filter((c: any) => 
        c.status === 'completed'
      ).length;
      
      // Calculate average contract value
      const totalContractValue = contracts.reduce((sum: number, c: any) => 
        sum + (c.total_monthly_cost || 0), 0
      );
      const avgContractValue = contracts.length > 0 
        ? totalContractValue / contracts.length 
        : 0;

      setMetrics({
        total_users: workers.length + employers.length,
        total_employers: employers.length,
        total_workers: workers.length,
        active_contracts: activeContracts,
        trial_contracts: trialContracts,
        total_contracts: contracts.length,
        completed_contracts: completedContracts,
        total_revenue: summaryRes.data?.total_revenue || 0,
        monthly_revenue: todayRes.data?.monthly_revenue || 0,
        revenue_growth: summaryRes.data?.revenue_growth || 0,
        user_growth: summaryRes.data?.user_growth || 0,
        contract_growth: summaryRes.data?.contract_growth || 0,
        pending_verifications: pendingVerifications,
        pending_documents: summaryRes.data?.pending_documents || 0,
        pending_contracts: pendingContracts,
        pending_payments: summaryRes.data?.pending_payments || 0,
        pending_reports: summaryRes.data?.pending_reports || 0,
        platform_fee: 15,
        average_contract_value: avgContractValue,
        trial_success_rate: summaryRes.data?.trial_success_rate || 0,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/analytics/activity-logs/recent/');
      const logs = response.data?.results || response.data || [];
      setRecentActivity(logs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  };

// In fetchUserGrowth function, change the API call:

const fetchUserGrowth = async () => {
  try {
    // 🔴 FIXED: Use POST instead of GET for range endpoint
    const response = await api.post('/analytics/metrics/range/', {
      start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
    });
    
    if (response.data?.metrics && Array.isArray(response.data.metrics)) {
      const growthData: UserGrowthData[] = response.data.metrics.map((item: any) => ({
        date: format(new Date(item.metric_date), 'MMM dd'),
        workers: item.new_workers || 0,
        employers: item.new_employers || 0,
        total: (item.new_workers || 0) + (item.new_employers || 0),
      }));
      setUserGrowthData(growthData);
    } else {
      setUserGrowthData([]);
    }
  } catch (error) {
    console.error('Error fetching user growth:', error);
    setUserGrowthData([]);
    throw error;
  }
};

  const fetchRevenueData = async () => {
    try {
      // Try to get revenue data from API
      const response = await api.get('/analytics/metrics/revenue/');
      
      // Handle different response formats
      let revenueArray: RevenueData[] = [];
      
      if (Array.isArray(response.data)) {
        revenueArray = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        revenueArray = response.data.results;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        revenueArray = response.data.data;
      } else if (response.data?.revenue_data && Array.isArray(response.data.revenue_data)) {
        revenueArray = response.data.revenue_data;
      }
      
      setRevenueData(revenueArray);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Set empty array on error
      setRevenueData([]);
      throw error;
    }
  };

const fetchTopPerformers = async () => {
  try {
    // Get top workers by rating
    const workersRes = await api.get('/users/workers/profile/');
    const workers = (workersRes.data?.results || workersRes.data || [])
      .filter((w: any) => w.rating_average > 0)
      .sort((a: any, b: any) => (b.rating_average || 0) - (a.rating_average || 0))
      .slice(0, 5)
      .map((w: any) => ({
        id: w.id,
        full_name: w.full_name,
        profession: w.profession,
        // 🔴 FIXED: Ensure rating_average is a number
        rating_average: w.rating_average ? parseFloat(w.rating_average) : 0,
        total_placements: w.total_placements || 0,
        trust_score: w.trust_score || 0,
      }));
    setTopWorkers(workers);

    // Get top employers by contract count
    const employersRes = await api.get('/users/employers/profile/');
    const employers = (employersRes.data?.results || employersRes.data || [])
      .filter((e: any) => e.total_contracts > 0)
      .sort((a: any, b: any) => (b.total_contracts || 0) - (a.total_contracts || 0))
      .slice(0, 5)
      .map((e: any) => ({
        id: e.id,
        full_name: e.full_name,
        company_name: e.company_name,
        // 🔴 FIXED: Ensure numeric values
        total_contracts: e.total_contracts || 0,
        total_spent: e.total_spent || 0,
      }));
    setTopEmployers(employers);
  } catch (error) {
    console.error('Error fetching top performers:', error);
    setTopWorkers([]);
    setTopEmployers([]);
    throw error;
  }
};

  const fetchSystemHealth = async () => {
    try {
      // Try to get real system health data
      // This would need a health check endpoint
      const response = await api.get('/analytics/dashboard/');
      
      if (response.data?.health) {
        setSystemHealth(response.data.health);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Keep default values but mark as unknown
      setSystemHealth({
        api: { status: 'unknown', latency: 0, uptime: 0 },
        database: { status: 'unknown', latency: 0, uptime: 0 },
        payment: { status: 'unknown', latency: 0, uptime: 0 },
        email: { status: 'unknown', latency: 0, uptime: 0 },
      });
      throw error;
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchDashboardData();
    await onRefresh();
    setLoading(false);
  };

  const handleViewAll = (type: string) => {
    window.location.href = `/admin/${type}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-UG').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'contract_signed': return <FileText className="h-4 w-4 text-green-600" />;
      case 'payment_received': return <DollarSign className="h-4 w-4 text-purple-600" />;
      case 'review_submitted': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'bg-blue-100';
      case 'contract_signed': return 'bg-green-100';
      case 'payment_received': return 'bg-purple-100';
      case 'review_submitted': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };

  // Safe chart data creation with empty state handling
  const hasUserGrowthData = userGrowthData.length > 0;
  const hasRevenueData = revenueData.length > 0;

  const userGrowthChart = {
    labels: hasUserGrowthData ? userGrowthData.map(d => d.date) : ['No Data'],
    datasets: [
      {
        label: 'Workers',
        data: hasUserGrowthData ? userGrowthData.map(d => d.workers) : [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Employers',
        data: hasUserGrowthData ? userGrowthData.map(d => d.employers) : [0],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const revenueChart = {
    labels: hasRevenueData ? revenueData.map(d => d.month) : ['No Data'],
    datasets: [
      {
        label: 'Revenue (UGX)',
        data: hasRevenueData ? revenueData.map(d => d.revenue / 1000) : [0],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Empty state component
  const EmptyState = ({ message, icon: Icon = Info }: { message: string; icon?: any }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="h-12 w-12 text-gray-400 mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );

  return (
    <div className="pb-20 pt-6 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-4">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Administration Dashboard</h2>
              <p className="text-gray-600 text-base sm:text-lg mt-1">Platform analytics and management console</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-gray-500">
            <span>Welcome back,</span>
            <span className="font-semibold text-gray-700">{user?.name || 'Administrator'}</span>
            <Badge variant="outline" className="ml-0 sm:ml-2">Super Admin</Badge>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm">Last updated: {format(new Date(), 'hh:mm:ss a')}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg">
            <Download className="h-5 w-5 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Data Error Banner */}
      {Object.values(dataErrors).some(Boolean) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Some data sources unavailable</h3>
              <p className="text-sm text-amber-700 mt-1">
                The following data could not be loaded: {
                  Object.entries(dataErrors)
                    .filter(([_, hasError]) => hasError)
                    .map(([key]) => key)
                    .join(', ')
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {metrics.total_users > 0 ? formatNumber(metrics.total_users) : '—'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex-shrink-0 ml-2">
                <Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Workers: {metrics.total_workers > 0 ? formatNumber(metrics.total_workers) : '—'}</span>
                <span>Employers: {metrics.total_employers > 0 ? formatNumber(metrics.total_employers) : '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                  metrics.user_growth > 0 ? 'text-green-600' : metrics.user_growth < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.user_growth !== 0 && (
                    metrics.user_growth > 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : metrics.user_growth < 0 ? (
                      <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : null
                  )}
                  {metrics.user_growth !== 0 ? `${Math.abs(metrics.user_growth)}% this month` : 'No growth data'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                  onClick={() => handleViewAll('users')}
                >
                  View
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Active Contracts</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {(metrics.active_contracts + metrics.trial_contracts) > 0 
                    ? formatNumber(metrics.active_contracts + metrics.trial_contracts) 
                    : '—'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex-shrink-0 ml-2">
                <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Active: {metrics.active_contracts > 0 ? formatNumber(metrics.active_contracts) : '—'}</span>
                <span>Trial: {metrics.trial_contracts > 0 ? formatNumber(metrics.trial_contracts) : '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                  metrics.contract_growth > 0 ? 'text-green-600' : metrics.contract_growth < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.contract_growth !== 0 && (
                    metrics.contract_growth > 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : metrics.contract_growth < 0 ? (
                      <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : null
                  )}
                  {metrics.contract_growth !== 0 ? `${Math.abs(metrics.contract_growth)}% this month` : 'No growth data'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                  onClick={() => handleViewAll('contracts')}
                >
                  View
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Monthly Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {metrics.monthly_revenue > 0 ? formatCurrency(metrics.monthly_revenue) : '—'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex-shrink-0 ml-2">
                <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Avg Contract: {metrics.average_contract_value > 0 ? formatCurrency(metrics.average_contract_value) : '—'}</span>
                <span>Fee: {metrics.platform_fee}%</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                  metrics.revenue_growth > 0 ? 'text-green-600' : metrics.revenue_growth < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {metrics.revenue_growth !== 0 && (
                    metrics.revenue_growth > 0 ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : metrics.revenue_growth < 0 ? (
                      <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    ) : null
                  )}
                  {metrics.revenue_growth !== 0 ? `${Math.abs(metrics.revenue_growth)}% this month` : 'No growth data'}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs sm:text-sm"
                  onClick={() => handleViewAll('revenue')}
                >
                  View
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Pending Verifications</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                  {metrics.pending_verifications > 0 ? formatNumber(metrics.pending_verifications) : '—'}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl flex-shrink-0 ml-2">
                <FileCheck className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Documents: {metrics.pending_documents > 0 ? metrics.pending_documents : '—'}</span>
                <span>Contracts: {metrics.pending_contracts > 0 ? metrics.pending_contracts : '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="inline-flex items-center text-xs sm:text-sm font-medium text-amber-600">
                  {metrics.pending_verifications > 0 ? (
                    <>
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Needs attention
                    </>
                  ) : (
                    'No pending items'
                  )}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 text-xs sm:text-sm"
                  onClick={() => handleViewAll('verifications')}
                >
                  Review
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">📈 User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleViewAll('users')}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {hasUserGrowthData ? (
              <div className="h-80">
                <Line data={userGrowthChart} options={chartOptions} />
              </div>
            ) : (
              <EmptyState message="No user growth data available" icon={Info} />
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">💰 Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue (in thousands UGX)</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleViewAll('revenue')}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {hasRevenueData ? (
              <div className="h-80">
                <Bar data={revenueChart} options={chartOptions} />
              </div>
            ) : (
              <EmptyState message="No revenue data available" icon={Info} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Contract Status Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">📊 Contract Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.total_contracts > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{metrics.active_contracts}</span>
                  </div>
                  <Progress value={(metrics.active_contracts / metrics.total_contracts) * 100 || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Trial</span>
                    <span className="font-medium">{metrics.trial_contracts}</span>
                  </div>
                  <Progress value={(metrics.trial_contracts / metrics.total_contracts) * 100 || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-medium">{metrics.completed_contracts}</span>
                  </div>
                  <Progress value={(metrics.completed_contracts / metrics.total_contracts) * 100 || 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Draft/Pending</span>
                    <span className="font-medium">{metrics.pending_contracts}</span>
                  </div>
                  <Progress value={(metrics.pending_contracts / metrics.total_contracts) * 100 || 0} className="h-2" />
                </div>
              </div>
            ) : (
              <EmptyState message="No contract data available" />
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-gray-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">🔄 Recent Platform Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityBgColor(activity.action_type)}`}>
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user_name} - {activity.action_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.entity_type} • {format(new Date(activity.created_at), 'hh:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.ip_address}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recent activity" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Workers */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">⭐ Top Rated Workers</CardTitle>
            <CardDescription>Highest performing workers on the platform</CardDescription>
          </CardHeader>
          <CardContent>

{topWorkers.length > 0 ? topWorkers.map((worker) => (
  <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <Users className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{worker.full_name}</p>
        <p className="text-sm text-gray-500">{worker.profession}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 mr-1" />
        <span className="font-medium">
          {/* 🔴 FIXED: Safe rating formatting */}
          {worker.rating_average != null 
            ? (typeof worker.rating_average === 'number' 
                ? worker.rating_average.toFixed(1) 
                : parseFloat(worker.rating_average).toFixed(1))
            : '0.0'}
        </span>
      </div>
      <p className="text-xs text-gray-500">{worker.total_placements} placements</p>
    </div>
  </div>
)) : (
  <EmptyState message="No worker data available" />
)}
          </CardContent>
        </Card>

        {/* Top Employers */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">🏢 Most Active Employers</CardTitle>
            <CardDescription>Employers with most contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {topEmployers.length > 0 ? (
              <div className="space-y-4">
                {topEmployers.map((employer) => (
                  <div key={employer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <Building className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employer.company_name || employer.full_name}</p>
                        <p className="text-sm text-gray-500">{employer.total_contracts} contracts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(employer.total_spent)}</p>
                      <p className="text-xs text-gray-500">total spent</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No employer data available" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border border-gray-200 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-xl">🛡️ System Health</CardTitle>
          <CardDescription>Platform services and infrastructure status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium">API Service</span>
                </div>
                <Badge className={
                  systemHealth.api.status === 'operational' ? 'bg-green-100 text-green-800 border-green-200' :
                  systemHealth.api.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {systemHealth.api.status === 'operational' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {systemHealth.api.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Latency: {systemHealth.api.latency > 0 ? `${systemHealth.api.latency}ms` : '—'}</span>
                <span>Uptime: {systemHealth.api.uptime > 0 ? `${systemHealth.api.uptime}%` : '—'}</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium">Database</span>
                </div>
                <Badge className={
                  systemHealth.database.status === 'operational' ? 'bg-green-100 text-green-800 border-green-200' :
                  systemHealth.database.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {systemHealth.database.status === 'operational' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {systemHealth.database.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Latency: {systemHealth.database.latency > 0 ? `${systemHealth.database.latency}ms` : '—'}</span>
                <span>Uptime: {systemHealth.database.uptime > 0 ? `${systemHealth.database.uptime}%` : '—'}</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium">Payment Gateway</span>
                </div>
                <Badge className={
                  systemHealth.payment.status === 'operational' ? 'bg-green-100 text-green-800 border-green-200' :
                  systemHealth.payment.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {systemHealth.payment.status === 'operational' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {systemHealth.payment.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Latency: {systemHealth.payment.latency > 0 ? `${systemHealth.payment.latency}ms` : '—'}</span>
                <span>Uptime: {systemHealth.payment.uptime > 0 ? `${systemHealth.payment.uptime}%` : '—'}</span>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium">Email Service</span>
                </div>
                <Badge className={
                  systemHealth.email.status === 'operational' ? 'bg-green-100 text-green-800 border-green-200' :
                  systemHealth.email.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }>
                  {systemHealth.email.status === 'operational' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {systemHealth.email.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Latency: {systemHealth.email.latency > 0 ? `${systemHealth.email.latency}ms` : '—'}</span>
                <span>Uptime: {systemHealth.email.uptime > 0 ? `${systemHealth.email.uptime}%` : '—'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border border-gray-200 shadow-sm mb-12 sm:mb-20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">🚀 Administrative Tools</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Quick access to platform management features
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center border-gray-300 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all"
              onClick={() => handleViewAll('users')}
            >
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl mb-2 sm:mb-3">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900 mb-1 text-sm sm:text-base text-center">User Management</span>
              <p className="text-xs sm:text-sm text-gray-500 text-center">Manage users and permissions</p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center border-gray-300 hover:bg-green-50 hover:border-green-200 hover:shadow-sm transition-all"
              onClick={() => handleViewAll('analytics')}
            >
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl mb-2 sm:mb-3">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900 mb-1 text-sm sm:text-base text-center">Analytics</span>
              <p className="text-xs sm:text-sm text-gray-500 text-center">Platform insights & reports</p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center border-gray-300 hover:bg-yellow-50 hover:border-yellow-200 hover:shadow-sm transition-all"
              onClick={() => handleViewAll('verifications')}
            >
              <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl mb-2 sm:mb-3">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-600" />
              </div>
              <span className="font-semibold text-gray-900 mb-1 text-sm sm:text-base text-center">Verifications</span>
              <p className="text-xs sm:text-sm text-gray-500 text-center">Review documents & IDs</p>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 sm:py-6 px-3 sm:px-4 flex flex-col items-center justify-center border-gray-300 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all"
              onClick={() => handleViewAll('financial')}
            >
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl mb-2 sm:mb-3">
                <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
              </div>
              <span className="font-semibold text-gray-900 mb-1 text-sm sm:text-base text-center">Financial Reports</span>
              <p className="text-xs sm:text-sm text-gray-500 text-center">Revenue & payment analytics</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}