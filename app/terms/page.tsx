// app/terms/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  FileText, Scale, AlertTriangle, Shield, Briefcase,
  CheckCircle, XCircle, Sparkles, ArrowLeft
} from 'lucide-react';
import Footer from '@/components/ui/footer';
import Navbar from '@/components/layout/navbar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-orange-50/20">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                <Scale className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Terms of <span className="text-amber-600">Service</span>
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 2024
            </p>
          </div>

          {/* Warning Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-700">
                  Please read these Terms of Service carefully before using WorkConnect Uganda. By creating an account or using our services, you agree to be bound by these terms.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-amber-600" />
                1. Acceptance of Terms
              </h2>
              
              <div className="p-6 bg-gray-50 rounded-xl mb-8">
                <p className="text-gray-700">
                  By accessing or using the WorkConnect Uganda platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Briefcase className="h-6 w-6 mr-3 text-amber-600" />
                2. Account Responsibilities
              </h2>
              
              <div className="space-y-6 mb-8">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">You Must:</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Provide accurate and complete information</li>
                    <li>• Maintain the security of your account credentials</li>
                    <li>• Update your information as it changes</li>
                    <li>• Comply with all applicable laws and regulations</li>
                    <li>• Be at least 18 years old</li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-gray-900">You Must Not:</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Create fake or duplicate accounts</li>
                    <li>• Share your account with others</li>
                    <li>• Use the platform for illegal activities</li>
                    <li>• Post false or misleading information</li>
                    <li>• Harass or discriminate against other users</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-amber-600" />
                3. Service Rules
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">For Workers</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Provide accurate skill and experience information</li>
                    <li>• Maintain professional conduct</li>
                    <li>• Honor agreed-upon work commitments</li>
                    <li>• Report accurate hours worked</li>
                  </ul>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">For Employers</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Provide accurate job descriptions</li>
                    <li>• Pay agreed-upon wages on time</li>
                    <li>• Provide safe working conditions</li>
                    <li>• Respect worker rights and dignity</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Payment Terms
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl mb-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Fee Structure</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Worker registration: Free</li>
                    <li>• Employer registration: Free</li>
                    <li>• Platform commission: 10% of completed job value</li>
                    <li>• Premium features: Available with subscription plans</li>
                  </ul>
                  
                  <h3 className="font-semibold text-gray-900 mt-4">Payment Processing</h3>
                  <p className="text-gray-700">
                    All payments are processed through secure third-party payment processors. We do not store your payment card information on our servers.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Limitation of Liability
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl mb-8">
                <p className="text-gray-700 mb-4">
                  WorkConnect Uganda acts as a platform to connect workers and employers. We are not a party to any employment agreement between users.
                </p>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, WorkConnect Uganda shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. Termination
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl mb-8">
                <p className="text-gray-700 mb-4">
                  We reserve the right to suspend or terminate your account at our discretion if you violate these Terms of Service. You may also terminate your account at any time through your account settings.
                </p>
                <p className="text-gray-700">
                  Upon termination, your right to use the platform will immediately cease. Certain provisions of these terms will survive termination.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                7. Changes to Terms
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mb-8">
                <p className="text-gray-700">
                  We may update these Terms of Service from time to time. We will notify users of material changes via email or platform notifications. Your continued use of the platform after such changes constitutes acceptance of the new terms.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                8. Governing Law
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
                <p className="text-gray-700">
                  These Terms of Service shall be governed by and construed in accordance with the laws of Uganda. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Uganda.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    By using WorkConnect Uganda, you acknowledge that you have read and agree to these Terms of Service.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                      Questions? Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
       </div>
  );
}