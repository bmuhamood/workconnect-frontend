import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, CheckCircle, Users, Briefcase, Shield, Star, 
  Sparkles, Zap, TrendingUp, Smartphone, Download, QrCode,
  Apple, Play, Globe, MessageSquare, CreditCard, Clock,
  MapPin, Building, Target, Award, Heart, Users as UsersIcon
} from 'lucide-react';
import Footer from '@/components/ui/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-80 h-80 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center max-w-6xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">
              Uganda's #1 Job Matching Platform
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            <span className="block">Find Your</span>
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Perfect Match
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connecting <span className="font-semibold text-blue-600">verified skilled workers</span> with{' '}
            <span className="font-semibold text-purple-600">trusted employers</span> across Uganda. 
            Your next opportunity is just a tap away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/register?type=worker">
              <Button size="lg" className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-8 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Users className="mr-3 h-6 w-6" />
                Start Finding Work
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register?type=employer">
              <Button size="lg" variant="outline" className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-10 py-8 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <Briefcase className="mr-3 h-6 w-6" />
                Hire Talent
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* App Download QR & Badges */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              Also Available on Mobile
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="text-center">
                <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                  <QrCode className="h-32 w-32 text-gray-800" />
                </div>
                <p className="mt-2 text-sm text-gray-600">Scan to download</p>
              </div>
              
              <div className="space-y-4">
                <Button size="lg" className="w-64 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-6">
                  <Apple className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </Button>
                
                <Button size="lg" className="w-64 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-6">
                  <Play className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '5K+', label: 'Active Workers', icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
              { value: '1K+', label: 'Verified Employers', icon: Building, color: 'from-purple-500 to-pink-500' },
              { value: '98%', label: 'Success Rate', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
              { value: '24/7', label: 'Support', icon: Clock, color: 'from-orange-500 to-red-500' }
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-blue-600">WorkConnect</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing the job market with cutting-edge features designed for Uganda's workforce
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified & Trusted',
                description: 'Every profile is verified with government IDs and background checks',
                color: 'bg-gradient-to-br from-blue-500 to-blue-600',
                features: ['ID Verification', 'Background Checks', 'Skill Validation']
              },
              {
                icon: CreditCard,
                title: 'Secure Payments',
                description: 'Escrow system ensures fair pay and job completion satisfaction',
                color: 'bg-gradient-to-br from-green-500 to-emerald-600',
                features: ['Escrow Protection', 'Flexible Payment', 'Instant Payouts']
              },
              {
                icon: Star,
                title: 'Smart Matching',
                description: 'AI-powered matching connects the right workers with the right jobs',
                color: 'bg-gradient-to-br from-purple-500 to-pink-600',
                features: ['AI Algorithms', 'Skill Matching', 'Location Based']
              },
              {
                icon: Zap,
                title: 'Quick Hiring',
                description: 'Find and hire verified workers in minutes, not days',
                color: 'bg-gradient-to-br from-orange-500 to-red-500',
                features: ['Instant Booking', 'Real-time Chat', 'Quick Reviews']
              },
              {
                icon: MapPin,
                title: 'Local Focus',
                description: 'Designed specifically for Uganda\'s unique job market needs',
                color: 'bg-gradient-to-br from-yellow-500 to-amber-600',
                features: ['Local Support', 'Cultural Fit', 'Regional Expertise']
              },
              {
                icon: MessageSquare,
                title: 'Direct Communication',
                description: 'Chat directly with workers/employers before hiring',
                color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
                features: ['In-app Chat', 'Video Calls', 'Review System']
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-2">
                  <div className={`h-16 w-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to start your journey with WorkConnect
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Profile', description: 'Sign up as a worker or employer with verified details' },
              { step: '02', title: 'Find Match', description: 'Browse and connect with verified profiles in your area' },
              { step: '03', title: 'Start Working', description: 'Secure the job, get paid safely through our platform' }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-3/4 w-full h-1 bg-gradient-to-r from-blue-200 to-purple-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by <span className="text-blue-600">Thousands</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'David O.', role: 'Electrician', quote: 'Found consistent work within days of joining. The verification process made employers trust me immediately.' },
              { name: 'Sarah K.', role: 'Restaurant Owner', quote: 'Hired 5 skilled workers through WorkConnect. The platform saved me weeks of recruitment time.' },
              { name: 'Michael T.', role: 'Construction Manager', quote: 'Verified workers, secure payments, and excellent support. This platform is a game-changer.' }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with Mobile App */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Download Our <span className="text-blue-400">Mobile App</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Get instant job alerts, chat with employers/workers, and manage everything on the go.
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="text-left max-w-md">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Zap className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Instant Notifications</h4>
                      <p className="text-gray-300">Get real-time alerts for new jobs and applications</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MessageSquare className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Direct Chat</h4>
                      <p className="text-gray-300">Communicate instantly with potential matches</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Location Based</h4>
                      <p className="text-gray-300">Find opportunities right in your neighborhood</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="flex gap-6">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl py-6 px-8">
                    <Apple className="h-7 w-7 mr-3" />
                    <div className="text-left">
                      <div className="text-xs text-gray-600">Download on</div>
                      <div className="text-lg font-bold">App Store</div>
                    </div>
                  </Button>
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl py-6 px-8">
                    <Play className="h-7 w-7 mr-3" />
                    <div className="text-left">
                      <div className="text-xs">Get it on</div>
                      <div className="text-lg font-bold">Google Play</div>
                    </div>
                  </Button>
                </div>
                <div className="mt-6">
                  <div className="bg-white p-4 rounded-xl inline-block">
                    <QrCode className="h-24 w-24 text-gray-900" />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Scan QR to download</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 text-lg rounded-xl">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}