// components/dashboard/EmployerJobManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobs, JobPosting } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Clock, TrendingUp,
  ChevronRight, Briefcase, Users, DollarSign,
  Calendar, MapPin, FileText, Loader2,
  RefreshCw, AlertCircle, BarChart, Download
} from 'lucide-react';
import JobPostingForm from '@/components/jobs/JobPostingForm';
import Link from 'next/link';

// FIXED: Import Star from lucide-react
import { Star } from 'lucide-react';

interface EmployerJobManagementProps {
  employerId?: string;
}

interface JobStats {
  total: number;
  active: number;
  draft: number;
  applications: number;
  closed: number;
  pending: number;
  featured: number;
}

export default function EmployerJobManagement({ employerId }: EmployerJobManagementProps) {
  const { user } = useAuth();
  const { 
    fetchEmployerJobs, 
    deleteJobPosting, 
    publishJobPosting, 
    closeJobPosting,
    loading 
  } = useJobs();
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadJobs();
  }, [employerId]);

  const loadJobs = async () => {
    try {
      const jobsData = await fetchEmployerJobs(employerId);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load job postings');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadJobs();
      toast.success('Jobs refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh jobs');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteJobPosting(jobId);
      if (success) {
        toast.success('Job deleted successfully');
        loadJobs();
      }
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      const updatedJob = await publishJobPosting(jobId);
      if (updatedJob) {
        toast.success('Job published successfully');
        loadJobs();
      }
    } catch (error) {
      toast.error('Failed to publish job');
    }
  };

  const handleCloseJob = async (jobId: string) => {
    try {
      const updatedJob = await closeJobPosting(jobId);
      if (updatedJob) {
        toast.success('Job closed successfully');
        loadJobs();
      }
    } catch (error) {
      toast.error('Failed to close job');
    }
  };

  const handleExportJobs = () => {
    const csvContent = [
      ['Title', 'Type', 'Status', 'Location', 'Salary Range', 'Applications', 'Views', 'Posted Date', 'Expiry Date'],
      ...filteredJobs.map(job => [
        job.title,
        job.job_type,
        job.is_active ? 'Active' : 'Inactive',
        job.location,
        `${formatUGX(job.salary_range_min)} - ${formatUGX(job.salary_range_max)}`,
        job.application_count || 0,
        job.views_count || 0,
        formatDate(job.created_at),
        job.expires_at ? formatDate(job.expires_at) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-postings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Jobs exported successfully');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills_required && job.skills_required.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && job.is_active) ||
      (statusFilter === 'inactive' && !job.is_active) ||
      (statusFilter === 'draft' && job.status === 'draft') ||
      (statusFilter === 'closed' && job.status === 'closed');

    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'active' && job.is_active) ||
      (activeTab === 'draft' && job.status === 'draft') ||
      (activeTab === 'closed' && job.status === 'closed') ||
      (activeTab === 'featured' && job.is_featured);

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  const stats: JobStats = {
    total: jobs.length,
    active: jobs.filter(j => j.is_active && j.status !== 'draft').length,
    draft: jobs.filter(j => j.status === 'draft').length,
    applications: jobs.reduce((sum, job) => sum + (job.application_count || 0), 0),
    closed: jobs.filter(j => j.status === 'closed').length,
    pending: jobs.filter(j => !j.is_active && j.status !== 'draft' && j.status !== 'closed').length,
    featured: jobs.filter(j => j.is_featured).length
  };

  const formatUGX = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (job: JobPosting) => {
    if (job.status === 'draft') {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>;
    }
    if (job.status === 'closed') {
      return <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Closed</Badge>;
    }
    if (job.is_active) {
      return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
  };

  const getTimeRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    if (diffDays <= 30) return `Expires in ${Math.floor(diffDays/7)} weeks`;
    return `Expires in ${Math.floor(diffDays/30)} months`;
  };

  if (showForm || editingJob) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => {
            setShowForm(false);
            setEditingJob(null);
          }}
          className="mb-4"
        >
          ← Back to Job Listings
        </Button>
        
        <JobPostingForm
          initialData={editingJob}
          isEditing={!!editingJob}
          onSuccess={() => {
            setShowForm(false);
            setEditingJob(null);
            loadJobs();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingJob(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Job Postings Management</h2>
          <p className="text-gray-600">Create, manage, and track your job listings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing || loading}
            className="border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
              <span className="text-xs text-gray-500">
                {stats.active} active • {stats.draft} draft
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.applications}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <Users className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
              <span className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12 this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.featured}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
                <Star className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
              <span className="text-xs text-yellow-600">
                High visibility
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">92%</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <BarChart className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
              <span className="text-xs text-gray-500">
                {stats.closed} closed • {stats.pending} pending
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search jobs by title, skills, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="py-3 text-base">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="py-3 text-base">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">All Jobs</span>
            <Badge variant="secondary" className="ml-2">{jobs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Active</span>
            <Badge variant="default" className="ml-2">{stats.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Drafts</span>
            <Badge variant="outline" className="ml-2">{stats.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Closed</span>
            <Badge variant="secondary" className="ml-2">{stats.closed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Featured</span>
            <Badge variant="outline" className="ml-2 bg-yellow-50">{stats.featured}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expiring" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Expiring</span>
          </TabsTrigger>
        </TabsList>

        {/* Job Listings */}
        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading job postings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Briefcase className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'No matching jobs found' 
                    : 'No job postings yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by posting your first job to find skilled workers'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Post Your First Job
                  </Button>
                  {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setActiveTab('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportJobs}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        {/* Left Section - Job Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(job)}
                              <Badge variant="outline" className="capitalize">
                                {job.job_type}
                              </Badge>
                              {job.is_featured && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {job.expires_at && (
                                <Badge variant="outline" className={`text-xs ${new Date(job.expires_at) < new Date() ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                  {getTimeRemaining(job.expires_at)}
                                </Badge>
                              )}
                            </div>
                            <div className="hidden lg:flex items-center gap-2">
                              {job.views_count !== undefined && (
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {job.views_count} views
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Link href={`/jobs/${job.id}`}>
                            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                              {job.title}
                            </h3>
                          </Link>
                          
                          <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1.5" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1.5" />
                              <span className="font-semibold">
                                {formatUGX(job.salary_range_min)} - {formatUGX(job.salary_range_max)}
                              </span>
                            </div>
                            {job.start_date && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                <span>Start: {formatDate(job.start_date)}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {job.description}
                          </p>
                          
                          {job.skills_required && job.skills_required.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {job.skills_required.slice(0, 5).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills_required.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>Posted: {formatDate(job.created_at)}</span>
                            {job.application_count !== undefined && (
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1.5" />
                                {job.application_count} applications
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Section - Actions */}
                        <div className="lg:w-48 flex flex-col gap-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = `/jobs/${job.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setEditingJob(job)}
                            >
                              <Edit className="h-4 w-4 mr-1.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            {job.is_active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleCloseJob(job.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Close
                              </Button>
                            ) : job.status === 'draft' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handlePublishJob(job.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Publish
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handlePublishJob(job.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Republish
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => window.location.href = `/jobs/${job.id}/applications`}
                            >
                              <Users className="h-4 w-4 mr-1.5" />
                              Apps
                            </Button>
                          </div>
                          
                          {job.expires_at && (
                            <div className="mt-2">
                              <div className={`text-xs px-2 py-1 rounded text-center ${new Date(job.expires_at) < new Date() ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                {getTimeRemaining(job.expires_at)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Boost Visibility</h4>
                <p className="text-sm text-gray-600">Feature your jobs to get 3x more applications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Engage Applicants</h4>
                <p className="text-sm text-gray-600">Review applications within 48 hours for best results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Set Expiry Dates</h4>
                <p className="text-sm text-gray-600">Auto-close jobs after 30 days to stay organized</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Performance</h4>
                <p className="text-sm text-gray-600">Monitor views and applications to optimize listings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
