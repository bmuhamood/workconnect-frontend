// app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, Users, ArrowRight, ArrowLeft, Sparkles, 
  Shield, Star, CheckCircle, Zap, Target, Award,
  Building2, UserCheck, TrendingUp, DollarSign,
  Clock, MapPin, HeartHandshake
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';

export default function RegisterTypePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<'worker' | 'employer' | null>(
    searchParams.get('type') as 'worker' | 'employer' | null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedType]);

  const handleContinue = () => {
    if (selectedType === 'worker') {
      router.push('/register/worker');
    } else if (selectedType === 'employer') {
      router.push('/register/employer');
    }
  };

  const cardData = {
    worker: {
      title: 'Find Work',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-300',
      accentColor: 'text-blue-600',
      features: [
        { icon: UserCheck, text: 'Get verified & trusted' },
        { icon: TrendingUp, text: 'Find job opportunities' },
        { icon: Award, text: 'Build professional profile' },
        { icon: MapPin, text: 'Local job matching' }
      ],
      stats: [
        { value: '500+', label: 'Jobs Posted Daily' },
        { value: '95%', label: 'Satisfaction Rate' },
        { value: '24h', label: 'Average Hire Time' }
      ]
    },
    employer: {
      title: 'Hire Talent',
      icon: Building2,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-300',
      accentColor: 'text-emerald-600',
      features: [
        { icon: Shield, text: 'Access verified workers' },
        { icon: Briefcase, text: 'Post job opportunities' },
        { icon: DollarSign, text: 'Manage contracts & payments' },
        { icon: Clock, text: 'Quick hiring process' }
      ],
      stats: [
        { value: '5K+', label: 'Active Workers' },
        { value: '98%', label: 'Verified Profiles' },
        { value: '48h', label: 'Avg. Fill Time' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-emerald-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 hidden lg:block animate-float">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-200/30 flex items-center justify-center">
          <Target className="h-8 w-8 text-blue-500/60" />
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:block animate-float animation-delay-1000">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-200/30 flex items-center justify-center">
          <HeartHandshake className="h-8 w-8 text-emerald-500/60" />
        </div>
      </div>

      <div className="w-full max-w-6xl">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group relative">
          <div className="absolute -inset-2 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform relative z-10" />
          <span className="font-medium relative z-10">Back to home</span>
        </Link>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Gradient Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-600"></div>
          
          <CardHeader className="pb-6 pt-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center shadow-xl">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="h-3 w-3 text-white animate-pulse" />
                </div>
              </div>
              
              <CardTitle className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Join <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">WorkConnect</span> Uganda
              </CardTitle>
              <CardDescription className="text-xl text-gray-600 max-w-2xl">
                Choose your path to success. Whether you're seeking work or hiring talent, we've got you covered.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-12">
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Worker Card */}
              <div
                className={`relative group cursor-pointer transition-all duration-500 ${
                  selectedType === 'worker' ? 'scale-[1.02]' : ''
                }`}
                onClick={() => setSelectedType('worker')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${
                  selectedType === 'worker'
                    ? `${cardData.worker.bgColor} border-blue-400 shadow-2xl`
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }`}>
                  {/* Selection Indicator */}
                  <div className={`absolute -top-3 -right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedType === 'worker'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 scale-100'
                      : 'bg-gray-200 scale-0 group-hover:scale-100'
                  }`}>
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`h-24 w-24 rounded-2xl ${cardData.worker.bgColor} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${cardData.worker.color} flex items-center justify-center shadow-xl`}>
                        <Users className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {cardData.worker.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Join as a skilled worker to find job opportunities, build your professional profile, 
                      and connect with trusted employers across Uganda.
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 w-full">
                      {cardData.worker.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 group/item">
                          <div className={`h-10 w-10 rounded-lg ${cardData.worker.bgColor} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                            <feature.icon className={`h-5 w-5 ${cardData.worker.accentColor}`} />
                          </div>
                          <span className="text-gray-700 font-medium text-left">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {cardData.worker.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employer Card */}
              <div
                className={`relative group cursor-pointer transition-all duration-500 ${
                  selectedType === 'employer' ? 'scale-[1.02]' : ''
                }`}
                onClick={() => setSelectedType('employer')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${
                  selectedType === 'employer'
                    ? `${cardData.employer.bgColor} border-emerald-400 shadow-2xl`
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-xl'
                }`}>
                  {/* Selection Indicator */}
                  <div className={`absolute -top-3 -right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedType === 'employer'
                      ? 'bg-gradient-to-r from-emerald-600 to-green-500 scale-100'
                      : 'bg-gray-200 scale-0 group-hover:scale-100'
                  }`}>
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className={`h-24 w-24 rounded-2xl ${cardData.employer.bgColor} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${cardData.employer.color} flex items-center justify-center shadow-xl`}>
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {cardData.employer.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Join as an employer to find verified workers, post job opportunities, 
                      and manage your workforce with our secure platform.
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8 w-full">
                      {cardData.employer.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 group/item">
                          <div className={`h-10 w-10 rounded-lg ${cardData.employer.bgColor} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                            <feature.icon className={`h-5 w-5 ${cardData.employer.accentColor}`} />
                          </div>
                          <span className="text-gray-700 font-medium text-left">{feature.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {cardData.employer.stats.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                          <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Already have an account? <span className="font-semibold text-blue-600 hover:text-blue-800">Sign in</span>
                </Link>
              </div>
              
              <Button
                onClick={handleContinue}
                disabled={!selectedType}
                className="group relative bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-12 py-7 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Continue to {selectedType === 'worker' ? 'Worker Registration' : selectedType === 'employer' ? 'Employer Registration' : 'Registration'}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Your data is secure with us. We never share your personal information.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">100%</div>
            <div className="text-sm text-gray-600">Secure Platform</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">Verified</div>
            <div className="text-sm text-gray-600">Profiles</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">Free</div>
            <div className="text-sm text-gray-600">To Join</div>
          </div>
        </div>
      </div>
    </div>
  );
}