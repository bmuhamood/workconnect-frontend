'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, Users, Filter, 
  Grid, List, Star, Bookmark, TrendingUp, ChevronRight, Building,
  Calendar, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useJobs, JobPosting } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Remote',
];

const EXPERIENCE_LEVELS = [
  'Entry',
  'Mid',
  'Senior',
  'Executive',
];

const SALARY_RANGES = [
  { label: 'Any salary', min: 0, max: 0 },
  { label: 'Up to UGX 500k', min: 0, max: 500000 },
  { label: 'UGX 500k - 1M', min: 500000, max: 1000000 },
  { label: 'UGX 1M - 2M', min: 1000000, max: 2000000 },
  { label: 'UGX 2M - 5M', min: 2000000, max: 5000000 },
  { label: 'Over UGX 5M', min: 5000000, max: 0 },
];

const SKILLS = [
  'Carpentry', 'Plumbing', 'Electrical', 'Masonry', 'Painting',
  'Welding', 'Driving', 'Cooking', 'Cleaning', 'Gardening',
  'Baby Sitting', 'Security', 'Reception', 'Administration',
  'Accounting', 'Sales', 'Marketing', 'IT Support', 'Web Development',
];

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { jobs, loading, error, totalJobs, totalPages, fetchJobs } = useJobs();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    job_type: 'all',
    experience_level: 'all',
    min_salary: 0,
    max_salary: 0,
    skills: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]); // Changed to string[] for UUID
  const [savedJobs, setSavedJobs] = useState<string[]>([]); // Changed to string[] for UUID

  // Load applied jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appliedJobs');
    if (saved) {
      setAppliedJobs(JSON.parse(saved));
    }
    
    const savedJobsData = localStorage.getItem('savedJobs');
    if (savedJobsData) {
      setSavedJobs(JSON.parse(savedJobsData));
    }
  }, []);

  // Apply filters when they change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchJobs({
        ...filters,
        search: search || undefined,
        is_active: true,
      }, page);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, filters, page, fetchJobs]);

  const handleApplyFilter = () => {
    fetchJobs({
      ...filters,
      search: search || undefined,
      is_active: true,
    }, 1);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      location: '',
      job_type: 'all',
      experience_level: 'all',
      min_salary: 0,
      max_salary: 0,
      skills: [],
    });
    setPage(1);
  };

  const handleApplyJob = (jobId: string) => { // Changed parameter type to string
    if (!user) {
      toast.error('Please sign in to apply for jobs');
      router.push('/login');
      return;
    }

    const newAppliedJobs = [...appliedJobs, jobId];
    setAppliedJobs(newAppliedJobs);
    localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
    toast.success('Application submitted successfully!');
  };

  const handleSaveJob = (jobId: string) => { // Changed parameter type to string
    if (!user) {
      toast.error('Please sign in to save jobs');
      router.push('/login');
      return;
    }

    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    
    if (savedJobs.includes(jobId)) {
      toast.success('Job removed from saved');
    } else {
      toast.success('Job saved successfully!');
    }
  };

  const handleViewJob = (jobId: string) => { // Changed parameter type to string
    router.push(`/jobs/${jobId}`);
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

  const getSalaryRange = (job: JobPosting) => {
    if (job.salary_range_min && job.salary_range_max) {
      return `${formatUGX(job.salary_range_min)} - ${formatUGX(job.salary_range_max)}`;
    } else if (job.salary_range_min) {
      return `From ${formatUGX(job.salary_range_min)}`;
    } else if (job.salary_range_max) {
      return `Up to ${formatUGX(job.salary_range_max)}`;
    }
    return 'Negotiable';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Job in Uganda
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Connect with top employers and discover opportunities that match your skills
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex-1 flex items-center px-4">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search jobs by title, skills, or company..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 text-base"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-l-none px-8 py-6"
                  onClick={handleApplyFilter}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24 border border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className={`${showFilters ? 'block' : 'hidden md:block'}`}>
                <div className="space-y-6">
                  {/* Location Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    <Input
                      placeholder="City or region"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Job Type
                    </label>
                    <Select 
                      value={filters.job_type} 
                      onValueChange={(value) => setFilters({...filters, job_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Level Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Experience Level
                    </label>
                    <Select 
                      value={filters.experience_level} 
                      onValueChange={(value) => setFilters({...filters, experience_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Salary Range
                    </label>
                    <Select 
                      value={`${filters.min_salary}-${filters.max_salary}`}
                      onValueChange={(value) => {
                        const [min, max] = value.split('-').map(Number);
                        setFilters({...filters, min_salary: min, max_salary: max});
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALARY_RANGES.map((range) => (
                          <SelectItem 
                            key={`${range.min}-${range.max}`} 
                            value={`${range.min}-${range.max}`}
                          >
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skills Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Skills Required
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {SKILLS.map((skill) => (
                        <div key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`skill-${skill}`}
                            checked={filters.skills.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({
                                  ...filters,
                                  skills: [...filters.skills, skill]
                                });
                              } else {
                                setFilters({
                                  ...filters,
                                  skills: filters.skills.filter(s => s !== skill)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label htmlFor={`skill-${skill}`} className="ml-2 text-sm text-gray-600">
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleApplyFilter}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6 border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Jobs</span>
                    <span className="text-lg font-bold text-gray-900">{totalJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Filters</span>
                    <span className="text-lg font-bold text-gray-900">
                      {Object.values(filters).filter(v => {
                        if (v === 'all') return false;
                        if (Array.isArray(v)) return v.length > 0;
                        if (typeof v === 'number') return v !== 0;
                        return v !== '';
                      }).length}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Quick Tips:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• Use specific keywords for better results</li>
                      <li>• Save jobs to apply later</li>
                      <li>• Complete your profile for better matches</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Jobs {totalJobs > 0 && `(${totalJobs})`}
                </h2>
                <p className="text-gray-600">
                  Find opportunities that match your skills and experience
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : ''}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-blue-100 text-blue-600' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                <Select 
                  value={page.toString()} 
                  onValueChange={(value) => setPage(parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((p) => (
                      <SelectItem key={p} value={p.toString()}>Page {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading jobs...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load jobs</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => fetchJobs({ is_active: true })}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && jobs.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Jobs Grid/List */}
            {!loading && !error && jobs.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {jobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className={`border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                    }`}
                  >
                    <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex flex-col h-full">
                        {/* Job Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={job.is_active ? "default" : "secondary"} className="capitalize">
                                {job.is_active ? 'Active' : 'Closed'}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {job.job_type}
                              </Badge>
                              {job.experience_level && (
                                <Badge variant="outline" className="capitalize">
                                  {job.experience_level}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-3">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="font-medium">{job.employer.company_name}</span>
                              <span className="mx-2">•</span>
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{job.location}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-600"
                            onClick={() => handleSaveJob(job.id)}
                          >
                            <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-blue-600 text-blue-600' : ''}`} />
                          </Button>
                        </div>

                        {/* Job Description */}
                        <div className="mb-4 flex-1">
                          <p className="text-gray-600 line-clamp-3">
                            {job.description}
                          </p>
                        </div>

                        {/* Skills */}
                        {job.skills_required && job.skills_required.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {job.skills_required.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills_required.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.skills_required.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Job Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-200">
                          <div className="space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span className="font-semibold text-gray-900">
                                {getSalaryRange(job)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Posted {formatDate(job.created_at)}</span>
                            </div>
                            {job.application_count !== undefined && (
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{job.application_count} applicants</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              onClick={() => handleViewJob(job.id)}
                            >
                              View Details
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleApplyJob(job.id)}
                              disabled={appliedJobs.includes(job.id)}
                              className={`${
                                appliedJobs.includes(job.id)
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                              }`}
                            >
                              {appliedJobs.includes(job.id) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                'Apply Now'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && !error && jobs.length > 0 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}