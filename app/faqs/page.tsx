// app/faqs/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp,
  Users, Briefcase, CreditCard, Shield,
  MessageSquare, Phone, Mail, Sparkles, ArrowLeft
} from 'lucide-react';

export default function FAQsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['general']);
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleQuestion = (questionId: number) => {
    setOpenQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const faqCategories = [
    {
      id: 'general',
      title: 'General Questions',
      icon: HelpCircle,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          id: 1,
          question: 'What is WorkConnect Uganda?',
          answer: 'WorkConnect Uganda is a digital platform connecting skilled workers with trusted employers across Uganda. We provide a secure, transparent marketplace for finding employment opportunities and hiring qualified workers.'
        },
        {
          id: 2,
          question: 'Is WorkConnect free to use?',
          answer: 'Yes, registration is free for both workers and employers. We charge a small platform fee (10%) only when a job is successfully completed through our platform.'
        },
        {
          id: 3,
          question: 'Which cities do you operate in?',
          answer: 'We operate across Uganda, with strong presence in Kampala, Entebbe, Jinja, Mbarara, Gulu, and other major cities. Our platform connects workers and employers nationwide.'
        }
      ]
    },
    {
      id: 'workers',
      title: 'For Workers',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          id: 4,
          question: 'How do I create a worker profile?',
          answer: 'Click "Register" and select "Find Work". You\'ll need to provide your personal information, skills, experience, and upload required documents for verification. The process takes about 10-15 minutes.'
        },
        {
          id: 5,
          question: 'How long does verification take?',
          answer: 'Standard verification takes 1-2 business days. You can start browsing jobs immediately after registration, but full verification is required before you can accept jobs.'
        },
        {
          id: 6,
          question: 'How do I get paid?',
          answer: 'Payments are processed through our secure payment system. After completing a job, the employer releases payment, which is transferred to your registered payment method within 1-2 business days.'
        }
      ]
    },
    {
      id: 'employers',
      title: 'For Employers',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          id: 7,
          question: 'How do I post a job?',
          answer: 'After registering as an employer, go to your dashboard and click "Post Job". Provide job details, requirements, budget, and timeline. Your job will be visible to verified workers immediately.'
        },
        {
          id: 8,
          question: 'How are workers verified?',
          answer: 'All workers undergo ID verification, background checks, and skill validation. We verify government IDs, work experience, and professional qualifications to ensure quality and reliability.'
        },
        {
          id: 9,
          question: 'What are the hiring fees?',
          answer: 'We charge a 10% platform fee on completed job value. There are no upfront costs or subscription fees for basic hiring. Premium features are available with subscription plans.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: Shield,
      color: 'from-amber-500 to-orange-500',
      questions: [
        {
          id: 10,
          question: 'How do you ensure user safety?',
          answer: 'We implement multiple safety measures including ID verification, secure messaging, payment protection, user reviews, and 24/7 support. All communications are logged for accountability.'
        },
        {
          id: 11,
          question: 'What should I do if I feel unsafe?',
          answer: 'Immediately use the emergency button in the app, call our emergency line (+256 700 911 911), or report through the platform. Never hesitate to remove yourself from unsafe situations.'
        },
        {
          id: 12,
          question: 'How is my data protected?',
          answer: 'We use bank-level encryption, secure servers, regular security audits, and comply with data protection regulations. Your personal information is never shared without consent.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Fees',
      icon: CreditCard,
      color: 'from-red-500 to-rose-500',
      questions: [
        {
          id: 13,
          question: 'What payment methods are accepted?',
          answer: 'We accept mobile money (MTN, Airtel), bank transfers, and credit/debit cards. All payments are processed through secure, certified payment partners.'
        },
        {
          id: 14,
          question: 'When are workers paid?',
          answer: 'Workers are paid after job completion and employer confirmation. Payments are typically processed within 1-2 business days after the employer releases funds.'
        },
        {
          id: 15,
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees. Our 10% platform fee is clearly displayed before you confirm any job. There are no charges for registration, profile creation, or job browsing.'
        }
      ]
    }
  ];

  const popularQuestions = [
    { id: 1, question: 'How do I reset my password?', category: 'Account' },
    { id: 2, question: 'What documents are required for verification?', category: 'Verification' },
    { id: 3, question: 'How do I report a user?', category: 'Safety' },
    { id: 4, question: 'Can I change my account type?', category: 'Account' },
    { id: 5, question: 'What happens if a job is cancelled?', category: 'Jobs' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-orange-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked <span className="text-amber-600">Questions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about WorkConnect Uganda
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                Search
              </Button>
            </div>
          </div>

          {/* Popular Questions */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Questions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularQuestions.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full mb-2">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-gray-900">{item.question}</h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-amber-600 hover:text-amber-700"
                    onClick={() => {
                      // Scroll to relevant section
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    View answer
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Categories */}
          <div id="faq-section" className="space-y-6 mb-16">
            {faqCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-gray-600">{category.questions.length} questions</p>
                    </div>
                  </div>
                  {openCategories.includes(category.id) ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                
                {openCategories.includes(category.id) && (
                  <div className="p-8 pt-0 border-t border-gray-100">
                    <div className="space-y-4">
                      {category.questions.map((q) => (
                        <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleQuestion(q.id)}
                            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4">{q.question}</span>
                            {openQuestions.includes(q.id) ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          
                          {openQuestions.includes(q.id) && (
                            <div className="p-6 pt-0">
                              <div className="pl-6 border-l-2 border-amber-200">
                                <p className="text-gray-700">{q.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Need Help? */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Can't find what you're looking for? Our support team is ready to help you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6">
                  <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-gray-600 text-sm">Get instant answers</p>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <Phone className="h-8 w-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Call Us</h3>
                  <p className="text-gray-600 text-sm">+256 700 123 456</p>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <Mail className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 text-sm">support@workconnect.ug</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-10 py-6">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Link href="/help">
                  <Button size="lg" variant="outline" className="border-2 border-amber-200 text-amber-600 hover:bg-amber-50 px-10 py-6">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Visit Help Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}