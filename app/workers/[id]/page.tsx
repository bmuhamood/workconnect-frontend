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
  Loader2, X
} from 'lucide-react';
import api from '@/lib/api';
import ContactModal from '@/components/ContactModal';
import { WorkerProfile, WorkerSkill } from '@/types/worker';
import { Badge } from '@/components/ui/badge';

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
      if (filters.search.trim()) {
        fetchWorkers({ ...filters });
      } else if (filters.search === '') {
        fetchWorkers({ ...filters, search: '' });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchWorkers = useCallback(async (customFilters?: Partial<FilterState>) => {
    try {
      setIsLoading(true);

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

      // Try different endpoints based on your backend setup
      let response;
      try {
        response = await api.get('/api/users/workers/', { params });
      } catch (error) {
        console.log('Public endpoint failed, trying admin endpoint...');
        response = await api.get('/admin/workers/', { params });
      }

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
      
      // Mock data for development
      const mockWorkers = generateMockWorkers();
      setWorkers(mockWorkers);
      setFilteredWorkers(mockWorkers);
      setTotalCount(mockWorkers.length);
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

  // Mock data generator for development
  const generateMockWorkers = (): WorkerProfile[] => {
    const cities = ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Lira', 'Mbale'];
    const professions = ['Housekeeper', 'Nanny', 'Cook', 'Gardener', 'Driver', 'Security Guard'];
    const skills = [
      { skill_name: 'Cooking', proficiency_level: 'advanced' as const },
      { skill_name: 'Cleaning', proficiency_level: 'expert' as const },
      { skill_name: 'Child Care', proficiency_level: 'intermediate' as const },
      { skill_name: 'Driving', proficiency_level: 'expert' as const },
    ];

    return Array.from({ length: 12 }, (_, i) => ({
      id: `mock-worker-${i}`,
      first_name: `Worker${i + 1}`,
      last_name: 'Demo',
      full_name: `Worker${i + 1} Demo`,
      city: cities[i % cities.length],
      district: ['Central', 'North', 'South', 'East'][i % 4],
      experience_years: Math.floor(Math.random() * 20),
      profession: professions[i % professions.length],
      rating_average: (Math.random() * 2 + 3).toFixed(1),
      total_reviews: Math.floor(Math.random() * 50),
      verification_status: i % 3 === 0 ? 'verified' : i % 3 === 1 ? 'pending' : 'rejected',
      trust_score: Math.floor(Math.random() * 30 + 70),
      availability: ['available', 'full_time', 'part_time', 'busy'][i % 4] as any,
      hourly_rate: (Math.random() * 20 + 5).toFixed(2),
      profile_photo_url: '',
      email: `worker${i + 1}@example.com`,
      phone: `+2567${Math.floor(10000000 + Math.random() * 90000000)}`,
      additional_skills: 'Communication, Organization, First Aid',
      gender: i % 2 === 0 ? 'male' : 'female',
      bio: 'Experienced professional with proven track record.',
      date_of_birth: '1990-01-01',
      age: '34',
      national_id: `CM${Math.floor(1000000 + Math.random() * 9000000)}`,
      education_level: ['Primary', 'Secondary', 'Diploma'][i % 3],
      languages: { English: 'fluent', Luganda: 'basic' },
      expected_salary_min: 300000,
      expected_salary_max: 600000,
      total_placements: Math.floor(Math.random() * 10),
      subscription_tier: i % 3 === 0 ? 'premium' : i % 3 === 1 ? 'enterprise' : 'free',
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      skills: skills.slice(0, Math.floor(Math.random() * 3) + 1).map((skill, idx) => ({
        id: `skill-${i}-${idx}`,
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level,
        category: 'Domestic',
        category_name: 'Domestic',
        years_of_experience: Math.floor(Math.random() * 10),
        is_primary: idx === 0,
        created_at: new Date().toISOString(),
      })),
      documents: [],
      references: [],
    }));
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
                className="pl-12 py-6 text-lg rounded-xl border-0 focus:ring-2 focus:ring-white"
              />
            </div>

            {/* Filter Toggle Button for Mobile */}
            <div className="flex justify-center mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-white/20 hover:bg-white/30 text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              {filters.city && (
                <Badge variant="secondary" className="gap-1">
                  City: {filters.city}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearSingleFilter('city')}
                  />
                </Badge>
              )}
              {filters.profession && (
                <Badge variant="secondary" className="gap-1">
                  Profession: {filters.profession}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearSingleFilter('profession')}
                  />
                </Badge>
              )}
              {filters.minExperience > 0 && (
                <Badge variant="secondary" className="gap-1">
                  Min Exp: {filters.minExperience}yrs
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearSingleFilter('minExperience')}
                  />
                </Badge>
              )}
              {filters.availability && filters.availability !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {getAvailabilityText(filters.availability)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearSingleFilter('availability')}
                  />
                </Badge>
              )}
              {filters.verification && filters.verification !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.verification === 'verified' ? 'Verified Only' : 'Pending Verification'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearSingleFilter('verification')}
                  />
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Always visible on desktop, conditionally on mobile */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-8 border-2 border-blue-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {activeFilterCount > 0 && (
                  <CardDescription className="text-blue-600">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    placeholder="e.g., Kampala, Entebbe"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession
                  </label>
                  <Input
                    placeholder="e.g., Electrician, Housekeeper"
                    value={filters.profession}
                    onChange={(e) => handleFilterChange('profession', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Min Experience
                    </label>
                    <span className="text-sm font-medium text-blue-600">
                      {filters.minExperience} years
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">0</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={filters.minExperience}
                      onChange={(e) => handleFilterChange('minExperience', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">30+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'full_time', label: 'Full Time' },
                      { value: 'part_time', label: 'Part Time' },
                      { value: 'available', label: 'Available' },
                      { value: 'busy', label: 'Busy' },
                      { value: 'on_leave', label: 'On Leave' },
                      { value: '', label: 'All' },
                    ].map((option) => (
                      <Button
                        key={option.value || 'all'}
                        type="button"
                        variant={filters.availability === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('availability', option.value)}
                        className={filters.availability === option.value 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : ""}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Workers', color: 'bg-gray-100' },
                      { value: 'verified', label: 'Verified Only', color: 'bg-green-100' },
                      { value: 'pending', label: 'Pending', color: 'bg-yellow-100' },
                      { value: 'rejected', label: 'Rejected', color: 'bg-red-100' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center p-2 rounded-lg cursor-pointer ${filters.verification === option.value ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleFilterChange('verification', option.value)}
                      >
                        <div className={`h-4 w-4 rounded-full mr-3 ${option.color}`}></div>
                        <span className="text-sm">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full"
                    disabled={activeFilterCount === 0}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6 border-2 border-blue-50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100">
                  <span className="text-gray-700 font-medium">Total Workers</span>
                  <span className="font-bold text-gray-900 text-lg">{totalCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100">
                  <span className="text-gray-700 font-medium">Verified Workers</span>
                  <span className="font-bold text-green-600 text-lg">
                    {workers.filter(w => w.verification_status === 'verified').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-100">
                  <span className="text-gray-700 font-medium">Avg. Rating</span>
                  <span className="font-bold text-amber-600 text-lg">
                    {workers.length > 0 
                      ? (workers.reduce((sum, w) => sum + parseFloat(w.rating_average || '0'), 0) / workers.length).toFixed(1)
                      : '0.0'}★
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
                  <span className="text-gray-700 font-medium">Active Now</span>
                  <span className="font-bold text-purple-600 text-lg">
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

          {/* Workers Grid */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Workers
                </h2>
                <p className="text-gray-600">
                  Showing {filteredWorkers.length} of {totalCount} workers
                  {isRefreshing && (
                    <span className="ml-2 text-sm text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      Updating...
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fetchWorkers()}
                  disabled={isRefreshing}
                  className="gap-2"
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
                  className="lg:hidden gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </div>
            </div>

            {filteredWorkers.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-200">
                <CardContent className="py-16 text-center">
                  <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No workers found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {filters.city || filters.profession || filters.search
                      ? 'No workers match your current filters. Try adjusting your search criteria.'
                      : 'No workers are currently available. Check back soon!'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={clearFilters}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/')}
                    >
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWorkers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>
                
                {/* Load More Button if needed */}
                {filteredWorkers.length < totalCount && (
                  <div className="mt-10 text-center">
                    <Button
                      onClick={() => {
                        // Implement load more functionality
                        console.log('Load more clicked');
                      }}
                      variant="outline"
                      size="lg"
                      className="px-8 py-6 border-2 border-dashed hover:border-solid"
                    >
                      <ChevronRight className="h-4 w-4 mr-2" />
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

// Worker Card Component
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
          <div className="absolute -top-1 -right-1 h-7 w-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Shield className="h-3 w-3 text-white" />
          </div>
        );
      case 'pending':
        return (
          <div className="absolute -top-1 -right-1 h-7 w-7 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Clock className="h-3 w-3 text-white" />
          </div>
        );
      case 'rejected':
        return (
          <div className="absolute -top-1 -right-1 h-7 w-7 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <XCircle className="h-3 w-3 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-200 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Profile Image */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {worker.first_name?.[0] || 'W'}{worker.last_name?.[0] || 'D'}
              </div>
              {getVerificationStatus(worker.verification_status)}
            </div>

            {/* Worker Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {worker.full_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate">
                      {worker.profession || 'Worker'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Star className="h-4 w-4 text-amber-400 fill-current" />
                  <span className="font-bold text-gray-900">
                    {worker.rating_average || '0.0'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({worker.total_reviews || 0})
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {/* Location */}
                {worker.city && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {worker.city}{worker.district ? `, ${worker.district}` : ', Uganda'}
                    </span>
                  </div>
                )}

                {/* Experience */}
                {worker.experience_years > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{worker.experience_years} years experience</span>
                  </div>
                )}

                {/* Availability */}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(worker.availability)}`}>
                    {getAvailabilityText(worker.availability)}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {worker.skills?.slice(0, 3).map((skill, index) => (
                    <span
                      key={skill.id || index}
                      className="px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs rounded-full border border-blue-200"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                  {worker.skills && worker.skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{worker.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => router.push(`/workers/${worker.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setShowContactModal(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
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