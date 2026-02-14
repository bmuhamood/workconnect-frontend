// app/workers/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Star, Clock, Shield, Briefcase, Award, 
  Phone, Mail, Calendar, Users, BookOpen, Languages,
  ArrowLeft, MessageSquare, CheckCircle, XCircle, Loader2,
  GraduationCap, Target, TrendingUp, UserCheck, FileText, Zap,
  ChevronRight, Trophy, BarChart3, Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import ContactModal from '@/components/ContactModal';
import { WorkerProfile, WorkerSkill } from '@/types/worker';
import { cn, formatDate } from '@/lib/utils';
import Footer from '@/components/ui/footer';
import Navbar from '@/components/layout/navbar';

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const workerId = params.id as string;

  useEffect(() => {
    if (workerId) {
      fetchWorkerDetails();
    }
  }, [workerId]);

const fetchWorkerDetails = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // 🔴 FIXED: Use the correct endpoint from your Swagger docs
    const response = await api.get(`/users/workers/profile/${workerId}/`);

    const workerData = response.data;
    
    // Debug: Log the worker data to see its structure
    console.log('Worker Data:', workerData);
    
    // Transform data from API to match your TypeScript interface
    const transformedWorker: WorkerProfile = {
      id: workerData.id,
      first_name: workerData.first_name || '',
      last_name: workerData.last_name || '',
      full_name: workerData.full_name || `${workerData.first_name || ''} ${workerData.last_name || ''}`.trim(),
      date_of_birth: workerData.date_of_birth,
      age: workerData.age?.toString(),
      gender: workerData.gender as any,
      national_id: workerData.national_id,
      profile_photo_url: workerData.profile_photo_url || '',
      bio: workerData.bio,
      city: workerData.city || 'Kampala',
      district: workerData.district || '',
      location_lat: workerData.location_lat?.toString(),
      location_lng: workerData.location_lng?.toString(),
      experience_years: workerData.experience_years || 0,
      education_level: workerData.education_level,
      languages: workerData.languages || {},
      email: workerData.user?.email || workerData.email || '',
      profession: workerData.profession || 'Worker',
      hourly_rate: workerData.hourly_rate?.toString() || '0',
      additional_skills: workerData.additional_skills || '',
      phone: workerData.user?.phone || workerData.phone || '',
      availability: workerData.availability || 'available',
      expected_salary_min: workerData.expected_salary_min,
      expected_salary_max: workerData.expected_salary_max,
      verification_status: workerData.verification_status || 'pending',
      trust_score: workerData.trust_score || 0,
      rating_average: workerData.rating_average?.toString() || '0.0',
      total_reviews: workerData.total_reviews || 0,
      total_placements: workerData.total_placements || 0,
      subscription_tier: workerData.subscription_tier || 'free',
      subscription_expires_at: workerData.subscription_expires_at,
      created_at: workerData.created_at,
      updated_at: workerData.updated_at,
      skills: (workerData.skills || []).map((skill: any) => ({
        id: skill.id,
        category: skill.category?.name || skill.category_name || 'General',
        category_name: skill.category?.name || skill.category_name || 'General',
        skill_name: skill.skill_name || skill.name || 'Skill',
        proficiency_level: skill.proficiency_level || skill.level || 'beginner',
        years_of_experience: skill.years_of_experience || skill.experience_years || 0,
        is_primary: skill.is_primary || false,
        created_at: skill.created_at,
      })),
      documents: workerData.documents || [],
      references: workerData.references || [],
    };

    setWorker(transformedWorker);
  } catch (error: any) {
    console.error('Error fetching worker details:', error);
    setError(error.response?.data?.detail || error.message || 'Failed to load worker details');
    setWorker(null);
  } finally {
    setIsLoading(false);
  }
};

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'part_time': return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'available': return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'busy': return 'bg-gradient-to-r from-red-500 to-orange-600 text-white';
      case 'on_leave': return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'available': return 'Available Now';
      case 'busy': return 'Currently Busy';
      case 'on_leave': return 'On Leave';
      default: return availability || 'Not Specified';
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white';
      case 'advanced': return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'intermediate': return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
      case 'beginner': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

  const getProficiencyProgress = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 100;
      case 'advanced': return 75;
      case 'intermediate': return 50;
      case 'beginner': return 25;
      default: return 0;
    }
  };

  const parseAdditionalSkills = (skillsInput: any): string[] => {
    if (!skillsInput) return [];
    
    try {
      // If it's already an array, return it
      if (Array.isArray(skillsInput)) {
        return skillsInput.filter(skill => skill && skill.toString().trim().length > 0);
      }
      
      // If it's a string, parse it
      if (typeof skillsInput === 'string') {
        const skills = skillsInput
          .split(/[,;\n]/)
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
        
        return skills;
      }
      
      // If it's a number or other type, convert to string
      return [skillsInput.toString().trim()].filter(skill => skill.length > 0);
    } catch (error) {
      console.error('Error parsing additional skills:', error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading worker details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Worker Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The worker you\'re looking for doesn\'t exist.'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/workers')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workers
              </Button>
              <Button 
                variant="outline"
                onClick={() => fetchWorkerDetails()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get skills data
  const primarySkills = worker.skills?.filter(skill => skill.is_primary) || [];
  const secondarySkills = worker.skills?.filter(skill => !skill.is_primary) || [];
  const allSkills = worker.skills || [];
  
  // Parse additional skills into an array - SAFELY
  const additionalSkills = parseAdditionalSkills(worker.additional_skills);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
    
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/workers')}
          className="mb-6 group hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Workers
        </Button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  {/* Profile Image */}
                  <div className="relative shrink-0">
                    <div className="h-40 w-40 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl shadow-blue-200/50">
                      {worker.first_name[0]}{worker.last_name[0]}
                    </div>
                    {worker.verification_status === 'verified' && (
                      <div className="absolute -bottom-3 -right-3 h-16 w-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
                          <Briefcase className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-700">{worker.profession}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                          {worker.full_name}
                        </h1>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium",
                            getAvailabilityColor(worker.availability)
                          )}>
                            <Clock className="h-4 w-4" />
                            {getAvailabilityText(worker.availability)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 rounded-2xl border border-amber-200 shadow-sm">
                        <div className="relative">
                          <Star className="h-8 w-8 text-amber-500 fill-current" />
                          <div className="absolute inset-0 animate-ping opacity-20">
                            <Star className="h-8 w-8 text-amber-500 fill-current" />
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900">{worker.rating_average}</div>
                          <div className="text-sm text-gray-600">{worker.total_reviews} reviews</div>
                        </div>
                      </div>
                    </div>

                    {/* Location & Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Location</div>
                          <div className="font-semibold text-gray-900">
                            {worker.city}{worker.district ? `, ${worker.district}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Experience</div>
                          <div className="font-semibold text-gray-900">{worker.experience_years} years</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Completed Jobs</div>
                          <div className="font-semibold text-gray-900">{worker.total_placements}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            {worker.bio && (
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    About {worker.first_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{worker.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills Section - IMPROVED */}
            <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    Skills & Expertise
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      {allSkills.length} Core Skills
                    </Badge>
                    {additionalSkills.length > 0 && (
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        +{additionalSkills.length} Additional
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Primary Skills with visual indicators */}
                  {primarySkills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="h-5 w-5 text-amber-600" />
                        <h3 className="text-xl font-bold text-gray-900">Primary Skills</h3>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                          Specialization
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {primarySkills.map((skill) => (
                          <div key={skill.id} className="group relative">
                            <div className="p-5 bg-gradient-to-br from-white to-amber-50 rounded-2xl border-2 border-amber-100 group-hover:border-amber-400 group-hover:shadow-lg transition-all duration-300">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                      <Target className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-lg">{skill.skill_name}</h4>
                                  </div>
                                  {skill.category_name && skill.category_name !== 'General' && (
                                    <p className="text-sm text-gray-600">Category: {skill.category_name}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold mb-2",
                                    getProficiencyColor(skill.proficiency_level)
                                  )}>
                                    {skill.proficiency_level}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{skill.years_of_experience} years</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Proficiency</span>
                                  <span className="font-medium text-gray-900">
                                    {getProficiencyProgress(skill.proficiency_level)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      skill.proficiency_level === 'expert' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                      skill.proficiency_level === 'advanced' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                                      skill.proficiency_level === 'intermediate' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                      'bg-gradient-to-r from-gray-400 to-gray-500'
                                    )}
                                    style={{ width: `${getProficiencyProgress(skill.proficiency_level)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary Skills */}
                  {secondarySkills.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">Secondary Skills</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {secondarySkills.map((skill) => (
                          <div key={skill.id} className="group">
                            <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-blue-500" />
                                  <span className="font-semibold text-gray-900">{skill.skill_name}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                {skill.category_name && skill.category_name !== 'General' && (
                                  <span className="text-gray-600">{skill.category_name}</span>
                                )}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 font-medium">
                                    {skill.years_of_experience} yrs
                                  </span>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium",
                                    getProficiencyColor(skill.proficiency_level)
                                  )}>
                                    {skill.proficiency_level}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Skills Section - FIXED with error handling */}
                  {additionalSkills.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="text-xl font-bold text-gray-900">Additional Skills</h3>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          {additionalSkills.length} skills
                        </Badge>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {additionalSkills.map((skill, index) => (
                            <div 
                              key={index} 
                              className="group flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                            >
                              <ChevronRight className="h-3 w-3 text-purple-500 group-hover:translate-x-1 transition-transform" />
                              <span className="text-gray-800 font-medium">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback if no skills at all */}
                  {allSkills.length === 0 && additionalSkills.length === 0 && (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Skills Listed</h3>
                      <p className="text-gray-600">This worker hasn't added any skills yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience & Education Section */}
            <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  Qualifications & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Experience Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Total Experience</h4>
                          <p className="text-3xl font-bold text-blue-600">{worker.experience_years} years</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Professional experience in relevant fields</p>
                    </div>

                    {/* Education Level */}
                    {worker.education_level && (
                      <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Education Level</h4>
                            <p className="text-lg font-bold text-green-600">{worker.education_level}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills Summary */}
                  {allSkills.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Skills Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Proficiency Distribution */}
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Expert Level</div>
                          <div className="text-2xl font-bold text-emerald-600">
                            {allSkills.filter(s => s.proficiency_level.toLowerCase() === 'expert').length}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Advanced</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {allSkills.filter(s => s.proficiency_level.toLowerCase() === 'advanced').length}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Intermediate</div>
                          <div className="text-2xl font-bold text-amber-600">
                            {allSkills.filter(s => s.proficiency_level.toLowerCase() === 'intermediate').length}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">Beginner</div>
                          <div className="text-2xl font-bold text-gray-600">
                            {allSkills.filter(s => s.proficiency_level.toLowerCase() === 'beginner').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Details */}
          <div className="space-y-8">
            {/* Contact Card */}
            <Card className="border-0 shadow-2xl bg-gradient-to-b from-white to-blue-50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <MessageSquare className="h-5 w-5" />
                  Contact Worker
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Send a message to discuss opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  {worker.phone && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Phone Number</div>
                        <div className="font-semibold text-gray-900">{worker.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {worker.email && (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-purple-100 shadow-sm">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-200 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-600">Email Address</div>
                        <div className="font-semibold text-gray-900 break-all">{worker.email}</div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Hourly Rate */}
                {worker.hourly_rate && parseFloat(worker.hourly_rate) > 0 && (
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Hourly Rate</div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
                        UGX {parseFloat(worker.hourly_rate).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">per hour • Negotiable</div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600">Reviews</div>
                    <div className="text-lg font-bold text-gray-900">{worker.total_reviews}</div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-600">Jobs Done</div>
                    <div className="text-lg font-bold text-gray-900">{worker.total_placements}</div>
                  </div>
                </div>

                {/* Contact Button */}
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  <MessageSquare className="h-5 w-5 mr-3" />
                  Contact {worker.first_name}
                </Button>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-700" />
                  </div>
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Languages */}
                {worker.languages && Object.keys(worker.languages).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <Languages className="h-4 w-4" />
                      Languages
                    </div>
                    <div className="space-y-2">
                      {Object.entries(worker.languages).map(([language, level]) => (
                        <div key={language} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{language}</span>
                          <Badge variant="secondary" className="font-normal">
                            {level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Age & Member Since */}
                <div className="grid grid-cols-2 gap-4">
                  {worker.age && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Age</div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-900">{worker.age} years</span>
                      </div>
                    </div>
                  )}
                  {worker.created_at && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">Member Since</div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <span className="font-semibold text-gray-900">
                          {formatDate(worker.created_at)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Trust Score</span>
                    <span className="font-bold text-gray-900">{worker.trust_score}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600"
                      style={{ width: `${worker.trust_score}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="space-y-3">
                  <div className="font-medium text-gray-900">Verification Status</div>
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3",
                    worker.verification_status === 'verified' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200' :
                    worker.verification_status === 'pending' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' :
                    'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200'
                  )}>
                    {worker.verification_status === 'verified' ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-amber-600" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {worker.verification_status.charAt(0).toUpperCase() + worker.verification_status.slice(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {worker.verification_status === 'verified' ? 'Fully verified and trusted' : 'Verification in progress'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && worker && (
        <ContactModal 
          worker={{
            id: worker.id,
            first_name: worker.first_name,
            last_name: worker.last_name,
            full_name: worker.full_name,
            profession: worker.profession || 'Worker',
            hourly_rate: worker.hourly_rate || '0',
            availability: worker.availability,
            verification_status: worker.verification_status,
            rating_average: worker.rating_average,
            city: worker.city,
            district: worker.district,
            experience_years: worker.experience_years,
            total_reviews: worker.total_reviews,
            profile_photo_url: worker.profile_photo_url,
            email: worker.email,
            phone: worker.phone,
            skills: worker.skills?.map(skill => skill.skill_name) || []
          }}
          onClose={() => setShowContactModal(false)}
        />
      )}

    </div>
  );
}