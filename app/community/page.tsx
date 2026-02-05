// app/community/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Users, Heart, Shield, MessageSquare, Star,
  AlertTriangle, CheckCircle, XCircle, Sparkles, ArrowLeft
} from 'lucide-react';

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-pink-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Community <span className="text-purple-600">Guidelines</span>
            </h1>
            <p className="text-xl text-gray-600">
              Creating a safe and respectful environment for all users
            </p>
          </div>

          {/* Community Pledge */}
          <div className="mb-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
            <div className="text-center">
              <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Community Pledge</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                We commit to treating every member with respect, maintaining professionalism, and building a community where everyone feels safe and valued.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-purple-600" />
                Core Principles
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Do's</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Be respectful and professional in all communications',
                      'Provide accurate information about skills and experience',
                      'Honor commitments and agreements',
                      'Give constructive feedback',
                      'Report any suspicious activity'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <XCircle className="h-6 w-6 text-red-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Don'ts</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Harass or discriminate against others',
                      'Share false or misleading information',
                      'Attempt to circumvent the platform',
                      'Share personal contact information prematurely',
                      'Engage in fraudulent activities'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
                          <XCircle className="h-3 w-3 text-red-600" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <MessageSquare className="h-6 w-6 mr-3 text-purple-600" />
                Communication Standards
              </h2>
              
              <div className="space-y-6 mb-12">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Professional Communication</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Use respectful language at all times</li>
                    <li>• Be clear and specific in your messages</li>
                    <li>• Respond promptly to inquiries</li>
                    <li>• Keep conversations professional and work-related</li>
                    <li>• Use the platform's messaging system for all communications</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Prohibited Content</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Hate speech or discriminatory language</li>
                    <li>• Threats or harassment of any kind</li>
                    <li>• Spam or unsolicited promotional content</li>
                    <li>• Sexually explicit material</li>
                    <li>• False or misleading information</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Star className="h-6 w-6 mr-3 text-purple-600" />
                Reviews & Ratings
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl mb-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Guidelines for Reviews</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Reviews should be based on actual work experience</li>
                      <li>• Be specific and constructive in feedback</li>
                      <li>• Focus on work performance, not personal attributes</li>
                      <li>• Do not include personal contact information</li>
                      <li>• Report inaccurate or fake reviews</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Response to Reviews</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Respond professionally to all reviews</li>
                      <li>• Address concerns constructively</li>
                      <li>• Do not engage in arguments publicly</li>
                      <li>• Use the review system to improve service quality</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Safety & Security
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Personal Safety</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Meet in public places for initial meetings</li>
                    <li>• Inform someone about your work arrangements</li>
                    <li>• Trust your instincts - if something feels wrong, report it</li>
                    <li>• Use the platform's safety features</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Platform Security</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Keep your account credentials secure</li>
                    <li>• Report suspicious activity immediately</li>
                    <li>• Use two-factor authentication</li>
                    <li>• Be cautious of phishing attempts</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Reporting & Enforcement
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl mb-12">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How to Report</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Use the report button on profiles or messages</li>
                      <li>• Email reports to safety@workconnect.ug</li>
                      <li>• Provide detailed information and evidence</li>
                      <li>• Report violations promptly</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Consequences</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Warning for minor violations</li>
                      <li>• Temporary suspension for repeated violations</li>
                      <li>• Permanent ban for serious violations</li>
                      <li>• Legal action for criminal activities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Help Keep Our Community Safe</h3>
                  <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                    We all share responsibility for maintaining a positive community. By following these guidelines, we can create a better experience for everyone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                        Report an Issue
                      </Button>
                    </Link>
                    <Link href="/safety">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Safety Guidelines
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}