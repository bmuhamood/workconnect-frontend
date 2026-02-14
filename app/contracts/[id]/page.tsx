// app/contracts/[id]/page.tsx - FIXED TypeScript errors
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Download, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, Calendar, DollarSign, User, Building,
  MapPin, Briefcase, CreditCard, Shield, Award, Users,
  FileSignature, Printer, Mail, Share2, MoreVertical,
  ChevronRight, Loader2, Home, Edit, Trash2, Ban,
  AlertTriangle, CheckCheck, Send, MessageSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useContracts } from '@/hooks/useContracts';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ContractDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { 
    fetchContractById, 
    signContract,
    generateContractDocument,
    getContractDocument,
    terminateContract,
    submitTrialFeedback,
    requestReplacement,
    loading 
  } = useContracts();
  
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showReplacementDialog, setShowReplacementDialog] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', willContinue: true });
  const [replacementReason, setReplacementReason] = useState('');

  // 🔴 FIXED: Safely get contract ID from params with type checking
  const contractId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    // 🔴 FIXED: Validate ID before fetching
    if (!contractId || contractId === 'undefined' || contractId === 'null') {
      console.error('Invalid contract ID:', contractId);
      toast.error('Invalid contract ID');
      router.push('/contracts');
      return;
    }
    
    loadContract();
  }, [contractId, router]);

  const loadContract = async () => {
    setIsLoading(true);
    try {
      if (!contractId) {
        throw new Error('Contract ID is required');
      }
      const data = await fetchContractById(contractId);
      setContract(data);
    } catch (error) {
      console.error('Error loading contract:', error);
      toast.error('Failed to load contract details');
      router.push('/contracts');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔴 FIXED: All functions now use contractId from state instead of params.id
  const handleSignContract = async () => {
    if (!contractId) return;
    try {
      await signContract(contractId);
      toast.success('Contract signed successfully!');
      loadContract();
    } catch (error) {
      toast.error('Failed to sign contract');
    }
  };

  const handleGenerateDocument = async () => {
    if (!contractId) return;
    try {
      const url = await generateContractDocument(contractId);
      toast.success('Contract document generated');
      loadContract();
      if (url) window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to generate document');
    }
  };

  const handleDownloadDocument = async () => {
    if (!contractId) return;
    try {
      const url = await getContractDocument(contractId);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast.error('No document available');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      if (error.response?.status === 404) {
        toast.error('Document not found');
      } else {
        toast.error('Failed to download document');
      }
    }
  };

  const handleTerminateContract = async () => {
    if (!contractId) return;
    if (!terminationReason.trim()) {
      toast.error('Please provide a reason for termination');
      return;
    }
    
    try {
      await terminateContract(contractId, terminationReason);
      toast.success('Contract terminated successfully');
      setShowTerminateDialog(false);
      loadContract();
    } catch (error) {
      toast.error('Failed to terminate contract');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!contractId) return;
    try {
      await submitTrialFeedback(contractId, {
        feedback_text: feedback.comment,
        performance_rating: feedback.rating,
        will_continue: feedback.willContinue
      });
      toast.success('Feedback submitted successfully');
      setShowFeedbackDialog(false);
      loadContract();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleRequestReplacement = async () => {
    if (!contractId) return;
    if (!replacementReason.trim()) {
      toast.error('Please provide a reason for replacement');
      return;
    }
    
    try {
      await requestReplacement(contractId, replacementReason);
      toast.success('Replacement request submitted');
      setShowReplacementDialog(false);
    } catch (error) {
      toast.error('Failed to request replacement');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText },
      trial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
      active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      completed: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Award },
      terminated: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      cancelled: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Ban }
    };
    
    const { color, icon: Icon } = config[status as keyof typeof config] || config.draft;
    
    return (
      <Badge variant="outline" className={`${color} border px-3 py-1.5 text-sm font-medium`}>
        <Icon className="h-4 w-4 mr-1.5" />
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading contract details...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Contract Not Found</CardTitle>
            <CardDescription>
              The contract you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/contracts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contracts
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isEmployer = user?.role === 'employer' && contract.employer_details?.user_id === user?.id;
  const isWorker = user?.role === 'worker' && contract.worker_details?.user_id === user?.id;
  const canSign = contract.status === 'draft' && 
    ((isEmployer && !contract.signed_by_employer) || (isWorker && !contract.signed_by_worker));
  const canProvideFeedback = contract.status === 'trial' && isEmployer && !contract.trial_feedback;
  const canRequestReplacement = contract.can_request_replacement && isEmployer;
  const canTerminate = ['active', 'trial'].includes(contract.status) && (isEmployer || isWorker);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/contracts"
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-medium">Back to Contracts</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Contract Details</h1>
                  <p className="text-sm text-gray-500">ID: {contract.id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="border-gray-300"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Contract Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {contract.contract_document_url && (
                    <DropdownMenuItem onClick={handleDownloadDocument}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                  )}
                  {contract.status === 'draft' && !contract.contract_document_url && (
                    <DropdownMenuItem onClick={handleGenerateDocument}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Document
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {contract.status === 'draft' && (
                    <DropdownMenuItem onClick={() => router.push(`/contracts/${contract.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </DropdownMenuItem>
                  )}
                  {canTerminate && (
                    <DropdownMenuItem 
                      onClick={() => setShowTerminateDialog(true)}
                      className="text-red-600"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Terminate Contract
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Status Banner */}
            <Card className="mb-6 border-l-4 border-l-blue-600">
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {getStatusBadge(contract.status)}
                    <span className="text-sm text-gray-500">
                    Created {formatDate(contract.created_at)}
                    </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {canSign && (
                    <Button 
                        onClick={handleSignContract}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <FileSignature className="h-4 w-4 mr-2" />
                        Sign Contract
                    </Button>
                    )}
                    
                    {canProvideFeedback && (
                    <Button 
                        onClick={() => setShowFeedbackDialog(true)}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Provide Feedback
                    </Button>
                    )}
                    
                    {canRequestReplacement && (
                    <Button 
                        onClick={() => setShowReplacementDialog(true)}
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        Request Replacement
                    </Button>
                    )}
                </div>
                </div>
            </CardContent>
            </Card>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
                {/* Contract Overview */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{contract.job_title}</CardTitle>
                    <CardDescription className="text-base">
                    {contract.contract_type.replace('_', ' ').toUpperCase()} • {contract.payment_frequency} payment
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                        {contract.job_description}
                    </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Work Details</h4>
                        <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                            <span>{contract.work_location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-3 text-gray-400" />
                            <span>{contract.work_hours_per_week} hours/week</span>
                        </div>
                        {contract.work_schedule && Object.keys(contract.work_schedule).length > 0 && (
                            <div className="flex items-start text-sm">
                            <Briefcase className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                            <div>
                                <span className="font-medium">Schedule:</span>
                                <ul className="mt-1 space-y-1">
                                {Object.entries(contract.work_schedule).map(([day, hours]) => (
                                    <li key={day} className="text-gray-600">
                                    {day.charAt(0).toUpperCase() + day.slice(1)}: {hours as string}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            </div>
                        )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-3">Financial Terms</h4>
                        <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Worker Salary:</span>
                            <span className="font-semibold text-gray-900">
                            {formatCurrency(contract.worker_salary_amount)}/month
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Service Fee:</span>
                            <span className="font-semibold text-gray-900">
                            {formatCurrency(contract.service_fee_amount)}/month
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                            <span className="font-medium text-gray-700">Total Monthly Cost:</span>
                            <span className="font-bold text-gray-900">
                            {formatCurrency(contract.total_monthly_cost)}
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>

                    <Separator />

                    <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Contract Timeline</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(contract.start_date)}</p>
                        </div>
                        {contract.trial_end_date && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 mb-1">Trial End Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(contract.trial_end_date)}</p>
                            {contract.days_until_trial_end !== undefined && (
                            <p className="text-xs text-blue-600 mt-1">
                                {contract.days_until_trial_end} days remaining
                            </p>
                            )}
                        </div>
                        )}
                        {contract.end_date && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">End Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(contract.end_date)}</p>
                        </div>
                        )}
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Tabs for additional info */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Trial Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contract.is_trial ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">
                                Trial ends {formatDate(contract.trial_end_date)}
                                </p>
                                <p className="text-sm text-gray-500">
                                {contract.trial_duration_days} days trial period
                                </p>
                            </div>
                            {contract.days_until_trial_end !== undefined && (
                                <Badge variant={contract.days_until_trial_end > 3 ? 'default' : 'destructive'}>
                                {contract.days_until_trial_end} days left
                                </Badge>
                            )}
                            </div>
                            {contract.trial_feedback && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-2">Employer Feedback</p>
                                <p className="text-sm text-gray-700">{contract.trial_feedback}</p>
                            </div>
                            )}
                        </div>
                        ) : (
                        <p className="text-gray-500">No trial period for this contract</p>
                        )}
                    </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Contract Documents</CardTitle>
                        {contract.status === 'draft' && !contract.contract_document_url && (
                        <Button size="sm" onClick={handleGenerateDocument}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate
                        </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {contract.contract_document_url ? (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900">Contract Agreement</p>
                                <p className="text-sm text-gray-500">
                                Signed by {contract.signed_by_employer ? 'Employer' : ''} 
                                {contract.signed_by_employer && contract.signed_by_worker ? ' & ' : ''}
                                {contract.signed_by_worker ? 'Worker' : ''}
                                </p>
                            </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadDocument}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                            </Button>
                        </div>
                        ) : (
                        <p className="text-gray-500 text-center py-8">
                            No document has been generated for this contract yet.
                        </p>
                        )}
                    </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity">
                    <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contract Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {contract.created_at && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Contract Created</p>
                                <p className="text-sm text-gray-500">{formatDate(contract.created_at)}</p>
                            </div>
                            </div>
                        )}
                        {contract.signed_by_employer && contract.employer_signature_date && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-green-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Signed by Employer</p>
                                <p className="text-sm text-gray-500">{formatDate(contract.employer_signature_date)}</p>
                            </div>
                            </div>
                        )}
                        {contract.signed_by_worker && contract.worker_signature_date && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-green-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Signed by Worker</p>
                                <p className="text-sm text-gray-500">{formatDate(contract.worker_signature_date)}</p>
                            </div>
                            </div>
                        )}
                        {contract.activated_at && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Contract Activated</p>
                                <p className="text-sm text-gray-500">{formatDate(contract.activated_at)}</p>
                            </div>
                            </div>
                        )}
                        {contract.completed_at && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-purple-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Contract Completed</p>
                                <p className="text-sm text-gray-500">{formatDate(contract.completed_at)}</p>
                            </div>
                            </div>
                        )}
                        {contract.termination_reason && (
                            <div className="flex items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-red-600 mr-3"></div>
                            <div>
                                <p className="font-medium text-gray-900">Contract Terminated</p>
                                <p className="text-sm text-gray-700 mt-1">{contract.termination_reason}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                {formatDate(contract.updated_at)}
                                </p>
                            </div>
                            </div>
                        )}
                        </div>
                    </CardContent>
                    </Card>
                </TabsContent>
                </Tabs>
            </div>

            {/* Right Column - 1/3 */}
            <div className="space-y-6">
                {/* Employer Card */}
                <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Employer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-blue-100">
                        <AvatarImage src={contract.employer_details?.profile_photo_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                        {contract.employer_details?.full_name?.[0] || 'E'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                        {contract.employer_details?.full_name}
                        </h3>
                        {contract.employer_details?.company_name && (
                        <p className="text-sm text-gray-600">{contract.employer_details.company_name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                        Member since {formatDate(contract.employer_details?.created_at)}
                        </p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                {/* Worker Card */}
                <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Worker
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-100">
                        <AvatarImage src={contract.worker_details?.profile_photo_url} />
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                        {contract.worker_details?.full_name?.[0] || 'W'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                        {contract.worker_details?.full_name}
                        </h3>
                        {contract.worker_details?.profession && (
                        <p className="text-sm text-gray-600">{contract.worker_details.profession}</p>
                        )}
                        <div className="flex items-center mt-1">
                        <Shield className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-gray-600">
                            {contract.worker_details?.verification_status === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                        </div>
                    </div>
                    </div>

                    {contract.worker_details && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-medium text-gray-900">
                            {contract.worker_details.experience_years || 0} years
                        </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Hourly Rate</span>
                        <span className="font-medium text-gray-900">
                            {formatCurrency(contract.worker_details.hourly_rate || 0)}/hr
                        </span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Rating</span>
                        <span className="font-medium text-gray-900">
                            {contract.worker_details.rating_average || 0} ★
                        </span>
                        </div>
                    </div>
                    )}
                </CardContent>
                <CardFooter className="border-t border-gray-200 pt-4">
                    <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/workers/${contract.worker_details?.id}`)}
                    >
                    View Worker Profile
                    <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </CardFooter>
                </Card>

                {/* Signature Status */}
                <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                    <FileSignature className="h-5 w-5 mr-2 text-green-600" />
                    Signature Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Employer</span>
                    {contract.signed_by_employer ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Signed
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                        </Badge>
                    )}
                    </div>
                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Worker</span>
                    {contract.signed_by_worker ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Signed
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                        </Badge>
                    )}
                    </div>
                    {contract.signed_by_employer && contract.signed_by_worker && contract.status === 'draft' && (
                    <p className="text-xs text-green-600 mt-2">
                        Both parties have signed. Contract will activate on {formatDate(contract.start_date)}.
                    </p>
                    )}
                </CardContent>
                </Card>
            </div>
            </div>
        </div>

        {/* Terminate Contract Dialog */}
        <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Terminate Contract
                </DialogTitle>
                <DialogDescription>
                Are you sure you want to terminate this contract? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="reason">Reason for termination</Label>
                <Textarea
                    id="reason"
                    placeholder="Please provide a reason for terminating this contract..."
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value)}
                    rows={4}
                />
                </div>
            </div>
            <DialogFooter className="sm:justify-end">
                <Button
                type="button"
                variant="outline"
                onClick={() => setShowTerminateDialog(false)}
                >
                Cancel
                </Button>
                <Button
                type="button"
                variant="destructive"
                onClick={handleTerminateContract}
                disabled={!terminationReason.trim()}
                >
                <Ban className="h-4 w-4 mr-2" />
                Terminate Contract
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Trial Feedback Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center text-blue-600">
                <MessageSquare className="h-5 w-5 mr-2" />
                Trial Feedback
                </DialogTitle>
                <DialogDescription>
                Provide feedback on the worker's performance during the trial period.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="rating">Performance Rating</Label>
                <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                        key={rating}
                        type="button"
                        variant={feedback.rating === rating ? "default" : "outline"}
                        className={`w-12 h-12 ${feedback.rating === rating ? 'bg-blue-600' : ''}`}
                        onClick={() => setFeedback({ ...feedback, rating })}
                    >
                        {rating}★
                    </Button>
                    ))}
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="comment">Comments</Label>
                <Textarea
                    id="comment"
                    placeholder="Share your experience working with this worker..."
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    rows={4}
                />
                </div>
                <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="willContinue"
                    checked={feedback.willContinue}
                    onChange={(e) => setFeedback({ ...feedback, willContinue: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="willContinue" className="text-sm text-gray-700">
                    I want to continue working with this worker after the trial
                </Label>
                </div>
            </div>
            <DialogFooter className="sm:justify-end">
                <Button
                type="button"
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
                >
                Cancel
                </Button>
                <Button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={!feedback.comment.trim()}
                >
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Replacement Request Dialog */}
        <Dialog open={showReplacementDialog} onOpenChange={setShowReplacementDialog}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center text-orange-600">
                <Users className="h-5 w-5 mr-2" />
                Request Replacement
                </DialogTitle>
                <DialogDescription>
                Request a replacement worker for this contract during the trial period.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="replacementReason">Reason for replacement</Label>
                <Textarea
                    id="replacementReason"
                    placeholder="Please explain why you need a replacement worker..."
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    rows={4}
                />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    This is a free replacement during the trial period. Our system will find suitable matches for you.
                </p>
                </div>
            </div>
            <DialogFooter className="sm:justify-end">
                <Button
                type="button"
                variant="outline"
                onClick={() => setShowReplacementDialog(false)}
                >
                Cancel
                </Button>
                <Button
                type="button"
                onClick={handleRequestReplacement}
                disabled={!replacementReason.trim()}
                className="bg-orange-600 hover:bg-orange-700"
                >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </div>
    );
    }