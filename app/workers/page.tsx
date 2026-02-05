// app/workers/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, Filter, MapPin, Star, Clock, Shield, 
  Users, Briefcase, Award, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Eye, MessageSquare, Phone,
  Loader2, X, Sparkles, Zap, TrendingUp, Building2,
  SlidersHorizontal, ArrowUpDown, Grid3x3, List,
  RefreshCw, AlertCircle, Flame, Crown
} from 'lucide-react';
import api from '@/lib/api';
import ContactModal from '@/components/ContactModal';
import { WorkerProfile, WorkerSkill } from '@/types/worker';

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

type ViewMode = 'grid' | 'list';
type SortOption = 'rating' | 'experience' | 'newest';

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<WorkerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
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
        page_size: 50,
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

      // Fetch workers from the correct endpoint
      const response = await api.get('/workers/profile/', { params });

      // Handle different response formats
      let workersData: WorkerProfile[] = [];
      let count = 0;

      if (response.data.results) {
        workersData = response.data.results;
        count = response.data.count || response.data.results.length;
      } else if (Array.isArray(response.data)) {
        workersData = response.data;
        count = response.data.length;
      } else {
        workersData = [response.data];
        count = 1;
      }

      // Transform data
      const transformedWorkers = workersData.map((worker: any) => {
        const user = worker.user || {};
        
        return {
          id: worker.id || `temp-${Math.random()}`,
          first_name: worker.first_name || user.first_name || '',
          last_name: worker.last_name || user.last_name || '',
          full_name: worker.full_name || `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Unknown Worker',
          city: worker.city || 'Kampala',
          district: worker.district || '',
          experience_years: worker.experience_years || 0,
          profession: worker.profession || 'Worker',
          rating_average: worker.rating_average?.toString() || '0.0',
          total_reviews: worker.total_reviews || 0,
          verification_status: worker.verification_status || 'pending',
          trust_score: worker.trust_score || 0,
          availability: worker.availability || 'available',
          hourly_rate: worker.hourly_rate?.toString() || '0',
          profile_photo_url: worker.profile_photo_url || '',
          email: user.email || worker.email,
          phone: user.phone || worker.phone,
          skills: (worker.skills || []).map((skill: any) => ({
            id: skill.id || `skill-${Math.random()}`,
            skill_name: skill.skill_name || 'Skill',
            proficiency_level: (skill.proficiency_level || 'beginner') as WorkerSkill['proficiency_level'],
            category: skill.category?.name || skill.category_name || 'General',
            category_name: skill.category?.name || skill.category_name || 'General',
            years_of_experience: skill.years_of_experience || 0,
            is_primary: skill.is_primary || false,
            created_at: skill.created_at || new Date().toISOString(),
          })),
          additional_skills: worker.additional_skills || '',
          gender: worker.gender as any,
          bio: worker.bio,
          date_of_birth: worker.date_of_birth,
          age: worker.age?.toString(),
          national_id: worker.national_id,
          education_level: worker.education_level,
          languages: worker.languages || {},
          expected_salary_min: worker.expected_salary_min,
          expected_salary_max: worker.expected_salary_max,
          total_placements: worker.total_placements || 0,
          subscription_tier: (worker.subscription_tier || 'free') as any,
          subscription_expires_at: worker.subscription_expires_at,
          created_at: worker.created_at || new Date().toISOString(),
          updated_at: worker.updated_at || new Date().toISOString(),
          documents: worker.documents || [],
          references: worker.references || [],
        };
      });

      setWorkers(transformedWorkers);
      setFilteredWorkers(transformedWorkers);
      setTotalCount(count);

    } catch (error: any) {
      console.error('Error fetching workers:', error);
      setError(error.message || 'Failed to load workers. Please try again.');
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

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sorted = [...filteredWorkers].sort((a, b) => {
      switch (option) {
        case 'rating':
          return parseFloat(b.rating_average) - parseFloat(a.rating_average);
        case 'experience':
          return b.experience_years - a.experience_years;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    setFilteredWorkers(sorted);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'part_time': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200';
      case 'busy': return 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-200';
      case 'on_leave': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'available': return 'Available Now';
      case 'busy': return 'Currently Busy';
      case 'on_leave': return 'On Leave';
      default: return 'Not Specified';
    }
  };

  if (isLoading && workers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="relative h-20 w-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-purple-600 animate-spin"></div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-900">Finding Top Talent...</p>
                <p className="text-sm text-gray-600">Searching our database of verified workers</p>
              </div>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full mb-6 border border-white/20">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-semibold">Uganda's Premier Talent Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Discover <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">Exceptional</span> Talent
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Connect with verified, skilled professionals across Uganda. Trusted by hundreds of employers nationwide.
              </p>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-4xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by name, profession, skills, or location..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-16 pr-40 py-7 text-lg rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-white/30 transition-all"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-xl px-6 h-12"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    {showFilters ? (
                      <ChevronUp className="h-4 w-4 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { 
                  label: 'Active Workers', 
                  value: totalCount, 
                  icon: Users,
                  gradient: 'from-blue-400 to-cyan-400'
                },
                { 
                  label: 'Verified Professionals', 
                  value: workers.filter(w => w.verification_status === 'verified').length,
                  icon: Shield,
                  gradient: 'from-green-400 to-emerald-400'
                },
                { 
                  label: 'Average Rating', 
                  value: workers.length > 0 
                    ? (workers.reduce((sum, w) => sum + parseFloat(w.rating_average || '0'), 0) / workers.length).toFixed(1) + '★'
                    : '0.0★',
                  icon: Star,
                  gradient: 'from-amber-400 to-yellow-400'
                },
                { 
                  label: 'Ready to Work', 
                  value: workers.filter(w => ['available', 'full_time', 'part_time'].includes(w.availability)).length,
                  icon: Zap,
                  gradient: 'from-purple-400 to-pink-400'
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 text-center border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} mb-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-blue-200 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="bg-white border-b shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Active Filters:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.city && (
                    <Badge className="gap-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300">
                      <MapPin className="h-3 w-3" />
                      {filters.city}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => clearSingleFilter('city')}
                      />
                    </Badge>
                  )}
                  {filters.profession && (
                    <Badge className="gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300">
                      <Briefcase className="h-3 w-3" />
                      {filters.profession}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => clearSingleFilter('profession')}
                      />
                    </Badge>
                  )}
                  {filters.minExperience > 0 && (
                    <Badge className="gap-1.5 bg-green-100 hover:bg-green-200 text-green-700 border-green-300">
                      <Award className="h-3 w-3" />
                      {filters.minExperience}+ years
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => clearSingleFilter('minExperience')}
                      />
                    </Badge>
                  )}
                  {filters.availability && filters.availability !== 'all' && (
                    <Badge className="gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300">
                      <Clock className="h-3 w-3" />
                      {getAvailabilityText(filters.availability)}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
                        onClick={() => clearSingleFilter('availability')}
                      />
                    </Badge>
                  )}
                  {filters.verification && filters.verification !== 'all' && (
                    <Badge className="gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300">
                      <Shield className="h-3 w-3" />
                      {filters.verification === 'verified' ? 'Verified Only' : filters.verification}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-600" 
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden sticky top-24">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">Advanced Filters</h2>
                      {activeFilterCount > 0 && (
                        <p className="text-sm text-blue-100">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 space-y-6">
                {/* City Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <label className="text-sm font-semibold text-gray-900">Location</label>
                  </div>
                  <Input
                    placeholder="e.g., Kampala, Entebbe..."
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full border-2 rounded-xl focus:ring-2"
                  />
                </div>

                <Separator />

                {/* Profession Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <label className="text-sm font-semibold text-gray-900">Profession</label>
                  </div>
                  <Input
                    placeholder="e.g., Housekeeper, Driver..."
                    value={filters.profession}
                    onChange={(e) => handleFilterChange('profession', e.target.value)}
                    className="w-full border-2 rounded-xl focus:ring-2"
                  />
                </div>

                <Separator />

                {/* Experience Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <label className="text-sm font-semibold text-gray-900">Experience</label>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-300 font-bold">
                      {filters.minExperience}+ years
                    </Badge>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={filters.minExperience}
                    onChange={(e) => handleFilterChange('minExperience', parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-green-100 to-green-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-green-500 [&::-webkit-slider-thumb]:to-emerald-600 [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                    <span>Entry</span>
                    <span>Mid</span>
                    <span>Senior</span>
                  </div>
                </div>

                <Separator />

                {/* Availability Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <label className="text-sm font-semibold text-gray-900">Availability</label>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'full_time', label: 'Full Time', icon: '🟢' },
                      { value: 'part_time', label: 'Part Time', icon: '🔵' },
                      { value: 'available', label: 'Available Now', icon: '🟣' },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        onClick={() => handleFilterChange('availability', filters.availability === option.value ? '' : option.value)}
                        className={`w-full justify-start border-2 transition-all ${
                          filters.availability === option.value 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-400 shadow-md' 
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                        {filters.availability === option.value && (
                          <CheckCircle className="h-4 w-4 ml-auto text-blue-600" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Verification Filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <label className="text-sm font-semibold text-gray-900">Verification Status</label>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Workers', icon: Users },
                      { value: 'verified', label: 'Verified Only', icon: CheckCircle },
                      { value: 'pending', label: 'Pending', icon: Clock },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          onClick={() => handleFilterChange('verification', option.value)}
                          className={`w-full justify-start border-2 transition-all ${
                            filters.verification === option.value 
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-400 shadow-md' 
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {option.label}
                          {filters.verification === option.value && (
                            <CheckCircle className="h-4 w-4 ml-auto text-emerald-600" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                  <>
                    <Separator />
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 font-semibold"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6 border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Quick Stats</h3>
                    <p className="text-xs text-purple-100">Live data</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                {[
                  { label: 'Total Workers', value: totalCount, gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Verified', value: workers.filter(w => w.verification_status === 'verified').length, gradient: 'from-green-500 to-emerald-500' },
                  { label: 'Avg. Rating', value: workers.length > 0 ? (workers.reduce((sum, w) => sum + parseFloat(w.rating_average || '0'), 0) / workers.length).toFixed(1) + '★' : '0.0★', gradient: 'from-amber-500 to-yellow-500' },
                  { label: 'Available Now', value: workers.filter(w => ['available', 'full_time', 'part_time'].includes(w.availability)).length, gradient: 'from-purple-500 to-pink-500' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                    <span className={`text-lg font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Workers Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Available Workers
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-blue-200 font-semibold px-3 py-1">
                    {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'} found
                  </Badge>
                  {isRefreshing && (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Updating...
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-4 py-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as SortOption)}
                    className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="experience">Most Experience</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRefreshing(true);
                    fetchWorkers();
                  }}
                  disabled={isRefreshing}
                  className="gap-2 border-2 rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <Card className="border-2 border-red-200 bg-red-50 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 mb-1">Error Loading Workers</h3>
                      <p className="text-sm text-red-700 mb-3">{error}</p>
                      <Button
                        onClick={() => fetchWorkers()}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!error && filteredWorkers.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="py-20 text-center">
                  <div className="h-24 w-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Workers Found
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {activeFilterCount > 0
                      ? 'No workers match your current filters. Try adjusting your search criteria.'
                      : 'No workers are currently available in our database. Please check back later.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {activeFilterCount > 0 && (
                      <Button 
                        onClick={clearFilters}
                        className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
                        size="lg"
                      >
                        <X className="h-4 w-4" />
                        Clear All Filters
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => fetchWorkers()}
                      className="rounded-xl border-2"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-4'
                }>
                  {filteredWorkers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} viewMode={viewMode} />
                  ))}
                </div>
                
                {/* Load More - if you implement pagination */}
                {filteredWorkers.length >= 50 && (
                  <div className="mt-12 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Showing {filteredWorkers.length} of {totalCount} workers
                    </p>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-10 py-6 border-2 border-dashed hover:border-solid rounded-2xl group"
                    >
                      <ChevronRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Load More Workers
                    </Button>
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

// Enhanced Worker Card Component
function WorkerCard({ worker, viewMode }: { worker: WorkerProfile; viewMode: ViewMode }) {
  const router = useRouter();
  const [showContactModal, setShowContactModal] = useState(false);

  const getAvailabilityColor = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300';
      case 'part_time': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300';
      case 'available': return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-300';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability?.toLowerCase()) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'available': return 'Available Now';
      default: return 'Not Specified';
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return (
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white ring-2 ring-green-100 z-10">
            <Shield className="h-5 w-5 text-white" />
          </div>
        );
      case 'pending':
        return (
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white ring-2 ring-yellow-100 z-10">
            <Clock className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const isPremium = worker.subscription_tier === 'premium' || worker.subscription_tier === 'enterprise';

  return (
    <>
      <Card className={`group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300 ${viewMode === 'grid' ? 'hover:scale-[1.02]' : ''} rounded-2xl ${isPremium ? 'ring-2 ring-amber-200' : ''}`}>
        <CardContent className="p-6">
          <div className={`flex ${viewMode === 'list' ? 'items-center' : 'flex-col'} gap-4`}>
            {/* Profile Image */}
            <div className="relative group/profile flex-shrink-0">
              <div className={`${viewMode === 'grid' ? 'h-20 w-20' : 'h-16 w-16'} rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ${viewMode === 'grid' ? 'text-2xl' : 'text-xl'} shadow-xl group-hover/profile:scale-110 transition-transform duration-300`}>
                {worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'D'}
              </div>
              {getVerificationBadge(worker.verification_status)}
              {isPremium && (
                <div className="absolute -bottom-1 -left-1 h-7 w-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <Crown className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Worker Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate cursor-pointer hover:underline"
                      onClick={() => router.push(`/workers/${worker.id}`)}>
                    {worker.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-semibold bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 border border-blue-200">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {worker.profession || 'Worker'}
                    </Badge>
                    {isPremium && (
                      <Badge className="text-xs font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-300">
                        <Flame className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-sm">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span className="font-bold text-gray-900">{worker.rating_average || '0.0'}</span>
                  <span className="text-gray-600 text-sm">({worker.total_reviews || 0})</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Location */}
                {worker.city && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="truncate font-medium">
                      {worker.city}{worker.district ? `, ${worker.district}` : ''}
                    </span>
                  </div>
                )}

                {/* Experience */}
                {worker.experience_years > 0 && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Award className="h-4 w-4 mr-2 flex-shrink-0 text-green-500" />
                    <span className="font-medium">{worker.experience_years} years of experience</span>
                  </div>
                )}

                {/* Availability */}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <Badge className={`text-xs font-bold border ${getAvailabilityColor(worker.availability)}`}>
                    {getAvailabilityText(worker.availability)}
                  </Badge>
                </div>

                {/* Skills */}
                {worker.skills && worker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {worker.skills.slice(0, viewMode === 'grid' ? 3 : 5).map((skill, index) => (
                      <span
                        key={skill.id || index}
                        className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        {skill.skill_name}
                      </span>
                    ))}
                    {worker.skills.length > (viewMode === 'grid' ? 3 : 5) && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                        +{worker.skills.length - (viewMode === 'grid' ? 3 : 5)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`flex gap-3 mt-4 pt-4 border-t border-gray-100 ${viewMode === 'list' ? 'flex-row' : 'flex-col sm:flex-row'}`}>
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 rounded-xl transition-all group/btn border-2"
                  onClick={() => router.push(`/workers/${worker.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  View Profile
                </Button>
                
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl rounded-xl transition-all group/btn"
                  onClick={() => setShowContactModal(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Contact
                </Button>
              </div>
            </div>
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
            trust_score: worker.trust_score,
            profile_photo_url: worker.profile_photo_url,
            email: worker.email,
            phone: worker.phone,
            skills: worker.skills.map(skill => ({
              skill_name: skill.skill_name,
              proficiency_level: skill.proficiency_level
            }))
          }}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </>
  );
}