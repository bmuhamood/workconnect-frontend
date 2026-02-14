// app/profile/page.tsx - COMPLETE UPDATED VERSION WITH PHOTO UPLOAD
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Mail, Phone, MapPin, Briefcase, Award, 
  Calendar, BookOpen, Languages, Upload, Save,
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  X, Plus, Star, Target, Sparkles, Shield,
  Camera, FileText, Clock, TrendingUp, Zap,
  GraduationCap, DollarSign, Globe
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';

const SKILLS_LIST = [
  'Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter',
  'Welder', 'Driver', 'Cleaner', 'Gardener', 'Cook',
  'Waiter', 'Security Guard', 'Receptionist', 'Secretary',
  'Accountant', 'Teacher', 'Nurse', 'Technician', 'Mechanic',
  'Tailor', 'Hairdresser', 'Barber', 'Babysitter', 'Housekeeper'
];

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-green-500' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-500' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available Now' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'busy', label: 'Currently Busy' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'unavailable', label: 'Not Available' },
];

const EDUCATION_LEVELS = [
  'None',
  'Primary',
  'Secondary',
  'Certificate',
  'Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Vocational Training',
  'Other'
];

const LANGUAGES = [
  'English', 'Swahili', 'Luganda', 'Runyankole', 'Acholi', 
  'Langi', 'Lugisu', 'Ateso', 'Luo', 'Arabic', 'French'
];

interface Skill {
  id?: string;
  skill_name: string;
  proficiency_level: string;
  years_of_experience: number;
  is_primary: boolean;
  category?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'basic';
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    national_id: '',
    
    // Location
    city: '',
    district: '',
    
    // Professional
    profession: '',
    experience_years: 0,
    education_level: '',
    bio: '',
    hourly_rate: '',
    availability: 'available',
    expected_salary_min: '',
    expected_salary_max: '',
    
