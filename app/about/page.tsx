// app/about/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Building, Users, Shield, Target, Heart, 
  Globe, Award, TrendingUp, CheckCircle, Sparkles,
  Briefcase, MapPin, Clock, Star, Zap, Target as TargetIcon,
  HeartHandshake, Building2, Users as UsersIcon
} from 'lucide-react';
import Footer from '@/components/ui/footer';

export default function AboutPage() {
  const teamMembers = [
    { name: 'David Kato', role: 'CEO & Founder', expertise: 'Tech Entrepreneurship', avatar: 'DK' },
    { name: 'Sarah Nalwoga', role: 'Head of Operations', expertise: 'Human Resources', avatar: 'SN' },
    { name: 'Michael Ochieng', role: 'CTO', expertise: 'Software Development', avatar: 'MO' },
    { name: 'Grace Auma', role: 'Head of Partnerships', expertise: 'Business Development', avatar: 'GA' },
  ];

  const milestones = [
    { year: '2023', title: 'Concept & Research', description: 'Identified the need for reliable job matching in Uganda' },
    { year: '2024', title: 'Platform Launch', description: 'Officially launched WorkConnect with initial 100 verified workers' },
    { year: '2024', title: 'Expansion', description: 'Expanded to 5 major cities across Uganda' },
    { year: '2025', title: 'Mobile App Launch', description: 'Released iOS and Android apps for better accessibility' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-purple-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WorkConnect
              </span>
              <span className="ml-2 text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                UG
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/workers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Find Workers
            </Link>
            <Link href="/register?type=worker" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              For Workers
            </Link>
            <Link href="/register?type=employer" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              For Employers
            </Link>
            <Link href="/about" className="text-blue-600 font-medium transition-colors">
              About
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-8">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-blue-600">
              Our Story • Our Mission • Our Impact
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
            Building <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Bridges</span> of Opportunity
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            WorkConnect Uganda is more than a platform—it's a movement dedicated to transforming 
            Uganda's job market by connecting skilled workers with trusted employers through 
            technology, trust, and transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=worker">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-6">
                <UsersIcon className="h-5 w-5 mr-2" />
                Join as Worker
              </Button>
            </Link>
            <Link href="/register?type=employer">
              <Button size="lg" variant="outline" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-10 py-6">
                <Building2 className="h-5 w-5 mr-2" />
                Join as Employer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                  <p className="text-blue-600 font-medium">What drives us forward</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                To empower every Ugandan with access to quality employment opportunities by 
                creating a transparent, secure, and efficient platform that bridges the gap 
                between skilled workers and reliable employers.
              </p>
              <ul className="space-y-3">
                {[
                  'Create economic opportunities for skilled workers',
                  'Build trust through verification and transparency',
                  'Simplify the hiring process for employers',
                  'Promote fair wages and working conditions',
                  'Support Uganda\'s economic growth'
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
                  <p className="text-purple-600 font-medium">Where we're headed</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                To become Uganda's most trusted employment platform, recognized for transforming 
                lives and businesses by 2030. We envision a future where no skilled worker 
                struggles to find work, and no employer struggles to find talent.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '1M+', label: 'Workers Empowered', icon: Users },
                  { value: '100K+', label: 'Businesses Served', icon: Building },
                  { value: '95%', label: 'Satisfaction Rate', icon: Star },
                  { value: '24/7', label: 'Support Available', icon: Clock }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a simple idea to Uganda's leading employment platform
            </p>
          </div>

          {/* Timeline */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>
            
            {milestones.map((milestone, index) => (
              <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 ${index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${index % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        <div className={`h-6 w-6 rounded-full ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'} flex items-center justify-center`}>
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{milestone.year}</div>
                        <div className="text-sm text-gray-500">Milestone</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
                <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-4 border-white shadow-lg z-10"></div>
                <div className="flex-1 hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Core Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Trust & Security',
                description: 'Every profile is verified, every transaction is secure',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: HeartHandshake,
                title: 'Community Focus',
                description: 'Built for Uganda, by Ugandans',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Zap,
                title: 'Innovation',
                description: 'Constantly improving through technology',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: TargetIcon,
                title: 'Excellence',
                description: 'Setting new standards in service delivery',
                color: 'from-amber-500 to-orange-500'
              },
              {
                icon: TrendingUp,
                title: 'Growth',
                description: 'Empowering personal and professional development',
                color: 'from-red-500 to-rose-500'
              },
              {
                icon: Award,
                title: 'Integrity',
                description: 'Honest, transparent, and ethical practices',
                color: 'from-indigo-500 to-violet-500'
              }
            ].map((value, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Meet Our <span className="text-purple-600">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals dedicated to transforming Uganda's employment landscape
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium text-center mb-3">{member.role}</p>
                  <p className="text-gray-600 text-center text-sm">{member.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">
              Ready to Join the WorkConnect Family?
            </h2>
            <p className="text-xl text-blue-100 mb-12">
              Whether you're looking for work or looking to hire, we're here to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?type=worker">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-xl">
                  <Users className="h-5 w-5 mr-2" />
                  Find Work Today
                </Button>
              </Link>
              <Link href="/register?type=employer">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl">
                  <Building className="h-5 w-5 mr-2" />
                  Start Hiring
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
{/* Footer */}
<Footer />
    </div>
  );
}