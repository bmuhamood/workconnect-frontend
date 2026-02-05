// app/cookies/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Cookie, Settings, Shield, Eye, CheckCircle,
  Sparkles, ArrowLeft, Info
} from 'lucide-react';

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      description: 'Required for the platform to function properly',
      examples: ['Session management', 'Security features', 'Authentication'],
      necessary: true
    },
    {
      name: 'Performance Cookies',
      description: 'Help us understand how users interact with our platform',
      examples: ['Page analytics', 'Error tracking', 'Load time optimization'],
      necessary: false
    },
    {
      name: 'Functional Cookies',
      description: 'Remember your preferences and settings',
      examples: ['Language preferences', 'Theme settings', 'Region settings'],
      necessary: false
    },
    {
      name: 'Advertising Cookies',
      description: 'Used to deliver relevant advertisements',
      examples: ['Interest-based ads', 'Campaign measurement', 'Ad frequency capping'],
      necessary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/20 to-emerald-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <Cookie className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cookie <span className="text-green-600">Policy</span>
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: December 2024
            </p>
          </div>

          {/* Cookie Consent Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Cookie Settings</h3>
                  <p className="text-gray-700">
                    We use cookies to enhance your experience. You can manage your preferences at any time.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                  Manage Preferences
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Accept All
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Cookie className="h-6 w-6 mr-3 text-green-600" />
                What Are Cookies?
              </h2>
              
              <div className="p-6 bg-gray-50 rounded-xl mb-8">
                <p className="text-gray-700">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-3 text-green-600" />
                Types of Cookies We Use
              </h2>
              
              <div className="space-y-6 mb-8">
                {cookieTypes.map((cookie, index) => (
                  <div key={index} className={`p-6 rounded-xl ${cookie.necessary ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {cookie.necessary ? (
                          <Shield className="h-5 w-5 text-green-600" />
                        ) : (
                          <Settings className="h-5 w-5 text-gray-400" />
                        )}
                        <h3 className="text-xl font-semibold text-gray-900">{cookie.name}</h3>
                      </div>
                      {cookie.necessary && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          Necessary
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">{cookie.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Examples:</h4>
                      <ul className="space-y-1">
                        {cookie.examples.map((example, idx) => (
                          <li key={idx} className="flex items-center text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Eye className="h-6 w-6 mr-3 text-green-600" />
                How to Manage Cookies
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Browser Settings</h3>
                  <p className="text-gray-700 mb-4">
                    Most web browsers allow you to control cookies through their settings preferences. You can usually find these settings in the 'Options' or 'Preferences' menu of your browser.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                    <li>• Firefox: Options → Privacy & Security → Cookies</li>
                    <li>• Safari: Preferences → Privacy → Cookies</li>
                    <li>• Edge: Settings → Cookies and site permissions</li>
                  </ul>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Platform Settings</h3>
                  <p className="text-gray-700 mb-4">
                    You can manage your cookie preferences specifically for WorkConnect Uganda through your account settings.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Access your account settings</li>
                    <li>• Navigate to Privacy & Security</li>
                    <li>• Adjust cookie preferences</li>
                    <li>• Save your settings</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Third-Party Cookies
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl mb-8">
                <p className="text-gray-700 mb-4">
                  We may use third-party services that set their own cookies. These include:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Analytics Providers</h4>
                    <p className="text-sm text-gray-600">Google Analytics, Mixpanel</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Processors</h4>
                    <p className="text-sm text-gray-600">Stripe, Flutterwave</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Advertising Networks</h4>
                    <p className="text-sm text-gray-600">Google Ads, Facebook Pixel</p>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Security Services</h4>
                    <p className="text-sm text-gray-600">Cloudflare, reCAPTCHA</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Changes to This Policy
              </h2>
              
              <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl mb-8">
                <p className="text-gray-700">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to periodically review this page for the latest information on our cookie practices.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-gray-600">
                      Contact us if you have questions about our cookie practices.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/contact">
                      <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                        Contact Us
                      </Button>
                    </Link>
                    <Link href="/privacy">
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        View Privacy Policy
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