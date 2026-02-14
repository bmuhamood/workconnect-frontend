// components/layout/navbar.tsx (FIXED VERSION)
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase, Sparkles, ArrowRight, User, LogOut, Menu, X, Home, Users, Info, Settings, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // FIXED: Get user's full name from first_name and last_name
  const getUserFullName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // FIXED: Get user's initials for avatar
  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/jobs', label: 'Jobs', icon: Search },
    { href: '/workers', label: 'Find Workers', icon: Users },
    { href: '/register?type=worker', label: 'For Workers', icon: User },
    { href: '/register?type=employer', label: 'For Employers', icon: Briefcase },
    { href: '/about', label: 'About', icon: Info },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
        : "bg-white border-b border-gray-100"
    )}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-1.5 w-1.5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WorkConnect
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                Uganda's #1 Job Platform
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all text-sm",
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            {user ? (
              // User is logged in - show user menu
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    className="font-medium text-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-12 w-12 rounded-full hover:bg-gray-100 transition-all p-0 group"
                    >
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow border-2 border-white ring-2 ring-blue-100">
                        {getUserInitials()}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 border border-gray-200 shadow-xl">
                    <DropdownMenuLabel className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
                            {getUserInitials()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {getUserFullName()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs font-medium text-blue-600 capitalize">
                            {user?.role || 'User'}
                          </Badge>
                          <span className="text-xs text-gray-400">Member</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="cursor-pointer px-4 py-3 hover:bg-gray-50">
                        <Briefcase className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer px-4 py-3 hover:bg-gray-50">
                        <User className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem className="cursor-pointer px-4 py-3 hover:bg-gray-50">
                        <Settings className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer px-4 py-3 hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // User is not logged in - show auth buttons
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="font-medium text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-sm px-6">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-10 w-10 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="container mx-auto px-4 py-4">
              {/* Navigation Links */}
              <div className="space-y-1 py-2">
                {navItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* User Section */}
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  // Mobile: User is logged in
                  <>
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
                          {getUserInitials()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {getUserFullName()}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user?.email || ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-medium text-blue-600 capitalize">
                              {user?.role || 'User'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-sm py-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        >
                          <Briefcase className="mr-3 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-sm py-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-sm py-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive"
                        className="w-full justify-start text-sm py-3 hover:bg-red-600 hover:text-white"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </>
                ) : (
                  // Mobile: User is not logged in
                  <div className="space-y-3 pt-2">
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">Join WorkConnect Today</p>
                      <p className="text-xs text-gray-600 mt-1">Find work or hire skilled professionals</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-center text-sm py-3 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        >
                          Sign In to Account
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button 
                          className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm py-3 shadow-md hover:shadow-lg"
                        >
                          Create Free Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}