// app/workers/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, Filter, MapPin, Star, Clock, Shield, 
  Users, Briefcase, Award, Sparkles, ChevronRight,
  CheckCircle, XCircle, Eye, MessageSquare, Phone,
  Loader2, X, TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '@/lib/api';
import ContactModal from '@/components/ContactModal';
import { WorkerProfile, WorkerSkill } from '@/types/worker';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/ui/footer';

interface FilterState {
  city: string;
  profession: string;
  minExperience: number;
  availability: string;
  verification: string;
  search: string;
}

interface ApiParams {
  city?: string;
  profession?: string;
  min_experience?: number;
  availability?: string;
  verification_status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    city: '',
    profession: '',
    minExperience: 0,
    availability: '',
    verification: 'all',
    search: '',
  });

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.profession) count++;
    if (filters.minExperience > 0) count++;
    if (filters.availability && filters.availability !== 'all') count++;
    if (filters.verification && filters.verification !== 'all') count++;
    if (filters.search) count++;
    setActiveFilterCount(count);
  }, [filters]);

  // Fetch workers on initial load
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Debounced filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers({ ...filters });
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.city, filters.profession, filters.minExperience, filters.availability, filters.verification]);

  // Handle search separately with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers({ ...filters });
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchWorkers = useCallback(async (customFilters?: Partial<FilterState>) => {
    try {
      setIsLoading(true);
      setError(null);

      const activeFilters = customFilters || filters;

      const params: ApiParams = {
        page_size: 20,
      };

      // Add filters if they have values
      if (activeFilters.city) params.city = activeFilters.city;
      if (activeFilters.profession) params.profession = activeFilters.profession;
      
      if (activeFilters.minExperience !== undefined && activeFilters.minExperience > 0) {
        params.min_experience = activeFilters.minExperience;
      }
      
      if (activeFilters.availability && activeFilters.availability !== 'all') {
        params.availability = activeFilters.availability;
      }
      if (activeFilters.verification && activeFilters.verification !== 'all') {
        params.verification_status = activeFilters.verification;
      }
      if (activeFilters.search) params.search = activeFilters.search;

      // Use the correct endpoint from your Swagger docs
      const response = await api.get('/workers/profile/', { params });

      // Handle the response format from Django REST Framework
      let workersData: WorkerProfile[] = [];
      let count = 0;

      if (response.data.results) {
        workersData = response.data.results;
        count = response.data.count || response.data.results.length;
      } else if (Array.isArray(response.data)) {
        workersData = response.data;
        count = response.data.length;
      } else {
        throw new Error('Unexpected API response format');
      }

      // Transform data from API to match your TypeScript interface
      const transformedWorkers = workersData.map((worker: any) => {
        // Get user data safely
        const user = worker.user || {};
        
        return {
          id: worker.id,
          first_name: worker.first_name || user.first_name || '',
          last_name: worker.last_name || user.last_name || '',
          full_name: worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Worker',
          date_of_birth: worker.date_of_birth,
          age: worker.age?.toString(),
          gender: worker.gender as any,
          national_id: worker.national_id,
          profile_photo_url: worker.profile_photo_url || '',
          bio: worker.bio,
          city: worker.city || 'Kampala',
          district: worker.district || '',
          location_lat: worker.location_lat?.toString(),
          location_lng: worker.location_lng?.toString(),
          experience_years: worker.experience_years || 0,
          education_level: worker.education_level,
          languages: worker.languages || {},
          email: user.email || worker.email,
          profession: worker.profession || 'Worker',
          hourly_rate: worker.hourly_rate?.toString() || '0',
          additional_skills: worker.additional_skills || '',
          phone: user.phone || worker.phone,
          availability: worker.availability || 'available',
          expected_salary_min: worker.expected_salary_min,
          expected_salary_max: worker.expected_salary_max,
          verification_status: worker.verification_status || 'pending',
          trust_score: worker.trust_score || 0,
          rating_average: worker.rating_average?.toString() || '0.0',
          total_reviews: worker.total_reviews || 0,
          total_placements: worker.total_placements || 0,
          subscription_tier: worker.subscription_tier || 'free',
          subscription_expires_at: worker.subscription_expires_at,
          created_at: worker.created_at,
          updated_at: worker.updated_at,
          skills: (worker.skills || []).map((skill: any) => ({
            id: skill.id,
            category: skill.category?.name || 'General',
            category_name: skill.category?.name || 'General',
            skill_name: skill.skill_name || 'Skill',
            proficiency_level: (skill.proficiency_level || 'beginner') as WorkerSkill['proficiency_level'],
            years_of_experience: skill.years_of_experience || 0,
            is_primary: skill.is_primary || false,
            created_at: skill.created_at,
          })),
          documents: worker.documents || [],
          references: worker.references || [],
        };
      });

      setWorkers(transformedWorkers);
      setFilteredWorkers(transformedWorkers);
      setTotalCount(count);

    } catch (error: any) {
      console.error('Error fetching workers:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to load workers');
      setWorkers([]);
      setFilteredWorkers([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      profession: '',
      minExperience: 0,
      availability: '',
      verification: 'all',
      search: '',
    });
  };

  const clearSingleFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: key === 'verification' ? 'all' : 
              key === 'availability' ? '' : 
              key === 'minExperience' ? 0 : '' 
    }));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'bg-green-100 text-green-800 border-green-200';
      case 'part_time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_available': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'on_leave': return 'On Leave';
      case 'not_available': return 'Not Available';
      default: return availability || 'Not Specified';
    }
  };

  if (isLoading && workers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading workers from database...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching real data from backend</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find <span className="text-yellow-300">Verified</span> Skilled Workers
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with trusted, verified workers across Uganda. Hire with confidence.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by name, profession, or skill (e.g., Electrician, Plumber)"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl border-0 focus:ring-2 focus:ring-white bg-white/90 backdrop-blur-sm"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="flex justify-center mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error loading workers</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchWorkers()}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="container mx-auto px-4 py-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Filter className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Active Filters:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.city && (
                      <Badge variant="secondary" className="gap-1 bg-white border-blue-200">
                        City: {filters.city}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => clearSingleFilter('city')}
                        />
                      </Badge>
                    )}
                    {filters.profession && (
                      <Badge variant="secondary" className="gap-1 bg-white border-blue-200">
                        Profession: {filters.profession}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => clearSingleFilter('profession')}
                        />
                      </Badge>
                    )}
                    {filters.minExperience > 0 && (
                      <Badge variant="secondary" className="gap-1 bg-white border-blue-200">
                        Min Exp: {filters.minExperience}yrs
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => clearSingleFilter('minExperience')}
                        />
                      </Badge>
                    )}
                    {filters.availability && filters.availability !== 'all' && (
                      <Badge variant="secondary" className="gap-1 bg-white border-blue-200">
                        {getAvailabilityText(filters.availability)}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => clearSingleFilter('availability')}
                        />
                      </Badge>
                    )}
                    {filters.verification && filters.verification !== 'all' && (
                      <Badge variant="secondary" className="gap-1 bg-white border-blue-200">
                        {filters.verification === 'verified' ? 'Verified Only' : 'Pending Verification'}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => clearSingleFilter('verification')}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-center"
                >
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Fixed for better visibility */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              <Card className="border-2 border-blue-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Filter className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Filters</CardTitle>
                        {activeFilterCount > 0 && (
                          <CardDescription className="text-blue-600">
                            {activeFilterCount} active
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* City Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        City
                      </div>
                    </label>
                    <Input
                      placeholder="e.g., Kampala, Entebbe"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Profession Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        Profession
                      </div>
                    </label>
                    <Input
                      placeholder="e.g., Electrician, Housekeeper"
                      value={filters.profession}
                      onChange={(e) => handleFilterChange('profession', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" />
                          Min Experience
                        </div>
                      </label>
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {filters.minExperience} years
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={[filters.minExperience]}
                      onValueChange={(value) => handleFilterChange('minExperience', value[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                      <span>25</span>
                      <span>30+</span>
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        Availability
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '', label: 'All', color: 'bg-gray-100 text-gray-700' },
                        { value: 'full_time', label: 'Full Time', color: 'bg-green-100 text-green-700' },
                        { value: 'part_time', label: 'Part Time', color: 'bg-blue-100 text-blue-700' },
                        { value: 'available', label: 'Available', color: 'bg-purple-100 text-purple-700' },
                        { value: 'busy', label: 'Busy', color: 'bg-red-100 text-red-700' },
                        { value: 'on_leave', label: 'On Leave', color: 'bg-yellow-100 text-yellow-700' },
                      ].map((option) => (
                        <Button
                          key={option.value || 'all'}
                          type="button"
                          variant={filters.availability === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('availability', option.value)}
                          className={`h-9 text-xs ${filters.availability === option.value 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "hover:bg-gray-50"} ${option.color}`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Verification Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-500" />
                        Verification Status
                      </div>
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Workers', icon: Users, color: 'bg-gray-100 text-gray-700' },
                        { value: 'verified', label: 'Verified Only', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
                        { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
                        { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700' },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <div
                            key={option.value}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${filters.verification === option.value 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'}`}
                            onClick={() => handleFilterChange('verification', option.value)}
                          >
                            <div className={`h-8 w-8 rounded-lg ${option.color} flex items-center justify-center mr-3`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full h-11 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      disabled={activeFilterCount === 0}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="border-2 border-blue-50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Platform Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Total Workers</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg bg-white px-2 py-1 rounded-md">
                      {totalCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Verified Workers</span>
                    </div>
                    <span className="font-bold text-green-600 text-lg bg-white px-2 py-1 rounded-md">
                      {workers.filter(w => w.verification_status === 'verified').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-100 hover:border-amber-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center">
                        <Star className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Avg. Rating</span>
                    </div>
                    <span className="font-bold text-amber-600 text-lg bg-white px-2 py-1 rounded-md">
                      {workers.length > 0 
                        ? (workers.reduce((sum, w) => sum + parseFloat(w.rating_average || '0'), 0) / workers.length).toFixed(1)
                        : '0.0'}★
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Active Now</span>
                    </div>
                    <span className="font-bold text-purple-600 text-lg bg-white px-2 py-1 rounded-md">
                      {workers.filter(w => 
                        w.availability === 'available' || 
                        w.availability === 'full_time' || 
                        w.availability === 'part_time'
                      ).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Workers Grid - Main Content */}
          <div className="flex-1">
            <Card className="mb-8 border-2 border-blue-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Available Workers
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-gray-600">
                        Showing <span className="font-bold text-blue-600">{filteredWorkers.length}</span> of <span className="font-bold text-blue-600">{totalCount}</span> workers
                      </p>
                      {isRefreshing && (
                        <span className="inline-flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => fetchWorkers()}
                      disabled={isRefreshing}
                      className="gap-2 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {isRefreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Loader2 className="h-4 w-4" />
                      )}
                      Refresh
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                    >
                      <Filter className="h-4 w-4" />
                      {showFilters ? 'Hide' : 'Filters'}
                      {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredWorkers.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="py-16 text-center">
                  <div className="h-24 w-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No workers found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    {filters.city || filters.profession || filters.search
                      ? 'No workers match your current filters. Try adjusting your search criteria.'
                      : 'No workers are currently available. Check back soon!'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={clearFilters}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      <X className="h-5 w-5" />
                      Clear All Filters
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/')}
                      size="lg"
                      className="border-2"
                    >
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>
                
                {/* Load More Button if needed */}
                {filteredWorkers.length < totalCount && (
                  <div className="mt-12 text-center">
                    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50 inline-block">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900">Want to see more?</h4>
                            <p className="text-gray-600 text-sm">
                              There are {totalCount - filteredWorkers.length} more workers available
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              // Implement pagination
                              console.log('Load more clicked');
                            }}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            size="lg"
                          >
                            <ChevronRight className="h-5 w-5" />
                            Load More Workers
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated Worker Card Component with better layout
function WorkerCard({ worker }: { worker: WorkerProfile }) {
  const router = useRouter();
  const [showContactModal, setShowContactModal] = useState(false);

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'bg-green-100 text-green-800 border-green-200';
      case 'part_time': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_available': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'on_leave': return 'On Leave';
      case 'not_available': return 'Not Available';
      default: return availability || 'Not Specified';
    }
  };

  const getVerificationStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return (
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Shield className="h-4 w-4 text-white" />
          </div>
        );
      case 'pending':
        return (
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Clock className="h-4 w-4 text-white" />
          </div>
        );
      case 'rejected':
        return (
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <XCircle className="h-4 w-4 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:scale-[1.02] h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Header with Profile and Rating */}
          <div className="flex items-start gap-4 mb-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'D'}
              </div>
              {getVerificationStatus(worker.verification_status)}
            </div>

            {/* Name and Rating */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h3 
                    className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate cursor-pointer hover:underline"
                    onClick={() => router.push(`/workers/${worker.id}`)}
                  >
                    {worker.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">
                      {worker.profession || 'Worker'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="font-bold text-gray-900 text-sm">
                    {worker.rating_average || '0.0'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({worker.total_reviews || 0})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Details */}
          <div className="space-y-3 mb-4 flex-1">
            {/* Location */}
            {worker.city && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                <span className="truncate text-sm">
                  {worker.city}{worker.district ? `, ${worker.district}` : ', Uganda'}
                </span>
              </div>
            )}

            {/* Experience */}
            {worker.experience_years > 0 && (
              <div className="flex items-center text-gray-600">
                <Award className="h-4 w-4 mr-2 flex-shrink-0 text-amber-500" />
                <span className="text-sm">{worker.experience_years} years experience</span>
              </div>
            )}

            {/* Availability */}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(worker.availability)}`}>
                {getAvailabilityText(worker.availability)}
              </span>
            </div>

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={skill.id || index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs rounded-lg border border-blue-200"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                  {worker.skills.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-lg">
                      +{worker.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions - Fixed to bottom */}
          <div className="flex gap-3 pt-4 mt-auto border-t border-gray-100">
            <Button
              variant="outline"
              className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              onClick={() => router.push(`/workers/${worker.id}`)}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowContactModal(true)}
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Modal */}
      {showContactModal && (
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
    </>
  );
}