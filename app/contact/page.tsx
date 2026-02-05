// app/contact/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, Phone, MapPin, Clock, MessageSquare, 
  Users, Briefcase, HelpCircle, Sparkles, ArrowLeft,
  Send, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        userType: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      details: ['support@workconnect.ug', 'privacy@workconnect.ug'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+256 700 123 456', '+256 800 123 456'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: ['Kampala, Uganda', 'Open Monday - Friday'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 1:00 PM'],
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const departments = [
    {
      title: 'General Support',
      description: 'General inquiries and account issues',
      email: 'support@workconnect.ug'
    },
    {
      title: 'Technical Support',
      description: 'Platform technical issues and bugs',
      email: 'tech@workconnect.ug'
    },
    {
      title: 'Safety & Reporting',
      description: 'Report safety concerns or violations',
      email: 'safety@workconnect.ug'
    },
    {
      title: 'Business Inquiries',
      description: 'Partnerships and enterprise solutions',
      email: 'business@workconnect.ug'
    },
    {
      title: 'Press & Media',
      description: 'Media inquiries and press releases',
      email: 'press@workconnect.ug'
    },
    {
      title: 'Legal & Privacy',
      description: 'Legal matters and privacy concerns',
      email: 'legal@workconnect.ug'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/20 to-violet-50/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
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
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact <span className="text-indigo-600">Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get in touch with our team. We're here to help you with any questions or concerns.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{method.title}</h3>
                <ul className="space-y-1">
                  {method.details.map((detail, idx) => (
                    <li key={idx} className="text-gray-600">{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="font-semibold">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="py-6"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="font-semibold">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="pl-10 py-6"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10 py-6"
                          placeholder="0756123456"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="userType" className="font-semibold">I am a *</Label>
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-6"
                      >
                        <option value="">Select user type</option>
                        <option value="worker">Worker</option>
                        <option value="employer">Employer</option>
                        <option value="prospective">Prospective User</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="subject" className="font-semibold">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="py-6"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="resize-none py-6"
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      We typically respond to inquiries within 24 hours during business days.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Departments & FAQ */}
            <div className="space-y-8">
              {/* Departments */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact by Department</h2>
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-1">{dept.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                      <p className="text-sm text-blue-600">{dept.email}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-3xl border border-indigo-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <HelpCircle className="h-6 w-6 mr-3 text-indigo-600" />
                  Quick Help
                </h2>
                <div className="space-y-4">
                  {[
                    'How do I reset my password?',
                    'Where can I find safety guidelines?',
                    'How do I report a user?',
                    'What are the platform fees?'
                  ].map((question, index) => (
                    <Link
                      key={index}
                      href="/help"
                      className="block p-4 bg-white/50 rounded-xl hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{question}</span>
                        <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link href="/help">
                    <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 w-full">
                      Visit Help Center
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl border border-red-100 p-8">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Emergency Contact</h3>
                  <p className="text-gray-600 mb-4">
                    For urgent safety concerns requiring immediate attention
                  </p>
                  <div className="space-y-2">
                    <div className="text-xl font-bold text-gray-900">+256 700 911 911</div>
                    <div className="text-sm text-gray-500">24/7 Emergency Line</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map & Office Info */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Visit Our Office</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">Kampala, Uganda</p>
                      <p className="text-sm text-gray-500 mt-1">Plot 123, Industrial Area</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="h-6 w-6 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Appointments</h3>
                      <p className="text-gray-600">Walk-ins welcome, appointments preferred</p>
                      <p className="text-sm text-gray-500 mt-1">Call ahead to schedule</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">WorkConnect Uganda HQ</h3>
                  <p className="text-gray-600">Transforming Uganda's job market</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us</h3>
            <div className="flex justify-center space-x-6">
              {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((platform, index) => (
                <Button key={index} variant="ghost" className="text-gray-600 hover:text-blue-600">
                  {platform}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}