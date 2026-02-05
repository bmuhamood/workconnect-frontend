// app/help/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, Search, MessageSquare, Phone, Mail, 
  FileText, Video, Users, Briefcase, CreditCard,
  Shield, Settings, Download, ArrowLeft, ChevronRight,
  CheckCircle
} from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    {
      title: 'Getting Started',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        'How do I create an account?',
        'What information do I need to register?',
        'How do I verify my account?',
        'Can I change my account type?'
      ]
    },
    {
      title: 'For Workers',
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500',
      questions: [
        'How do I find jobs?',
        'How do I update my profile?',
        'How does payment work?',
        'What are verified skills?'
      ]
    },
    {
      title: 'For Employers',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      questions: [
        'How do I post a job?',
        'How do I review worker applications?',
        'What are the hiring fees?',
        'How do I manage contracts?'
      ]
    },
    {
      title: 'Safety & Security',
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      questions: [
        'How do I report a user?',
        'What are safety guidelines?',
        'How is my data protected?',
        'What should I do in unsafe situations?'
      ]
    },
    {
      title: 'Payments',
      icon: CreditCard,
      color: 'from-red-500 to-rose-500',
      questions: [
        'When will I get paid?',
        'What payment methods are accepted?',
        'How do I set up payment?',
        'What are the platform fees?'
      ]
    },
    {
      title: 'Account Settings',
      icon: Settings,
      color: 'from-indigo-500 to-violet-500',
      questions: [
        'How do I update my profile?',
        'How do I change my password?',
        'How do I delete my account?',
        'How do I update notification settings?'
      ]
    }
  ];

  const popularArticles = [
    { title: 'Verification Process Explained', category: 'Getting Started', views: '1.2k' },
    { title: 'How to Write a Great Profile', category: 'For Workers', views: '2.4k' },
    { title: 'Safe Payment Practices', category: 'Payments', views: '1.8k' },
    { title: 'Interview Best Practices', category: 'For Employers', views: '956' },
    { title: 'Privacy Settings Guide', category: 'Account Settings', views: '1.5k' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-cyan-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Help <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Live Chat</h3>
                  <p className="text-sm text-gray-600">Get instant help</p>
                </div>
              </div>
              <Button className="w-full mt-4">Start Chat</Button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Call Us</h3>
                  <p className="text-sm text-gray-600">+256 700 123 456</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">Call Now</Button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-600">support@workconnect.ug</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">Send Email</Button>
            </div>
          </div>

          {/* Categories */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                </div>
                <ul className="space-y-3 mb-6">
                  {category.questions.map((question, qIndex) => (
                    <li key={qIndex} className="flex items-center text-gray-700 hover:text-blue-600">
                      <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                      {question}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                  View all articles
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          {/* Popular Articles */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Popular Articles</h2>
              <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                View all articles
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {popularArticles.map((article, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
                        {article.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">{article.title}</h3>
                    </div>
                    <span className="text-sm text-gray-500">{article.views} views</span>
                  </div>
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    Read article
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Helpful Resources</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Guides & Tutorials</h3>
                    <p className="text-sm text-gray-600">Step-by-step instructions</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Getting Started Guide
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Profile Optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Payment Setup Guide
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Video className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Video Tutorials</h3>
                    <p className="text-sm text-gray-600">Watch and learn</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Platform Walkthrough
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Safety Best Practices
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Mobile App Guide
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">Downloads</h3>
                    <p className="text-sm text-gray-600">Useful documents</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Safety Checklist
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contract Templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Platform Rules PDF
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-10 py-6">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-10 py-6">
                <Phone className="h-5 w-5 mr-2" />
                Call: +256 700 123 456
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}