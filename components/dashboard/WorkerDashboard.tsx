// components/dashboard/WorkerDashboard.tsx - COMPLETE FIXED VERSION WITH LIVE DATA
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, CheckCircle, Clock, AlertCircle, 
  DollarSign, FileText, Briefcase, UserCheck,
  TrendingUp, Shield, RefreshCw,
  ChevronRight, Plus, Star, Award,
  Calendar, MapPin, Phone, Mail
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import DocumentUploadModal from './DocumentUploadModal';
import { formatUGX, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function WorkerDashboard() {
  const { data, loading, error, refreshData, uploadDocument, user } = useDashboard();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    documentProgress: 0,
    verifiedDocuments: 0,
    pendingDocuments: 0,
    totalDocuments: 0,
    activeContracts: 0,
    trialContracts: 0,
    totalContracts: 0,
    totalEarnings: 0,
    completedPayments: 0,
    pendingPayments: 0,
    trustScore: 0,
    profileCompletion: 0,
  });

  // Fetch worker-specific data
  useEffect(() => {
    if (user?.id) {
      fetchWorkerData();
    }
  }, [user, data]);

  const fetchWorkerData = async () => {
    try {
      // Fetch worker profile
      const profileRes = await api.get('/users/workers/profile/me/');
      setWorkerProfile(profileRes.data);

      // Fetch documents
      const docsRes = await api.get('/documents/documents/');
      const docsData = docsRes.data?.results || docsRes.data || [];
      setDocuments(docsData);

      // Fetch contracts
      const contractsRes = await api.get('/contracts/contracts/');
      const contractsData = contractsRes.data?.results || contractsRes.data || [];
      setContracts(contractsData);

      // Fetch payments
      const paymentsRes = await api.get('/payments/worker-payments/');
      const paymentsData = paymentsRes.data?.results || paymentsRes.data || [];
      setPayments(paymentsData);

      // Fetch notifications
      const notifRes = await api.get('/notifications/notifications/unread/');
      const notifData = notifRes.data?.results || notifRes.data || [];
      setNotifications(notifData);

      // Calculate stats
      calculateStats(docsData, contractsData, paymentsData, profileRes.data);
    } catch (error) {
      console.error('Error fetching worker data:', error);
    }
  };

  const calculateStats = (docs: any[], contracts: any[], payments: any[], profile: any) => {
    const pending = docs.filter((d: any) => d.status === 'pending').length;
    const verified = docs.filter((d: any) => d.status === 'verified').length;
    const totalDocs = docs.length;
    
    const active = contracts.filter((c: any) => c.status === 'active').length;
    const trial = contracts.filter((c: any) => c.status === 'trial').length;
    
    const completed = payments.filter((p: any) => p.status === 'completed');
    const totalEarned = completed.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    // Calculate profile completion
    const profileItems = [
      { label: 'Basic Info', completed: user?.first_name && user?.last_name },
      { label: 'Phone Verified', completed: user?.phone_verified },
      { label: 'Profile Photo', completed: profile?.profile_photo_url },
      { label: 'Bio', completed: profile?.bio },
      { label: 'Skills', completed: profile?.skills?.length > 0 },
      { label: 'Documents', completed: verified >= 2 },
    ];
    
    const profileCompletion = Math.round(
      (profileItems.filter(item => item.completed).length / profileItems.length) * 100
    );

    setStats({
      documentProgress: totalDocs > 0 ? Math.round((verified / totalDocs) * 100) : 0,
      verifiedDocuments: verified,
      pendingDocuments: pending,
      totalDocuments: totalDocs,
      activeContracts: active,
      trialContracts: trial,
      totalContracts: contracts.length,
      totalEarnings: totalEarned,
      completedPayments: completed.length,
      pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
      trustScore: profile?.trust_score || 85,
      profileCompletion,
    });
  };

  const handleDocumentUpload = async (formData: FormData) => {
    setUploading(true);
    try {
      await uploadDocument(formData);
      setShowUploadModal(false);
      toast.success('Document uploaded successfully!');
      fetchWorkerData(); // Refresh data
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewAll = (type: string) => {
    window.location.href = `/${type}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching your latest data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4 sm:px-6">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Failed to load dashboard</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={refreshData} 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (!user || !workerProfile) {
    return (
      <div className="text-center py-16 px-4 sm:px-6">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Briefcase className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to WorkConnect!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">Get started by setting up your profile and uploading documents</p>
        <Button 
          onClick={() => window.location.href = '/profile/edit'} 
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Complete Your Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      {/* Refresh button */}
      <div className="flex justify-end mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            refreshData();
            fetchWorkerData();
          }} 
          disabled={loading}
          className="border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Profile Completion */}
      {stats.profileCompletion < 100 && (
        <Card className="mb-10 border-2 border-blue-100 shadow-sm mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl">
              <span>🎯 Complete Your Profile</span>
              <Badge variant={stats.profileCompletion >= 80 ? "default" : "secondary"} className="text-sm px-3 py-1">
                {stats.profileCompletion}% Complete
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              Complete your profile to get more job offers and increase your trust score
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 px-4 sm:px-6">
            <div className="space-y-6">
              <Progress value={stats.profileCompletion} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${user?.first_name && user?.last_name ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {user?.first_name && user?.last_name ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${user?.first_name && user?.last_name ? 'text-green-700' : 'text-gray-700'}`}>
                      Basic Info
                    </p>
                    <p className="text-xs text-gray-500">{user?.first_name && user?.last_name ? 'Completed' : 'Required'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${user?.phone_verified ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {user?.phone_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${user?.phone_verified ? 'text-green-700' : 'text-gray-700'}`}>
                      Phone Verified
                    </p>
                    <p className="text-xs text-gray-500">{user?.phone_verified ? 'Verified' : 'Required'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${workerProfile?.profile_photo_url ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {workerProfile?.profile_photo_url ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${workerProfile?.profile_photo_url ? 'text-green-700' : 'text-gray-700'}`}>
                      Profile Photo
                    </p>
                    <p className="text-xs text-gray-500">{workerProfile?.profile_photo_url ? 'Uploaded' : 'Required'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${workerProfile?.bio ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {workerProfile?.bio ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${workerProfile?.bio ? 'text-green-700' : 'text-gray-700'}`}>
                      Bio
                    </p>
                    <p className="text-xs text-gray-500">{workerProfile?.bio ? 'Added' : 'Required'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${workerProfile?.skills?.length > 0 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {workerProfile?.skills?.length > 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${workerProfile?.skills?.length > 0 ? 'text-green-700' : 'text-gray-700'}`}>
                      Skills
                    </p>
                    <p className="text-xs text-gray-500">{workerProfile?.skills?.length || 0} skills</p>
                  </div>
                  {!workerProfile?.skills?.length && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => window.location.href = '/profile?tab=skills'}
                    >
                      Add
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`mr-3 p-2 rounded-full ${stats.verifiedDocuments >= 2 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {stats.verifiedDocuments >= 2 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${stats.verifiedDocuments >= 2 ? 'text-green-700' : 'text-gray-700'}`}>
                      Documents
                    </p>
                    <p className="text-xs text-gray-500">{stats.verifiedDocuments} of 2 verified</p>
                  </div>
                  {stats.verifiedDocuments < 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowUploadModal(true)}
                    >
                      Upload
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          {stats.profileCompletion < 100 && (
            <CardFooter className="border-t bg-gray-50 pt-6 px-4 sm:px-6">
              <Button 
                className="w-full py-6 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                onClick={() => window.location.href = '/profile/edit'}
              >
                Complete Profile Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2">Verification Status</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.documentProgress}%
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.verifiedDocuments} of {stats.totalDocuments} verified
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex-shrink-0 ml-2">
                <Shield className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
              </div>
            </div>
            <Progress value={stats.documentProgress} className="mt-4 sm:mt-6 h-2" />
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2">Active Contracts</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeContracts}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.trialContracts} in trial period
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex-shrink-0 ml-2">
                <Briefcase className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatUGX(stats.totalEarnings)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  From {stats.completedPayments} payments
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex-shrink-0 ml-2">
                <DollarSign className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow mx-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-2">Trust Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.trustScore}/100</p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on reviews & reliability
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl flex-shrink-0 ml-2">
                <TrendingUp className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="documents" className="mb-8 sm:mb-12">
        <div className="mb-6">
          <TabsList className="inline-flex h-12 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 rounded-md font-medium text-sm"
            >
              📄 Documents ({stats.totalDocuments})
            </TabsTrigger>
            <TabsTrigger 
              value="contracts" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 rounded-md font-medium text-sm"
            >
              📝 Contracts ({stats.totalContracts})
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 rounded-md font-medium text-sm"
            >
              💰 Payments ({payments.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-0">
          <Card className="border border-gray-200 shadow-sm mx-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl sm:text-2xl mb-2">Document Verification</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Upload and verify your documents to get more job opportunities
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowUploadModal(true)} 
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-4 sm:px-6">
              {documents.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="mx-auto w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <FileText className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">No documents uploaded yet</h4>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Upload your ID, certificates, and other documents to increase your trust score and job opportunities
                  </p>
                  <Button 
                    onClick={() => setShowUploadModal(true)} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Upload Your First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {documents.slice(0, 5).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 sm:p-5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                          doc.status === 'verified' ? 'bg-green-100 border border-green-200' :
                          doc.status === 'pending' ? 'bg-yellow-100 border border-yellow-200' :
                          'bg-red-100 border border-red-200'
                        }`}>
                          {doc.status === 'verified' ? (
                            <CheckCircle className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                          ) : doc.status === 'pending' ? (
                            <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-5 sm:h-6 w-5 sm:w-6 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{doc.document_type || 'Document'}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                            {doc.uploaded_at ? `Uploaded: ${formatDate(doc.uploaded_at)}` : 'No upload date'}
                          </p>
                          {doc.verification_notes && (
                            <p className="text-xs text-gray-400 mt-1 truncate">Note: {doc.verification_notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
                        <Badge variant={
                          doc.status === 'verified' ? 'default' :
                          doc.status === 'pending' ? 'secondary' :
                          'destructive'
                        } className="px-2 sm:px-3 py-1 font-medium capitalize text-xs sm:text-sm">
                          {doc.status || 'unknown'}
                        </Badge>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {documents.length > 5 && (
              <CardFooter className="border-t border-gray-200 p-4 sm:p-6">
                <Button 
                  variant="outline" 
                  className="w-full py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => handleViewAll('documents')}
                >
                  View All Documents ({documents.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="mt-0">
          <Card className="border border-gray-200 shadow-sm mx-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div>
                <CardTitle className="text-xl sm:text-2xl mb-2">My Contracts</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Active and past work contracts
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-4 sm:px-6">
              {contracts.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="mx-auto w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Briefcase className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">No contracts yet</h4>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Complete your profile and document verification to start receiving job offers
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/jobs'} 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Browse Available Jobs
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {contracts.slice(0, 5).map((contract: any) => (
                    <div key={contract.id} className="p-4 sm:p-5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{contract.job_title || 'Untitled Contract'}</h3>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                              {contract.employer?.company_name || contract.employer?.full_name || 'Employer'}
                            </Badge>
                            {contract.work_location && (
                              <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                                {contract.work_location}
                              </Badge>
                            )}
                            <Badge variant={
                              contract.status === 'active' ? 'default' :
                              contract.status === 'trial' ? 'secondary' :
                              'outline'
                            } className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                              {contract.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatUGX(contract.worker_salary_amount || 0)}/month
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-xs sm:text-sm">
                              Started: {contract.start_date ? formatDate(contract.start_date) : 'No start date'}
                            </span>
                          </div>
                        </div>
                        <div className="lg:text-right flex flex-col gap-2">
                          {contract.trial_end_date && contract.status === 'trial' && (
                            <div className="mb-1">
                              <p className="text-xs sm:text-sm font-medium text-yellow-700">Trial ends:</p>
                              <p className="text-xs sm:text-sm font-semibold text-yellow-600">
                                {formatDate(contract.trial_end_date)}
                              </p>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full lg:w-auto"
                            onClick={() => window.location.href = `/contracts/${contract.id}`}
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {contracts.length > 5 && (
              <CardFooter className="border-t border-gray-200 p-4 sm:p-6">
                <Button 
                  variant="outline" 
                  className="w-full py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => handleViewAll('contracts')}
                >
                  View All Contracts ({contracts.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-0">
          <Card className="border border-gray-200 shadow-sm mx-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <div>
                <CardTitle className="text-xl sm:text-2xl mb-2">Payment History</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your salary payments and transaction history
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-4 sm:px-6">
              {payments.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="mx-auto w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <DollarSign className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">No payments yet</h4>
                  <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                    Payments will appear here after completing your first contract
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {payments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 sm:p-5 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${
                          payment.status === 'completed' ? 'bg-green-100' :
                          payment.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <DollarSign className={`h-5 sm:h-6 w-5 sm:w-6 ${
                            payment.status === 'completed' ? 'text-green-600' :
                            payment.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {formatUGX(payment.amount || 0)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                            {payment.scheduled_date ? formatDate(payment.scheduled_date) : 'No date'}
                          </p>
                          {payment.contract?.job_title && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {payment.contract.job_title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'pending' ? 'secondary' :
                          payment.status === 'failed' ? 'destructive' : 'outline'
                        } className="px-2 sm:px-3 py-1 font-medium text-xs sm:text-sm">
                          {payment.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {payments.length > 5 && (
              <CardFooter className="border-t border-gray-200 p-4 sm:p-6">
                <Button 
                  variant="outline" 
                  className="w-full py-2 sm:py-3 text-sm sm:text-base"
                  onClick={() => handleViewAll('payments')}
                >
                  View All Payments ({payments.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 shadow-sm h-full mx-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">🚀 Quick Actions</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Everything you need to manage your work profile
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 sm:py-4 px-4 sm:px-6 justify-start border-gray-300 hover:bg-blue-50 hover:border-blue-200 transition-all"
                  onClick={() => window.location.href = '/profile/edit'}
                >
                  <div className="mr-3 sm:mr-4 p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Complete Profile</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Fill missing information</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 sm:py-4 px-4 sm:px-6 justify-start border-gray-300 hover:bg-green-50 hover:border-green-200 transition-all"
                  onClick={() => window.location.href = '/jobs'}
                >
                  <div className="mr-3 sm:mr-4 p-2 bg-green-100 rounded-lg">
                    <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Browse Jobs</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Find new opportunities</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 sm:py-4 px-4 sm:px-6 justify-start border-gray-300 hover:bg-purple-50 hover:border-purple-200 transition-all" 
                  onClick={() => setShowUploadModal(true)}
                >
                  <div className="mr-3 sm:mr-4 p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">Update Documents</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Add new documents</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 sm:py-4 px-4 sm:px-6 justify-start border-gray-300 hover:bg-yellow-50 hover:border-yellow-200 transition-all" 
                  onClick={() => handleViewAll('payments')}
                >
                  <div className="mr-3 sm:mr-4 p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">View Earnings</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Check payment history</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications - Takes 1 column */}
        <div>
          <Card className="border border-gray-200 shadow-sm h-full mx-0">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">📢 Recent Notifications</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Latest updates from the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">No notifications yet</p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">Updates will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {notifications.slice(0, 4).map((notification: any) => (
                    <div key={notification.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                         onClick={() => window.location.href = notification.action_url || '#'}>
                      <div className={`mr-3 mt-1 p-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-100' : 
                        notification.type === 'warning' ? 'bg-yellow-100' : 
                        'bg-blue-100'
                      }`}>
                        {notification.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                        ) : notification.type === 'warning' ? (
                          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                        ) : (
                          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{notification.title || 'Notification'}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{notification.message || ''}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.created_at ? formatDate(notification.created_at) : 'Recently'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {notifications.length > 4 && (
              <CardFooter className="border-t border-gray-200 p-4 sm:p-6">
                <Button 
                  variant="ghost" 
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm sm:text-base"
                  onClick={() => handleViewAll('notifications')}
                >
                  View All Notifications
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleDocumentUpload}
        uploading={uploading}
      />
    </div>
  );
}