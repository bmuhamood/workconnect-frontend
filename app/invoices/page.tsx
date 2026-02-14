// app/invoices/page.tsx - COMPLETE FIXED WITH PROPER STATE HANDLING
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Filter, Search, Calendar, 
  DollarSign, ChevronRight, Loader2, Home,
  FileText, CreditCard, TrendingUp, Users,
  Building, Printer, Mail, Share2, MoreVertical,
  Receipt, Wallet, DownloadCloud, FileDown, RefreshCw, Plus,
  User, BarChart
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';

// Define the Invoice type based on your backend EmployerInvoice model
interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  worker_salary_amount: number;
  service_fee_amount: number;
  additional_fees: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  invoice_pdf_url: string | null;
  created_at: string;
  updated_at: string;
  
  // Related objects (from serializers)
  employer?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    company_name?: string;
  };
  contract?: {
    id: string;
    job_title: string;
    worker?: {
      id: string;
      full_name: string;
    };
  };
  payroll_cycle?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    pendingAmount: 0
  });

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching invoices from /payments/employer-invoices/...');
      const response = await api.get('/payments/employer-invoices/');
      console.log('Invoices response:', response.data);
      
      // Handle paginated response
      let invoicesData: Invoice[] = [];
      if (response.data?.results) {
        invoicesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        invoicesData = response.data;
      }
      
      setInvoices(invoicesData);
      calculateStats(invoicesData);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      
      if (err.response?.status === 404) {
        setError('NOT_IMPLEMENTED');
      } else {
        setError(err.message || 'Failed to load invoices');
        toast.error('Failed to load invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const calculateStats = (invoiceList: Invoice[]) => {
    const total = invoiceList.length;
    const paid = invoiceList.filter(i => i.status === 'paid').length;
    const pending = invoiceList.filter(i => i.status === 'pending').length;
    const overdue = invoiceList.filter(i => i.status === 'overdue').length;
    const totalAmount = invoiceList.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const pendingAmount = invoiceList
      .filter(i => ['pending', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + (i.total_amount || 0), 0);

    setStats({ total, paid, pending, overdue, totalAmount, pendingAmount });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = searchTerm === '' || 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contract?.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contract?.worker?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.employer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesTab = selectedTab === 'all' || invoice.status === selectedTab;

    return matchesSearch && matchesStatus && matchesTab;
  });

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const response = await api.post(`/payments/employer-invoices/${invoiceId}/pay/`);
      toast.success('Payment initiated successfully!');
      fetchInvoices();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to process payment');
    }
  };

  const checkPaymentStatus = async (invoiceId: string) => {
    try {
      const response = await api.get(`/payments/employer-invoices/${invoiceId}/status/`);
      return response.data;
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle }
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading invoices...</h3>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your billing history</p>
        </div>
      </div>
    );
  }

  // 🔴 FIXED: Show "Coming Soon" ONLY for actual 404/not implemented errors
  if (error === 'NOT_IMPLEMENTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium ml-2">Back to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Invoices Coming Soon</CardTitle>
              <CardDescription>
                The invoices feature is currently under development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                We're working hard to bring you a comprehensive invoicing system. 
                Soon you'll be able to view, download, and pay all your invoices here.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">What to expect:</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>✓ Monthly invoices for active contracts</li>
                  <li>✓ Split view: Worker salary + Service fee</li>
                  <li>✓ Multiple payment methods (MTN, Airtel, Card)</li>
                  <li>✓ Download PDF invoices</li>
                  <li>✓ Payment status tracking</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/contracts')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                View Contracts
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Show empty state when API works but no invoices exist
  if (!loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium ml-2">Back to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-10 w-10 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">No Invoices Yet</CardTitle>
              <CardDescription>
                You don't have any invoices at the moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Invoices will appear here once you have active contracts with workers.
                Monthly invoices are generated on the 15th of each month.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-purple-900 mb-2">Current Status:</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>✓ API endpoint is working correctly</li>
                  <li>✓ Authentication is successful</li>
                  <li>⏳ No invoices generated yet for this month</li>
                  <li>💡 Invoices are generated on the 15th of each month</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/contracts')}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                View Contracts
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Show error state for other errors
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium ml-2">Back to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center border-red-200">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">Error Loading Invoices</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Return to Dashboard
              </Button>
              <Button 
                onClick={() => {
                  setError(null);
                  fetchInvoices();
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Show the actual invoices
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header with Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
              >
                <div className="p-2 rounded-lg hover:bg-purple-50 transition-colors">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="font-medium ml-1">Back to Dashboard</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Invoices & Billing</h1>
                  <p className="text-sm text-gray-500">Manage your payments and download receipts</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Billing Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-purple-50/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Billed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium text-gray-900">{stats.total}</span> total invoices
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-green-50/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Paid</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.totalAmount - stats.pendingAmount)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium text-gray-900">{stats.paid}</span> invoices paid
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-yellow-50/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.pendingAmount)}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium text-gray-900">{stats.pending}</span> invoices pending
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-red-50/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.overdue}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-xs text-red-600"
                  onClick={() => setSelectedTab('overdue')}
                >
                  View overdue
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
                  placeholder="Search by invoice number, contract, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-6 text-base border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
              <div className="flex gap-3">
                <div className="w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <Button 
                  variant="outline" 
                  className="h-12 px-6 border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSelectedTab('all');
                    fetchInvoices();
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
                className="px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
              >
                All Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="px-6 data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="paid" 
                className="px-6 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"
              >
                Paid
              </TabsTrigger>
              <TabsTrigger 
                value="overdue" 
                className="px-6 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
              >
                Overdue
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab} className="mt-0">
            {filteredInvoices.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Receipt className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'No invoices match your current filters'}
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSelectedTab('all');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card 
                    key={invoice.id} 
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Left Section - Invoice Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getStatusBadge(invoice.status)}
                              <span className="text-sm font-mono text-gray-500">
                                #{invoice.invoice_number}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                <Building className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">From</p>
                                <p className="font-medium text-gray-900">
                                  {invoice.employer?.full_name || 'WorkConnect'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">To</p>
                                <p className="font-medium text-gray-900">
                                  {invoice.contract?.worker?.full_name || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>Issued: {formatDate(invoice.created_at)}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                Due: {formatDate(invoice.due_date)}
                                {invoice.status === 'overdue' && ' (Overdue)'}
                              </span>
                            </div>
                            {invoice.contract?.job_title && (
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
                                <span>{invoice.contract.job_title}</span>
                              </div>
                            )}
                          </div>

                          {/* Amount breakdown */}
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Worker Salary:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(invoice.worker_salary_amount)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Service Fee:</span>
                              <span className="font-medium text-purple-600">
                                {formatCurrency(invoice.service_fee_amount)}
                              </span>
                            </div>
                            {invoice.additional_fees > 0 && (
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Additional Fees:</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(invoice.additional_fees)}
                                </span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between text-sm font-semibold">
                              <span className="text-gray-900">Total:</span>
                              <span className="text-gray-900">
                                {formatCurrency(invoice.total_amount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="lg:w-64 flex flex-col gap-3">
                          {invoice.status === 'pending' && (
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              onClick={() => handlePayInvoice(invoice.id)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          )}

                          {invoice.invoice_pdf_url && (
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full border-gray-200"
                              onClick={() => {
                                if (invoice.invoice_pdf_url) {
                                  window.open(invoice.invoice_pdf_url, '_blank');
                                } else {
                                  toast.error('Invoice PDF not available');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          )}

                          {invoice.status === 'paid' && invoice.paid_date && (
                            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-green-700">
                                  Paid on {formatDate(invoice.paid_date)}
                                </span>
                              </div>
                              {invoice.transaction_reference && (
                                <p className="text-xs text-green-600 mt-1">
                                  Ref: {invoice.transaction_reference}
                                </p>
                              )}
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