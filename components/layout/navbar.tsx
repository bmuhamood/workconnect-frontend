// components/layout/navbar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
        : "bg-white border-b border-gray-100"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-1.5 w-1.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WorkConnect
              </span>
              <span className="ml-2 text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                UG
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/workers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
              Find Workers
            </Link>
            <Link href="/register?type=worker" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
              For Workers
            </Link>
            <Link href="/register?type=employer" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
              For Employers
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
              About
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-sm">
                Get Started
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <Link 
                href="/workers" 
                className="block text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Workers
              </Link>
              <Link 
                href="/register?type=worker" 
                className="block text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                For Workers
              </Link>
              <Link 
                href="/register?type=employer" 
                className="block text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                For Employers
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm">
                    Get Started
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}