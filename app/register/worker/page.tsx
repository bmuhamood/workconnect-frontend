// app/register/worker/page.tsx - FIXED WITH PROPER FIELD VALIDATION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  User, Mail, Phone, Lock, Calendar, MapPin, Briefcase, Award, 
  AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle, Sparkles,
  Shield, Zap, Target, Star, Building, Users, Wallet, Clock,
  TrendingUp, BadgeCheck, FileText, Key, Smartphone, Fingerprint,
  Globe, BookOpen, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

const SKILLS_LIST = [
  'Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter',
  'Welder', 'Driver', 'Cleaner', 'Gardener', 'Cook',
  'Waiter', 'Security Guard', 'Receptionist', 'Secretary',
  'Accountant', 'Teacher', 'Nurse', 'Technician', 'Mechanic',
  'Tailor', 'Hairdresser', 'Barber', 'Babysitter', 'Housekeeper'
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', icon: Clock },
  { value: 'unavailable', label: 'Unavailable', icon: AlertCircle },
  { value: 'on_assignment', label: 'On Assignment', icon: Briefcase },
  { value: 'full_time', label: 'Full Time', icon: Clock },
  { value: 'part_time', label: 'Part Time', icon: Calendar },
  { value: 'flexible', label: 'Flexible', icon: Zap },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
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

export default function WorkerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [formData, setFormData] = useState({
    // User fields
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    
    // WorkerProfile fields
    national_id: '',
    date_of_birth: '',
    gender: '',
    city: '',
    district: '',
    location_lat: '',
    location_lng: '',
    bio: '',
    profession: '',
    experience_years: '0',
    education_level: '',
    hourly_rate: '',
    availability: 'available',
    expected_salary_min: '',
    expected_salary_max: '',
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Contact & Location', icon: MapPin },
    { number: 3, title: 'Professional Info', icon: Briefcase },
    { number: 4, title: 'Skills & Languages', icon: BookOpen },
    { number: 5, title: 'Account Security', icon: Lock }
  ];

  useEffect(() => {
    setProgress((currentStep / steps.length) * 100);
  }, [currentStep]);

const validateStep = (step: number) => {
  const newErrors: Record<string, string> = {};

  switch (step) {
    case 1:
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.national_id.trim()) newErrors.national_id = 'National ID is required';
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      
      // Validate age (must be at least 18)
      if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear(); // 🔴 FIXED: Changed from const to let
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          age--; // Now this works
        }
        if (age < 18) {
          newErrors.date_of_birth = 'You must be at least 18 years old';
        }
      }
      break;
      
    case 2:
      if (!formData.email.includes('@') || !formData.email.includes('.')) {
        newErrors.email = 'Please enter a valid email address';
      }
      const phoneRegex = /^(?:\+256|0|256)?[0-9]{9,10}$/;
      const cleanPhone = formData.phone.replace(/\s+/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Enter a valid Uganda phone number (e.g., 0756123456)';
      }
      if (!formData.city.trim()) newErrors.city = 'City is required';
      break;
      
    case 3:
      if (!formData.profession.trim()) newErrors.profession = 'Profession is required';
      const expYears = parseInt(formData.experience_years);
      if (isNaN(expYears) || expYears < 0 || expYears > 50) {
        newErrors.experience_years = 'Experience must be between 0-50 years';
      }
      if (!formData.education_level) newErrors.education_level = 'Education level is required';
      if (!formData.hourly_rate) {
        newErrors.hourly_rate = 'Hourly rate is required';
      } else {
        const rate = parseFloat(formData.hourly_rate);
        if (isNaN(rate) || rate < 0) {
          newErrors.hourly_rate = 'Please enter a valid hourly rate';
        }
      }
      break;
      
    case 4:
      if (selectedSkills.length === 0) {
        newErrors.skills = 'Please select at least one skill';
      }
      break;
      
    case 5:
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
      break;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

// In handleSubmit function - FIXED skills format

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateStep(5)) {
    toast.error('Please fix the errors in the form');
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    // Format phone number to E.164 format
    let formattedPhone = formData.phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '+256' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('256') && formattedPhone.length === 12) {
      formattedPhone = '+' + formattedPhone;
    } else if (formattedPhone.length === 9 && !isNaN(Number(formattedPhone))) {
      formattedPhone = '+256' + formattedPhone;
    }

    // 🔴 FIXED: Send skills as a comma-separated string
    const skillsString = selectedSkills.join(', ');

    // Prepare languages as array (this is correct - languages is JSON field)
    const languages = selectedLanguages;

    const dataToSend = {
      // User fields
      email: formData.email.toLowerCase().trim(),
      phone: formattedPhone,
      password: formData.password,
      confirm_password: formData.confirm_password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      
      // WorkerProfile fields
      national_id: formData.national_id.toUpperCase().trim(),
      date_of_birth: formData.date_of_birth,
      gender: formData.gender || 'prefer_not_to_say',
      city: formData.city.trim(),
      district: formData.district.trim() || null,
      location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
      location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
      bio: formData.bio.trim() || null,
      profession: formData.profession.trim(),
      experience_years: parseInt(formData.experience_years) || 0,
      education_level: formData.education_level,
      languages: languages, // This is correct as array for JSON field
      additional_skills: skillsString, // 🔴 FIXED: Send as comma-separated string
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      availability: formData.availability,
      expected_salary_min: formData.expected_salary_min ? parseInt(formData.expected_salary_min) : null,
      expected_salary_max: formData.expected_salary_max ? parseInt(formData.expected_salary_max) : null,
    };

    console.log('Sending registration data:', JSON.stringify(dataToSend, null, 2));

    // 🔴 FIXED: Use the correct endpoint from your Swagger
    const response = await api.post('/users/auth/register/worker/', dataToSend);
    
    if (response.status === 201 || response.status === 200) {
      toast.success('🎉 Registration successful! Please verify your phone number.');
      
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user_id', response.data.user_id);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      // Redirect to phone verification
      router.push(`/auth/verify-phone?phone=${encodeURIComponent(formattedPhone)}&email=${encodeURIComponent(formData.email)}`);
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    
    if (err.response) {
      const errorData = err.response.data;
      const newErrors: Record<string, string> = {};
      
      if (typeof errorData === 'object') {
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            newErrors[key] = errorData[key][0];
          } else if (typeof errorData[key] === 'string') {
            newErrors[key] = errorData[key];
          }
        });
      }
      
      setErrors(newErrors);
      
      // Show specific error messages
      if (Object.keys(newErrors).length > 0) {
        Object.keys(newErrors).forEach(key => {
          toast.error(`${key}: ${newErrors[key]}`);
        });
      } else if (typeof errorData === 'string') {
        toast.error(errorData);
      } else {
        toast.error('Registration failed. Please check your information.');
      }
    } else if (err.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An error occurred. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
    if (errors.skills) {
      setErrors({
        ...errors,
        skills: '',
      });
    }
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-amber-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ... (keep your existing background and styling) ... */}

      <div className="w-full max-w-6xl">
        {/* Back Button */}
        <Link href="/register" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group relative">
          <div className="absolute -inset-2 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="font-medium relative z-10">Back to account selection</span>
        </Link>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Gradient Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-amber-600"></div>
          
          <CardHeader className="pb-6 pt-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-amber-600 flex items-center justify-center shadow-xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Worker <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">Registration</span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl">
                Create your worker account to start finding job opportunities. Complete all steps to get verified!
              </CardDescription>
            </div>

            {/* Progress Bar & Steps */}
            <div className="mt-8">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-4">
                {steps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-r from-blue-600 to-amber-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-8">
            {/* Benefits Banner */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Why Get Verified?</h4>
                    <p className="text-gray-600 text-sm">Verified workers get 3x more job opportunities!</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">95%</div>
                    <div className="text-xs text-gray-600">Hire Rate</div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">48h</div>
                    <div className="text-xs text-gray-600">Avg. Response</div>
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mb-8 animate-in slide-in-from-top duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  Please fix the errors before {currentStep === steps.length ? 'submitting' : 'continuing'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={currentStep === steps.length ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="first_name" className="font-semibold text-gray-700">
                        First Name *
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.first_name ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="John"
                        />
                      </div>
                      {errors.first_name && <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="last_name" className="font-semibold text-gray-700">
                        Last Name *
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.last_name ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="national_id" className="font-semibold text-gray-700">
                        National ID *
                      </Label>
                      <div className="relative group">
                        <Fingerprint className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="national_id"
                          name="national_id"
                          value={formData.national_id}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.national_id ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="CF123456789012XYZ"
                        />
                      </div>
                      {errors.national_id && <p className="text-sm text-red-500 mt-1">{errors.national_id}</p>}
                      <p className="text-xs text-gray-500 mt-1">Used for verification only. Your data is secure.</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="date_of_birth" className="font-semibold text-gray-700">
                        Date of Birth *
                      </Label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          id="date_of_birth"
                          name="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          required
                          max={new Date().toISOString().split('T')[0]}
                          min="1900-01-01"
                          className={`pl-10 py-6 text-base rounded-xl ${errors.date_of_birth ? 'border-red-500' : 'border-gray-200'}`}
                        />
                      </div>
                      {errors.date_of_birth ? (
                        <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Must be at least 18 years old</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="gender" className="font-semibold text-gray-700">
                      Gender
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange('gender', value)}
                    >
                      <SelectTrigger className="py-6 text-base rounded-xl">
                        <SelectValue placeholder="Select gender (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Location Information */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Contact & Location</h3>
                      <p className="text-gray-600">How can employers reach you?</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="font-semibold text-gray-700">
                          Email Address *
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={`pl-10 py-6 text-base rounded-xl ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="you@example.com"
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="font-semibold text-gray-700">
                          Phone Number *
                        </Label>
                        <div className="relative group">
                          <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className={`pl-10 py-6 text-base rounded-xl ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="0756123456"
                          />
                        </div>
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                        <p className="text-xs text-gray-500 mt-1">Used for verification and job alerts</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="font-semibold text-gray-700">
                          City/Town *
                        </Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className={`pl-10 py-6 text-base rounded-xl ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
                            placeholder="Kampala"
                          />
                        </div>
                        {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="district" className="font-semibold text-gray-700">
                          District
                        </Label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                          <Input
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="pl-10 py-6 text-base rounded-xl border-gray-200"
                            placeholder="Central"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="location_lat" className="font-semibold text-gray-700">
                          Latitude (Optional)
                        </Label>
                        <Input
                          id="location_lat"
                          name="location_lat"
                          type="number"
                          step="0.00000001"
                          value={formData.location_lat}
                          onChange={handleChange}
                          className="py-6 text-base rounded-xl border-gray-200"
                          placeholder="0.3136"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="location_lng" className="font-semibold text-gray-700">
                          Longitude (Optional)
                        </Label>
                        <Input
                          id="location_lng"
                          name="location_lng"
                          type="number"
                          step="0.00000001"
                          value={formData.location_lng}
                          onChange={handleChange}
                          className="py-6 text-base rounded-xl border-gray-200"
                          placeholder="32.5811"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Contact Privacy</h4>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Your phone number is only shared with employers after you accept a job
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          We never share your email with third parties
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          Your location helps employers find workers near them
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Professional Information */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/20 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Professional Information</h3>
                      <p className="text-gray-600">Showcase your skills and experience</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="profession" className="font-semibold text-gray-700">
                        Profession *
                      </Label>
                      <div className="relative group">
                        <Target className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="profession"
                          name="profession"
                          value={formData.profession}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.profession ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="Electrician"
                        />
                      </div>
                      {errors.profession && <p className="text-sm text-red-500 mt-1">{errors.profession}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="experience_years" className="font-semibold text-gray-700">
                        Years of Experience *
                      </Label>
                      <div className="relative group">
                        <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="experience_years"
                          name="experience_years"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.experience_years}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.experience_years ? 'border-red-500' : 'border-gray-200'}`}
                        />
                      </div>
                      {errors.experience_years && <p className="text-sm text-red-500 mt-1">{errors.experience_years}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="education_level" className="font-semibold text-gray-700">
                      Education Level *
                    </Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => handleSelectChange('education_level', value)}
                    >
                      <SelectTrigger className={`py-6 text-base rounded-xl ${errors.education_level ? 'border-red-500' : 'border-gray-200'}`}>
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
                    {errors.education_level && <p className="text-sm text-red-500 mt-1">{errors.education_level}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="hourly_rate" className="font-semibold text-gray-700">
                        Hourly Rate (UGX) *
                      </Label>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="hourly_rate"
                          name="hourly_rate"
                          type="number"
                          min="0"
                          step="1000"
                          value={formData.hourly_rate}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.hourly_rate ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="10000"
                        />
                      </div>
                      {errors.hourly_rate && <p className="text-sm text-red-500 mt-1">{errors.hourly_rate}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="availability" className="font-semibold text-gray-700">
                        Availability *
                      </Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => handleSelectChange('availability', value)}
                      >
                        <SelectTrigger className="py-6 text-base rounded-xl">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center">
                                <option.icon className="h-4 w-4 mr-2" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">
                      Bio (Optional)
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="py-4 text-base rounded-xl border-gray-200"
                      placeholder="Tell employers about yourself, your experience, and what makes you a great worker..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Skills & Languages */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Skills & Languages</h3>
                      <p className="text-gray-600">Tell us about your abilities</p>
                    </div>
                  </div>

<div className="space-y-3">
  <Label className="font-semibold text-gray-700">
    Skills (Select at least one) *
  </Label>
  <div className="flex flex-wrap gap-3">
    {SKILLS_LIST.map(skill => (
      <button
        key={skill}
        type="button"
        onClick={() => toggleSkill(skill)}
        className={`group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
          selectedSkills.includes(skill)
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 hover:scale-[1.02]'
        }`}
      >
        {skill}
        {selectedSkills.includes(skill) && (
          <CheckCircle className="h-3 w-3 inline ml-1" />
        )}
      </button>
    ))}
  </div>
  {errors.skills && <p className="text-sm text-red-500 mt-1">{errors.skills}</p>}
  
  {/* Show preview of how skills will be saved */}
  {selectedSkills.length > 0 && (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <p className="text-xs font-medium text-blue-700 mb-1">Skills will be saved as:</p>
      <p className="text-sm text-gray-700">{selectedSkills.join(', ')}</p>
    </div>
  )}
  
  <p className="text-xs text-gray-500 mt-2">
    Select relevant skills to get better job matches
  </p>
</div>

                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">
                      Languages Spoken
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {LANGUAGES.map(language => (
                        <button
                          key={language}
                          type="button"
                          onClick={() => toggleLanguage(language)}
                          className={`group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                            selectedLanguages.includes(language)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
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
                    <p className="text-xs text-gray-500 mt-2">
                      Select all languages you can communicate in
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="expected_salary_min" className="font-semibold text-gray-700">
                        Expected Salary Min (UGX)
                      </Label>
                      <Input
                        id="expected_salary_min"
                        name="expected_salary_min"
                        type="number"
                        min="0"
                        step="50000"
                        value={formData.expected_salary_min}
                        onChange={handleChange}
                        className="py-6 text-base rounded-xl border-gray-200"
                        placeholder="500000"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="expected_salary_max" className="font-semibold text-gray-700">
                        Expected Salary Max (UGX)
                      </Label>
                      <Input
                        id="expected_salary_max"
                        name="expected_salary_max"
                        type="number"
                        min="0"
                        step="50000"
                        value={formData.expected_salary_max}
                        onChange={handleChange}
                        className="py-6 text-base rounded-xl border-gray-200"
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Account Security */}
              {currentStep === 5 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/20 flex items-center justify-center">
                      <Key className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                      <p className="text-gray-600">Secure your account with a strong password</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="password" className="font-semibold text-gray-700">
                        Password *
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className={`pl-10 pr-12 py-6 text-base rounded-xl ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="confirm_password" className="font-semibold text-gray-700">
                        Confirm Password *
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                          className={`pl-10 pr-12 py-6 text-base rounded-xl ${errors.confirm_password ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="Re-enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirm_password && <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-5 w-5 text-red-600" />
                      <h4 className="font-bold text-gray-900">Password Tips</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Use at least 8 characters
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Include at least one uppercase letter
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Include at least one number
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Avoid common words or personal info
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h4 className="font-bold text-gray-900">Terms & Privacy</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      By creating an account, you agree to our Terms of Service and Privacy Policy. 
                      Your data will be securely stored and only used to connect you with job opportunities.
                    </p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">I agree to the terms and conditions</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isLoading}
                  className="px-8 py-6 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep === steps.length ? (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group relative bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isLoading ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent mr-3"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-3 h-5 w-5" />
                        Create Worker Account
                        <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Continue
                    <ArrowLeft className="ml-3 h-5 w-5 rotate-180" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-100 pt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                  Sign in here
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                Need help? Contact our support team
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}