    // New skill
    newSkill: {
      name: '',
      proficiency: 'intermediate',
      years: 0,
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      // Fetch worker profile
      const profileRes = await api.get('/users/workers/profile/me/');
      const profile = profileRes.data;
      setWorkerProfile(profile);
      
      // Set form data from profile
      setFormData({
        ...formData,
        first_name: profile.first_name || user?.first_name || '',
        last_name: profile.last_name || user?.last_name || '',
        phone: profile.phone || user?.phone || '',
        email: profile.email || user?.email || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        national_id: profile.national_id || '',
        city: profile.city || '',
        district: profile.district || '',
        profession: profile.profession || '',
        experience_years: profile.experience_years || 0,
        education_level: profile.education_level || '',
        bio: profile.bio || '',
        hourly_rate: profile.hourly_rate?.toString() || '',
        availability: profile.availability || 'available',
        expected_salary_min: profile.expected_salary_min?.toString() || '',
        expected_salary_max: profile.expected_salary_max?.toString() || '',
      });
      
      // Set skills
      if (profile.skills) {
        setSkills(profile.skills);
      }
      
      // Set languages
      if (profile.languages) {
        if (Array.isArray(profile.languages)) {
          setSelectedLanguages(profile.languages);
        } else if (typeof profile.languages === 'object') {
          setSelectedLanguages(Object.keys(profile.languages));
        }
      }
      
      // Calculate profile completion
      calculateCompletion(profile);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = (profile: any) => {
    const fields = [
      profile.first_name && profile.last_name,
      profile.phone,
      profile.email,
      profile.date_of_birth,
      profile.national_id,
      profile.city,
      profile.profession,
      profile.experience_years > 0,
      profile.education_level,
      profile.bio,
      profile.hourly_rate > 0,
      profile.skills?.length > 0,
      profile.languages && Object.keys(profile.languages).length > 0,
      profile.profile_photo_url,
    ];
    
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddSkill = () => {
    if (!formData.newSkill.name) {
      toast.error('Please enter a skill name');
      return;
    }
    
    const newSkill: Skill = {
      skill_name: formData.newSkill.name,
      proficiency_level: formData.newSkill.proficiency,
      years_of_experience: formData.newSkill.years,
      is_primary: skills.length === 0, // First skill is primary
    };
    
    setSkills([...skills, newSkill]);
    setFormData({
      ...formData,
      newSkill: { name: '', proficiency: 'intermediate', years: 0 },
    });
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleSaveBasic = async () => {
    try {
      setIsSaving(true);
      
      const profileId = workerProfile?.id;
      if (!profileId) {
        toast.error('Profile ID not found');
        return;
      }
      
      const data = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        national_id: formData.national_id,
        city: formData.city,
        district: formData.district,
      };
      
      await api.patch(`/users/workers/profile/${profileId}/`, data);
      toast.success('Basic information updated successfully');
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfessional = async () => {
    try {
      setIsSaving(true);
      
      const profileId = workerProfile?.id;
      if (!profileId) {
        toast.error('Profile ID not found');
        return;
      }
      
      const data = {
        profession: formData.profession,
        experience_years: parseInt(formData.experience_years.toString()) || 0,
        education_level: formData.education_level,
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        availability: formData.availability,
        expected_salary_min: formData.expected_salary_min ? parseInt(formData.expected_salary_min) : null,
        expected_salary_max: formData.expected_salary_max ? parseInt(formData.expected_salary_max) : null,
      };
      
      await api.patch(`/users/workers/profile/${profileId}/`, data);
      toast.success('Professional information updated successfully');
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSkills = async () => {
    try {
      setIsSaving(true);
      
      const profileId = workerProfile?.id;
      if (!profileId) {
        toast.error('Profile ID not found');
        return;
      }
      
      const data = {
        skills: skills,
        languages: selectedLanguages,
      };
      
      await api.patch(`/users/workers/profile/${profileId}/`, data);
      toast.success('Skills and languages updated successfully');
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating skills:', error);
      toast.error(error.response?.data?.detail || 'Failed to update skills');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const profileId = workerProfile?.id;
    if (!profileId) {
      toast.error('Profile ID not found');
      return;
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
      await api.post(`/users/workers/profile/${profileId}/upload_photo/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchProfile(); // Refresh profile data
      toast.success('Profile photo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
              Profile Completion: {profileCompletion}%
            </Badge>
            <Progress value={profileCompletion} className="w-32 h-2" />
          </div>
        </div>

        {/* Profile Completion Card */}
        {profileCompletion < 100 && (
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Complete Your Profile</h3>
                    <p className="text-gray-600">Add more information to get better job matches</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-lg">
                  {profileCompletion}% Complete
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Professional</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="h-6 w-6 text-blue-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo - UPDATED with ProfilePhotoUpload component */}
                <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200">
                  <ProfilePhotoUpload
                    currentPhotoUrl={workerProfile?.profile_photo_url}
                    onUpload={handlePhotoUpload}
                    uploading={isSaving}
                    workerId={workerProfile?.id}
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">Profile Photo</h3>
                    <p className="text-sm text-gray-600">Upload a professional photo to increase your chances</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="py-6 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className="py-6">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="national_id">National ID *</Label>
                    <Input
                      id="national_id"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveBasic}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 px-8"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Info Tab */}
          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Tell employers about your experience and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession *</Label>
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="py-6"
                      placeholder="e.g., Electrician, Plumber, Housekeeper"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="education_level">Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => handleSelectChange('education_level', value)}
                    >
                      <SelectTrigger className="py-6">
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate (UGX)</Label>
                    <Input
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.hourly_rate}
                      onChange={handleChange}
                      className="py-6"
                      placeholder="10000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => handleSelectChange('availability', value)}
                    >
                      <SelectTrigger className="py-6">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABILITY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary_min">Expected Salary Min (UGX)</Label>
                    <Input
                      id="expected_salary_min"
                      name="expected_salary_min"
                      type="number"
                      min="0"
                      step="50000"
                      value={formData.expected_salary_min}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expected_salary_max">Expected Salary Max (UGX)</Label>
                    <Input
                      id="expected_salary_max"
                      name="expected_salary_max"
                      type="number"
                      min="0"
                      step="50000"
                      value={formData.expected_salary_max}
                      onChange={handleChange}
                      className="py-6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About You</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={6}
                    value={formData.bio}
                    onChange={handleChange}
                    className="py-4"
                    placeholder="Tell employers about yourself, your experience, and what makes you a great worker..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveProfessional}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 px-8"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Award className="h-6 w-6 text-blue-600" />
                  Skills & Languages
                </CardTitle>
                <CardDescription>
                  Add your skills and languages to get better job matches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Skills Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Your Skills
                  </h3>
                  
                  {/* Add New Skill */}
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div>
                      <Input
                        placeholder="Skill name"
                        value={formData.newSkill.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          newSkill: { ...formData.newSkill, name: e.target.value }
                        })}
                        className="py-6"
                      />
                    </div>
                    <div>
                      <Select
                        value={formData.newSkill.proficiency}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          newSkill: { ...formData.newSkill, proficiency: value }
                        })}
                      >
                        <SelectTrigger className="py-6">
                          <SelectValue placeholder="Proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROFICIENCY_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${level.color}`} />
                                {level.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Years"
                        value={formData.newSkill.years}
                        onChange={(e) => setFormData({
                          ...formData,
                          newSkill: { ...formData.newSkill, years: parseInt(e.target.value) || 0 }
                        })}
                        className="py-6"
                      />
                      <Button
                        onClick={handleAddSkill}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-3">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-3 w-3 rounded-full ${
                            PROFICIENCY_LEVELS.find(l => l.value === skill.proficiency_level)?.color || 'bg-gray-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{skill.skill_name}</span>
                              {skill.is_primary && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Level: {skill.proficiency_level}</span>
                              <span>Experience: {skill.years_of_experience} years</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Languages className="h-5 w-5 text-blue-600" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {LANGUAGES.map(language => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className={`group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          selectedLanguages.includes(language)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:scale-[1.02]'
                        }`}
                      >
                        {language}
                        {selectedLanguages.includes(language) && (
                          <CheckCircle className="h-3 w-3 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveSkills}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 px-8"
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Save className="h-5 w-5 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Upload documents to verify your identity and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {/* Document list would go here */}
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Document management coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}