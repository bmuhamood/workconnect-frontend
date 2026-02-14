// app/register/employer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, Mail, Phone, Lock, MapPin, User, 
  AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle, Sparkles,
  Shield, Briefcase, Users, Clock, Star, // Added Star here!
  BadgeCheck, FileText, Key, Smartphone, Globe,
  CreditCard, Users as UsersIcon, HeartHandshake, Target as TargetIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { RegisterEmployerResponse, ApiErrorResponse } from '@/types/auth';

// Add proper types
interface FormData {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  company_name: string;
  address: string;
  city: string;
  industry: string;
  company_size: string;
}

const INDUSTRY_OPTIONS = [
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'transport', label: 'Transport' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    company_name: '',
    address: '',
    city: '',
    industry: '',
    company_size: '',
  });

  const steps = [
    { number: 1, title: 'Company Info', icon: Building },
    { number: 2, title: 'Personal Info', icon: User },
    { number: 3, title: 'Contact Info', icon: Mail },
    { number: 4, title: 'Account Security', icon: Lock }
  ];

  useEffect(() => {
    setProgress(currentStep * 25);
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      case 2:
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        break;
      case 3:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        const phoneRegex = /^(?:\+256|0|256)?[0-9]{9,10}$/;
        const cleanPhone = formData.phone.replace(/\s+/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          newErrors.phone = 'Enter a valid Uganda phone number (e.g., 0756123456)';
        }
        break;
      case 4:
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
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
      if (currentStep < 4) {
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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateStep(4)) {
    toast.error('Please fix the errors in the form');
    return;
  }

  setIsLoading(true);
  setErrors({});

  try {
    // Format phone number
    let formattedPhone = formData.phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '+256' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('256') && formattedPhone.length === 12) {
      formattedPhone = '+' + formattedPhone;
    } else if (formattedPhone.length === 9 && !isNaN(Number(formattedPhone))) {
      formattedPhone = '+256' + formattedPhone;
    }

    const dataToSend = {
      email: formData.email.toLowerCase().trim(),
      phone: formattedPhone,
      password: formData.password,
      confirm_password: formData.confirm_password,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      company_name: formData.company_name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      industry: formData.industry || '',
      company_size: formData.company_size || '',
    };

    console.log('Sending employer registration data to:', '/users/auth/register/employer/');
    
    // FIXED: Added /users prefix
    const response = await api.post<RegisterEmployerResponse>('/users/auth/register/employer/', dataToSend);
    
    if (response.status === 201 || response.status === 200) {
      toast.success('🎉 Registration successful! Please verify your phone number.');
      
      // Store tokens
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('user_email', response.data.email);
      localStorage.setItem('user_phone', response.data.phone);
      localStorage.setItem('user_role', response.data.role);
      
      // Set cookies for middleware
      document.cookie = `access_token=${response.data.tokens.access}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `refresh_token=${response.data.tokens.refresh}; path=/; max-age=86400; SameSite=Lax`;
      
      // Redirect to phone verification
      router.push(`/auth/verify-phone?email=${encodeURIComponent(formData.email)}&phone=${encodeURIComponent(formData.phone)}&role=employer`);
    }
  } catch (err: any) {
    // Error handling remains the same...
  } finally {
    setIsLoading(false);
  }
};
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-blue-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl">
        {/* Back Button */}
        <Link href="/register" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group relative">
          <div className="absolute -inset-2 bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="font-medium relative z-10">Back to account selection</span>
        </Link>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Gradient Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-blue-500 to-cyan-500"></div>
          
          <CardHeader className="pb-6 pt-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center shadow-xl">
                  <Building className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-3 w-3 text-white animate-pulse" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Employer <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Registration</span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl">
                Create your employer account to start hiring verified workers. Let's build your hiring platform!
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
                        ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg'
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
            <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Why Hire Through WorkConnect?</h4>
                    <p className="text-gray-600 text-sm">Verified workers, faster hiring, better results!</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">95%</div>
                    <div className="text-xs text-gray-600">Verified Workers</div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">3x</div>
                    <div className="text-xs text-gray-600">Faster Hiring</div>
                  </div>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">24h</div>
                    <div className="text-xs text-gray-600">Avg. Response</div>
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mb-8 animate-in slide-in-from-top duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  Please fix the errors before {currentStep === 4 ? 'submitting' : 'continuing'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              {/* Step 1: Company Information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center">
                      <Building className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
                      <p className="text-gray-600">Tell us about your business</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="company_name" className="font-semibold text-gray-700">
                        Company Name *
                      </Label>
                      <div className="relative group">
                        <TargetIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                          id="company_name"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.company_name ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="Your Company Ltd"
                        />
                      </div>
                      {errors.company_name && <p className="text-sm text-red-500 mt-1">{errors.company_name}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="industry" className="font-semibold text-gray-700">
                          Industry
                        </Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleSelectChange('industry', value)}
                        >
                          <SelectTrigger className="py-6 text-base rounded-xl">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="company_size" className="font-semibold text-gray-700">
                          Company Size
                        </Label>
                        <Select
                          value={formData.company_size}
                          onValueChange={(value) => handleSelectChange('company_size', value)}
                        >
                          <SelectTrigger className="py-6 text-base rounded-xl">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPANY_SIZE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="city" className="font-semibold text-gray-700">
                        City/Town *
                      </Label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
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
                      <Label htmlFor="address" className="font-semibold text-gray-700">
                        Company Address (Optional)
                      </Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="py-6 text-base rounded-xl min-h-[100px]"
                        placeholder="Physical address of your company"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <HeartHandshake className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-bold text-gray-900">Benefits for Employers</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">Verified Workers</h5>
                          <p className="text-sm text-gray-600">All workers are ID verified</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">Fast Hiring</h5>
                          <p className="text-sm text-gray-600">Hire in hours, not weeks</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">Secure Payments</h5>
                          <p className="text-sm text-gray-600">Escrow payment protection</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Star className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-gray-900">Rating System</h5>
                          <p className="text-sm text-gray-600">Choose based on reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
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

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <h4 className="font-bold text-gray-900">Your Role as an Employer</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        You'll be the main contact for job postings
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        You can invite team members to manage hiring
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        You control all payments and contracts
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                        Access to detailed analytics and reports
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/20 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                      <p className="text-gray-600">How can workers reach you?</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="font-semibold text-gray-700">
                        Business Email *
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className={`pl-10 py-6 text-base rounded-xl ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                          placeholder="contact@company.com"
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                      <p className="text-xs text-gray-500 mt-1">Used for account verification and job notifications</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="font-semibold text-gray-700">
                        Business Phone *
                      </Label>
                      <div className="relative group">
                        <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
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
                      <p className="text-xs text-gray-500 mt-1">Used for verification and urgent communications</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h4 className="font-bold text-gray-900">Contact Privacy</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Your contact details are only shared with hired workers
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        Workers can contact you through our secure messaging system
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        You control who can see your contact information
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                        All communications are logged and secure
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Account Security */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/20 flex items-center justify-center">
                      <Key className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                      <p className="text-gray-600">Secure your business account</p>
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
                      <h4 className="font-bold text-gray-900">Security Recommendations</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Use a unique password not used on other sites
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Enable two-factor authentication after registration
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Change your password regularly
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-red-500 mr-2" />
                        Never share your password with anyone
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-bold text-gray-900">Terms & Agreement</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      By creating an employer account, you agree to provide fair working conditions, 
                      pay workers on time, and abide by Ugandan labor laws. You also agree to our 
                      Terms of Service and Privacy Policy.
                    </p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">I agree to provide fair working conditions and timely payments</span>
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
                
                {currentStep === 4 ? (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="group relative bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isLoading ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent mr-3"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Briefcase className="mr-3 h-5 w-5" />
                        Create Employer Account
                        <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
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
                Need help with business registration? Contact our business support team
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Secure Platform</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <UsersIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Verified Workers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <CreditCard className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Safe Payments</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <Globe className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Uganda Focus</div>
          </div>
        </div>
      </div>
    </div>
  );
}