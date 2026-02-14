'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Briefcase, DollarSign, Clock, Users, Calendar,
  Building, CheckCircle, XCircle, ArrowLeft, Share2, Bookmark,
  Mail, Phone, Globe, FileText, Loader2, AlertCircle,
  ChevronRight, Star, Shield, Award
} from 'lucide-react';
import { useJobs, JobPosting } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { fetchJobById, applyForJob, loading: jobsLoading } = useJobs();
  
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const jobId = params.id as string; // Now using string for UUID

  useEffect(() => {
    if (!jobId) {
      setError('Invalid job ID');
      setLoading(false);
      return;
    }

    loadJobDetails();
  }, [jobId]);

  useEffect(() => {
    // Check if job is saved
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSaved(savedJobs.includes(jobId));
    
    // Check if already applied
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setApplied(appliedJobs.includes(jobId));
  }, [jobId]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const jobData = await fetchJobById(jobId);
      if (!jobData) {
        throw new Error('Job not found');
      }
      setJob(jobData);
      
      // Load employer profile
      if (jobData.employer?.id) {
        fetchEmployerProfile(jobData.employer.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job details');
      console.error('Error loading job:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerProfile = async (employerId: string | number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/users/employers/profile/${employerId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployerProfile(data);
      }
    } catch (err) {
      console.error('Error fetching employer profile:', err);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply for jobs');
      router.push('/login');
      return;
    }

    if (!showApplicationForm) {
      setShowApplicationForm(true);
      return;
    }

    setApplying(true);
    try {
      const result = await applyForJob(jobId, coverLetter);
      if (result) {
        setApplied(true);
        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        localStorage.setItem('appliedJobs', JSON.stringify([...appliedJobs, jobId]));
        toast.success('Application submitted successfully!');
        setShowApplicationForm(false);
      }
    } catch (err) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = () => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      router.push('/login');
      return;
    }

    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const newSaved = !saved;
    
    if (newSaved) {
      localStorage.setItem('savedJobs', JSON.stringify([...savedJobs, jobId]));
      toast.success('Job saved successfully!');
    } else {
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs.filter((id: string) => id !== jobId)));
      toast.success('Job removed from saved');
    }
    
    setSaved(newSaved);
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
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  if (loading || jobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      {/* Job Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link href="/jobs" className="text-blue-600 hover:text-blue-700 flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Jobs
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
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
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  <span className="font-medium">{job.employer.company_name}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Posted {formatDate(job.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <Button
                onClick={handleApply}
                disabled={applied || !job.is_active}
                className={`${
                  applied
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {applied ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Applied
                  </>
                ) : !job.is_active ? (
                  'Job Closed'
                ) : (
                  'Apply Now'
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  onClick={handleSaveJob}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${saved ? 'fill-blue-600 text-blue-600' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {job.skills_required && job.skills_required.length > 0 && (
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {job.skills_required.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Form */}
            {showApplicationForm && !applied && (
              <Card className="border border-gray-200 shadow-sm border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Application Form
                  </CardTitle>
                  <CardDescription>
                    Customize your application for this position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Cover Letter (Optional)
                      </label>
                      <Textarea
                        placeholder="Tell the employer why you're a good fit for this position..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-[150px]"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Briefly describe your experience and why you're interested in this role.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Application Tips</p>
                          <ul className="text-xs text-blue-700 mt-1 space-y-1">
                            <li>• Mention specific skills that match the job requirements</li>
                            <li>• Highlight relevant experience and achievements</li>
                            <li>• Keep it concise and professional</li>
                            <li>• Proofread for spelling and grammar errors</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowApplicationForm(false)}
                    disabled={applying}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Job Overview */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Job Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-semibold">
                      {job.salary_range_min && job.salary_range_max
                        ? `${formatUGX(job.salary_range_min)} - ${formatUGX(job.salary_range_max)}`
                        : job.salary_range_min
                        ? `From ${formatUGX(job.salary_range_min)}`
                        : job.salary_range_max
                        ? `Up to ${formatUGX(job.salary_range_max)}`
                        : 'Negotiable'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Briefcase className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-semibold capitalize">{job.job_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-semibold capitalize">{job.experience_level || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Posted Date</p>
                    <p className="font-semibold">{formatDate(job.created_at)}</p>
                  </div>
                </div>
                
                {job.application_count !== undefined && (
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Applicants</p>
                      <p className="font-semibold">{job.application_count} applicants</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employer Info */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">About the Employer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{job.employer.company_name}</h3>
                    <p className="text-sm text-gray-600">Verified Employer</p>
                  </div>
                </div>
                
                {employerProfile?.company_description && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {employerProfile.company_description}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employerProfile?.created_at ? formatDate(employerProfile.created_at) : 'Recently'}
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  onClick={() => router.push(`/employer/${job.employer.id}`)}
                >
                  View Company Profile
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Award className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Never pay to apply for a job</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Verify employer details before sharing personal information</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Report suspicious job postings to support</span>
                  </li>
                  <li className="flex items-start">
                    <Award className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Meet in public places for interviews</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}