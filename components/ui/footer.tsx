// components/ui/footer.tsx - FIXED VERSION
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, Globe, MessageSquare, Heart, 
  Sparkles, Mail, Facebook, Twitter, Instagram,
  Linkedin, Youtube
} from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'simple';
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const socialIcons = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Twitter, label: 'Twitter' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Youtube, label: 'YouTube' },
  ];

  const footerLinks = {
    forWorkers: [
      { label: 'Find Jobs', href: '/workers' },
      { label: 'Create Profile', href: '/register?type=worker' },
      { label: 'Worker Dashboard', href: '/dashboard/worker' },
      { label: 'Get Verified', href: '/verification' },
      { label: 'Safety Guidelines', href: '/safety' },
    ],
    forEmployers: [
      { label: 'Post Jobs', href: '/jobs/post' },
      { label: 'Browse Workers', href: '/workers' },
      { label: 'Employer Dashboard', href: '/dashboard/employer' },
      { label: 'Hiring Solutions', href: '/solutions' },
      { label: 'Verification', href: '/verification' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Success Stories', href: '/success-stories' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Safety Guidelines', href: '/safety' },
      { label: 'Report Issue', href: '/report' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Community Guidelines', href: '/community' },
      { label: 'Code of Conduct', href: '/code-of-conduct' },
    ]
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">WorkConnect</span>
                <span className="ml-2 text-sm font-semibold text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                  UG
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-8 max-w-md">
              Uganda's premier platform connecting skilled workers with trusted employers. 
              Transforming the job market through technology, trust, and opportunity.
            </p>
            
            {/* Newsletter - FIXED: Added suppressHydrationWarning to input */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-white">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning={true}  // 🔴 ADD THIS LINE
                />
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-3 text-white">Follow Us</h4>
              <div className="flex space-x-3">
                {socialIcons.map((social, index) => (
                  <Button
                    key={index}
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">For Workers</h3>
            <ul className="space-y-3">
              {footerLinks.forWorkers.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-white">For Employers</h3>
            <ul className="space-y-3">
              {footerLinks.forEmployers.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-6 text-white">Support & Legal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Support</h4>
                <ul className="space-y-2">
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm hover:underline underline-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-gray-300">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm hover:underline underline-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center md:text-left">
              <p>© 2024 WorkConnect Uganda. All rights reserved.</p>
              <p className="mt-1">Made with <span className="text-red-400">❤️</span> for Uganda's workforce.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Support
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/accessibility" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
          
          {/* App Download CTA */}
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 mb-4">Download our app for better experience</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs">📱</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </div>
              </Button>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}