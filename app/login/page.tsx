// app/login/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, 
  Sparkles, Smartphone, Shield, Zap, CheckCircle,
  LogIn, Fingerprint, Smartphone as PhoneIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import ClientOnly from '@/components/ClientOnly';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [showSocialLogin, setShowSocialLogin] = useState<boolean>(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push(from);
    }
  }, [isAuthenticated, router, from]);

  if (isAuthenticated()) {
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      toast.success('Welcome back! Login successful! 🎉');
      router.push(from);
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handlePhoneLogin = () => {
    toast('Phone login coming soon!', {
      icon: '📱',
    });
  };

  const handleGoogleLogin = () => {
    toast('Google login coming soon!', {
      icon: '🔜',
    });
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-purple-50/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 right-1/3 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 hidden lg:block">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/30 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-500/60" />
          </div>
        </div>

        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/30 flex items-center justify-center">
            <Zap className="h-8 w-8 text-purple-500/60" />
          </div>
        </div>

        <div className="w-full max-w-5xl">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to home</span>
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Features/Info */}
            <div className="hidden lg:block">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <LogIn className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome Back!
                    </h2>
                    <p className="text-gray-600">Access your WorkConnect account</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                      Why WorkConnect?
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: Shield, text: 'Verified & secure platform', color: 'text-blue-500' },
                        { icon: CheckCircle, text: 'Instant job notifications', color: 'text-green-500' },
                        { icon: Smartphone, text: 'Mobile app available', color: 'text-purple-500' },
                        { icon: Zap, text: 'Quick job matching', color: 'text-amber-500' }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3 group">
                          <div className={`h-10 w-10 rounded-xl ${feature.color.replace('text-', 'bg-')}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <feature.icon className={`h-5 w-5 ${feature.color}`} />
                          </div>
                          <span className="text-gray-700 font-medium">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">New to WorkConnect?</h4>
                    <p className="text-gray-600 mb-6">
                      Join thousands of Ugandans who have found quality work or reliable workers through our platform.
                    </p>
                    <Link href="/register">
                      <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 rounded-xl shadow-lg">
                        Create Free Account
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Login Form */}
            <div>
              <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                
                <CardHeader className="pb-6 pt-10">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
                        <Lock className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-3xl font-bold text-center text-gray-900 mb-2">
                      Sign In to Your Account
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600 text-lg">
                      Enter your credentials to continue
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-8">
                  {error && (
                    <Alert variant="destructive" className="mb-8 animate-in slide-in-from-top duration-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Social Login Options */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="font-medium text-gray-700">Continue with Google</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={handlePhoneLogin}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <PhoneIcon className="h-5 w-5 text-gray-700" />
                        <span className="font-medium text-gray-700">Use Phone</span>
                      </button>
                    </div>
                    
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Email Address
                        </Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="pl-12 py-7 text-base bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                            Password
                          </Label>
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="pl-12 pr-12 py-7 text-base bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 rounded-xl"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-7 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      {isLoading ? (
                        <>
                          <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent mr-3"></div>
                          Signing you in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-3 h-5 w-5" />
                          Sign In to Your Account
                          <ArrowLeft className="ml-3 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-10 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Don't have an account yet?
                      </p>
                      <Link href="/register">
                        <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 py-6 rounded-xl font-medium">
                          Create New Account
                          <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Download Banner */}
          <div className="mt-12 lg:hidden">
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-gray-900">Get the mobile app</h4>
                    <p className="text-sm text-gray-600">Access jobs on the go</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}