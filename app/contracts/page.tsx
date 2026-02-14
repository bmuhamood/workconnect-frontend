'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Download, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Filter, Search, Plus, Calendar, 
  User, Building, DollarSign, ChevronRight, Loader2,
  TrendingUp, Shield, Award, Zap, Users, Briefcase,
  Home, BarChart, PieChart, Activity, MoreVertical,
  Printer, Mail, Share2, Star, ThumbsUp, MessageCircle,
  FileSignature, FileCheck, Ban, RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useContracts } from '@/hooks/useContracts';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export default function ContractsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    contracts, 
    loading, 
    fetchContracts, 
    signContract, 
    terminateContract,
    getContractDocument 
  } = useContracts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    completed: 0,
    totalSpent: 0,
    pendingSignatures: 0
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (contracts.length > 0) {
      calculateStats();
    }
  }, [contracts]);

  const calculateStats = () => {
    const total = contracts.length;
    const active = contracts.filter(c => c.status === 'active').length;
    const trial = contracts.filter(c => c.status === 'trial').length;
    const completed = contracts.filter(c => c.status === 'completed').length;
    const totalSpent = contracts.reduce((sum, c) => sum + (c.total_monthly_cost || 0), 0);
    const pendingSignatures = contracts.filter(c => 
      c.status === 'draft' && (!c.signed_by_employer || !c.signed_by_worker)
    ).length;

    setStats({ total, active, trial, completed, totalSpent, pendingSignatures });
  };

  const filteredContracts = contracts.filter(contract => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      contract.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.worker_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employer_details?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employer_details?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

    // Tab filter
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'active' && ['active', 'trial'].includes(contract.status)) ||
      (selectedTab === 'pending' && contract.status === 'draft') ||
      (selectedTab === 'completed' && ['completed', 'terminated'].includes(contract.status));

    return matchesSearch && matchesStatus && matchesTab;
  });

  const handleSignContract = async (contractId: string) => {
    try {
      await signContract(contractId);
      toast.success('Contract signed successfully!');
      fetchContracts();
    } catch (error) {
      toast.error('Failed to sign contract');
    }
  };

  const handleDownloadDocument = async (contractId: string) => {
    try {
      const url = await getContractDocument(contractId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
      trial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
      active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      completed: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Award },
      terminated: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      cancelled: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Ban }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} border px-3 py-1 text-xs font-medium`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

// app/contracts/page.tsx - Add these utility functions at the top of your component

// Safe date formatter that handles null/undefined values
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Safe distance formatter for trial end dates
const formatDistanceToNowSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return '';
  }
};

// Safe trial days formatter
const getTrialDaysDisplay = (days: number | undefined | null): string => {
  if (days === undefined || days === null) return '';
  if (days < 0) return 'Trial ended';
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
};

// Safe progress value calculator
const getTrialProgressValue = (days: number | undefined | null, totalDays: number = 14): number => {
  if (days === undefined || days === null) return 0;
  const progress = ((totalDays - days) / totalDays) * 100;
  return Math.max(0, Math.min(100, progress));
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading contracts...</h3>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your contracts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header with Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <div className="p-2 rounded-lg hover:bg-blue-50 transition-colors">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="font-medium ml-1">Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Contracts</h1>
                  <p className="text-sm text-gray-500">Manage your work agreements</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-gray-300 hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push('/contracts/new')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+{stats.active + stats.trial}</span> active this month
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active + stats.trial}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="text-gray-600">{stats.trial} in trial</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-600 font-medium">+2</span> this month
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Last 30 days
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Signatures</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingSignatures}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <FileSignature className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs text-blue-600"
                  onClick={() => setSelectedTab('pending')}
                >
                  View pending
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border border-gray-200 shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by job title, worker name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <Button 
                  variant="outline" 
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSelectedTab('all');
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex shadow-sm">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger 
                value="all" 
                className="px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg"
              >
                All Contracts
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="px-6 data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab} className="mt-0">
            {filteredContracts.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by creating your first contract'}
                  </p>
                  <Button 
                    onClick={() => router.push('/contracts/new')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Contract
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <Card 
                    key={contract.id} 
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Left Section - Contract Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              {getStatusBadge(contract.status)}
                                {contract.is_trial && contract.status === 'trial' && contract.trial_end_date && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Trial ends {formatDistanceToNowSafe(contract.trial_end_date)}
                                </Badge>
                                )}
                              {contract.contract_type && (
                                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 capitalize">
                                  {contract.contract_type.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Link href={`/contracts/${contract.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                              {contract.job_title}
                            </h3>
                          </Link>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                                {contract.employer_details?.profile_photo_url ? (
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={contract.employer_details.profile_photo_url} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      {contract.employer_details?.full_name?.[0] || 'E'}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Building className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Employer</p>
                                <p className="font-medium text-gray-900">
                                  {contract.employer_details?.full_name || contract.employer_details?.company_name || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                                {contract.worker_details?.profile_photo_url ? (
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={contract.worker_details.profile_photo_url} />
                                    <AvatarFallback className="bg-purple-100 text-purple-600">
                                      {contract.worker_details?.full_name?.[0] || 'W'}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <User className="h-5 w-5 text-purple-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Worker</p>
                                <p className="font-medium text-gray-900">
                                  {contract.worker_details?.full_name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>Started {formatDate(contract.start_date)}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(contract.worker_salary_amount)}/month
                              </span>
                            </div>
                            {contract.work_location && (
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-1.5 text-gray-400" />
                                <span>{contract.work_location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="lg:w-64 flex flex-col gap-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-200 hover:bg-gray-50"
                              onClick={() => router.push(`/contracts/${contract.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            
                            {contract.contract_document_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-gray-200 hover:bg-gray-50"
                                onClick={() => handleDownloadDocument(contract.id)}
                              >
                                <Download className="h-4 w-4 mr-1.5" />
                                PDF
                              </Button>
                            )}
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="border-gray-200">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/contracts/${contract.id}/edit`)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadDocument(contract.id)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {contract.status === 'draft' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleSignContract(contract.id)}
                                    className="text-green-600"
                                  >
                                    <FileSignature className="h-4 w-4 mr-2" />
                                    Sign
                                  </DropdownMenuItem>
                                )}
                                {['active', 'trial'].includes(contract.status) && (
                                  <DropdownMenuItem 
                                    onClick={() => terminateContract(contract.id)}
                                    className="text-red-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Terminate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {contract.status === 'draft' && !contract.signed_by_employer && (
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                              onClick={() => handleSignContract(contract.id)}
                            >
                              <FileSignature className="h-4 w-4 mr-2" />
                              Sign Contract
                            </Button>
                          )}

                            {/* Trial Progress - FIXED undefined check */}
                            {contract.status === 'trial' && contract.is_active_trial && contract.days_until_trial_end !== undefined && (
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-500">Trial Progress</span>
                                <span className="text-xs font-bold text-blue-600">
                                    {getTrialDaysDisplay(contract.days_until_trial_end)}
                                </span>
                                </div>
                                <Progress 
                                value={getTrialProgressValue(contract.days_until_trial_end, contract.trial_duration_days || 14)} 
                                className="h-1.5 bg-gray-100"
                                />
                            </div>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}