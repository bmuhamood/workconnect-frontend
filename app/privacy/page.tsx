// app/privacy/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Shield, Lock, Eye, FileText, CheckCircle, 
  Briefcase, Sparkles, ArrowLeft
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-purple-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Privacy <span className="text-blue-600">Policy</span>
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 2024
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 p-6 bg-blue-50 rounded-2xl">
                <p className="text-gray-700">
                  At WorkConnect Uganda, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                1. Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Name, email address, phone number</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Government ID numbers for verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Professional qualifications and work history</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Payment information (processed securely through our payment partners)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Data</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Device information and browser type</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>IP address and location data</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt=0.5 flex-shrink-0" />
                      <span>Pages visited and time spent on platform</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
                <Eye className="h-6 w-6 mr-3 text-blue-600" />
                2. How We Use Your Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Service Delivery</h3>
                  <p className="text-gray-700">
                    To create and maintain your account, verify your identity, and connect you with job opportunities or workers.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Communication</h3>
                  <p className="text-gray-700">
                    To send you important updates, job notifications, and respond to your inquiries.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Security</h3>
                  <p className="text-gray-700">
                    To protect against fraud, ensure platform safety, and enforce our terms of service.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Improvement</h3>
                  <p className="text-gray-700">
                    To analyze platform usage and improve our services and user experience.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center">
                <Lock className="h-6 w-6 mr-3 text-blue-600" />
                3. Data Security
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Encryption</h3>
                  </div>
                  <p className="text-gray-700">
                    All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols.
                  </p>
                  
                  <div className="flex items-center space-x-3 mt-4">
                    <Lock className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Access Control</h3>
                  </div>
                  <p className="text-gray-700">
                    Strict access controls ensure only authorized personnel can access your personal information.
                  </p>
                  
                  <div className="flex items-center space-x-3 mt-4">
                    <Eye className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Regular Audits</h3>
                  </div>
                  <p className="text-gray-700">
                    We conduct regular security audits and vulnerability assessments to maintain the highest security standards.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
                4. Your Rights
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Access & Correction</h3>
                  <p className="text-gray-700">You have the right to access and correct your personal information at any time.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Deletion</h3>
                  <p className="text-gray-700">You can request deletion of your account and personal data, subject to legal requirements.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Opt-Out</h3>
                  <p className="text-gray-700">You can opt-out of marketing communications at any time through your account settings.</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
                5. Contact Us
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>Email: privacy@workconnect.ug</li>
                  <li>Phone: +256 700 123 456</li>
                  <li>Address: Kampala, Uganda</li>
                </ul>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  This Privacy Policy may be updated periodically. We will notify you of any material changes via email or platform notifications.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/contact">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                <Briefcase className="h-4 w-4 mr-2" />
                Contact Data Protection Officer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}