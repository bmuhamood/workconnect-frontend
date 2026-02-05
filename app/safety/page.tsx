// app/safety/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Shield, AlertTriangle, Phone, Users, MapPin,
  MessageSquare, Clock, Eye, Lock, CheckCircle,
  Sparkles, ArrowLeft, Download
} from 'lucide-react';

export default function SafetyGuidelinesPage() {
  const safetyTips = [
    {
      category: 'Before Meeting',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      tips: [
        'Verify the other person\'s profile and reviews',
        'Communicate through the platform messaging system',
        'Share meeting plans with a friend or family member',
        'Research the meeting location beforehand',
        'Trust your instincts - if something feels wrong, don\'t proceed'
      ]
    },
    {
      category: 'During Work',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      tips: [
        'Keep your phone charged and accessible',
        'Inform someone about your work location',
        'Take regular breaks in safe areas',
        'Document your work with photos (when appropriate)',
        'Report any unsafe conditions immediately'
      ]
    },
    {
      category: 'Payment Safety',
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      tips: [
        'Use only the platform\'s payment system',
        'Never accept cash payments outside the platform',
        'Verify payments through official notifications',
        'Report any payment disputes immediately',
        'Keep records of all transactions'
      ]
    }
  ];

  const emergencyContacts = [
    { name: 'Emergency Line', number: '+256 700 911 911', description: '24/7 emergency support' },
    { name: 'Police Emergency', number: '999', description: 'Uganda Police Force' },
    { name: 'Medical Emergency', number: '112', description: 'National emergency medical services' },
    { name: 'WorkConnect Support', number: '+256 700 123 456', description: 'Platform safety team' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-red-50/20 to-rose-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Safety <span className="text-red-600">Guidelines</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your safety is our top priority. Follow these guidelines to ensure a secure experience.
            </p>
          </div>

          {/* Emergency Banner */}
          <div className="mb-12 p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">In Case of Emergency</h2>
                <p className="text-gray-700">
                  If you feel unsafe or need immediate assistance, use the emergency button in the app or call our 24/7 emergency line.
                </p>
              </div>
              <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                <Phone className="h-4 w-4 mr-2" />
                Emergency: +256 700 911 911
              </Button>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Essential Safety Tips</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {safetyTips.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h3>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Guidelines */}
          <div className="mb-16 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
              Safe Communication Practices
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Do</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Use platform messaging for all communications
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Be clear about expectations and boundaries
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Report inappropriate messages immediately
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Don't</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                      Share personal contact information early
                    </li>
                    <li className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                      Send or request inappropriate content
                    </li>
                    <li className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      </div>
                      Agree to meet in private, isolated locations
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Meeting Checklist</h3>
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    Schedule meetings during daylight hours
                  </li>
                  <li className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    Choose public, well-lit locations
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Users className="h-4 w-4 text-gray-400 mr-3" />
                    Consider bringing a friend for initial meetings
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    Keep your phone charged and accessible
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Emergency Contacts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{contact.name}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{contact.number}</div>
                  <p className="text-sm text-gray-600">{contact.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting Guide */}
          <div className="mb-16 bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Report Safety Concerns</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6">
                <div className="text-2xl font-bold text-red-600 mb-2">1</div>
                <h3 className="font-semibold text-gray-900 mb-3">Document</h3>
                <p className="text-gray-700">
                  Take screenshots or photos of concerning messages, profiles, or situations. Note dates, times, and locations.
                </p>
              </div>
                            <div className="bg-white rounded-xl p-6">
                <div className="text-2xl font-bold text-red-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-900 mb-3">Report</h3>
                <p className="text-gray-700">
                  Use the in-app reporting feature or contact our safety team immediately. Provide all documented evidence.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6">
                <div className="text-2xl font-bold text-red-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-900 mb-3">Follow Up</h3>
                <p className="text-gray-700">
                  Our safety team will respond within 24 hours. We'll investigate and take appropriate action to ensure your safety.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-white rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Need to report something?</h3>
                  <p className="text-gray-700">
                    Our safety team is available 24/7 to handle any concerns or incidents.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    In-App Report
                  </Button>
                  <Button className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Safety Team
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Resources & Downloads */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Safety Resources</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Safety Checklist PDF</h3>
                <p className="text-gray-600 mb-4">
                  Download our comprehensive safety checklist for offline reference.
                </p>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Safety Training</h3>
                <p className="text-gray-600 mb-4">
                  Join our free online safety workshops conducted weekly.
                </p>
                <Button variant="outline" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  View Schedule
                </Button>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">Trust & Verification</h3>
                <p className="text-gray-600 mb-4">
                  Learn about our verification system and how we ensure user safety.
                </p>
                <Link href="/verification">
                  <Button variant="outline" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-gray-900 to-slate-900 rounded-3xl p-12 text-white">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Safety is Our Commitment
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              We continuously improve our safety features and guidelines to ensure WorkConnect remains a secure platform for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <Phone className="h-4 w-4 mr-2" />
                Contact Safety Team
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Feedback
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-gray-400 text-sm">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframes for blob animation */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}