// app/auth/verify-phone/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, CheckCircle, ArrowLeft, Clock, AlertCircle, 
  RefreshCw, Shield, Bug
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes = 600 seconds
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [hasRequestedOTP, setHasRequestedOTP] = useState(false);
  
  // Get params from URL
  const email = searchParams.get('email') || '';
  const rawPhone = searchParams.get('phone') || '';
  const role = searchParams.get('role') || '';

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ FIXED: Format phone number to international format
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Format for Uganda (+256)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      // 0743790184 -> +256743790184
      return '+256' + cleaned.substring(1);
    } else if (cleaned.startsWith('256') && cleaned.length === 12) {
      // 256743790184 -> +256743790184
      return '+' + cleaned;
    } else if (cleaned.length === 9) {
      // 743790184 -> +256743790184
      return '+256' + cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      // 743790184 -> +256743790184
      return '+256' + cleaned;
    }
    
    // If already has +, keep as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: add +256 prefix
    return '+256' + cleaned.replace(/^0+/, '');
  };

  const phone = formatPhoneNumber(rawPhone);
  const displayPhone = rawPhone; // Show original format in UI

  // 🚀 DEVELOPMENT: Auto-request OTP on page load (only once)
  useEffect(() => {
    if (phone && !hasRequestedOTP) {
      requestOTP();
      setHasRequestedOTP(true);
    }
  }, [phone]);

  // Timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 🚀 DEVELOPMENT: Auto-fill OTP from debug info
  useEffect(() => {
    if (debugOtp && debugOtp.length === 6) {
      const otpArray = debugOtp.split('');
      setOtp(otpArray);
      toast.success(`🔧 Dev OTP auto-filled: ${debugOtp}`, {
        duration: 8000,
        icon: '🔧'
      });
      
      // Auto-verify after 1 second (for faster development)
      const timer = setTimeout(() => {
        handleVerify(debugOtp);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [debugOtp]);

  // ✅ FIXED: Request OTP with formatted phone number
  const requestOTP = async () => {
    if (!phone) {
      setError('Phone number is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ CORRECT ENDPOINT: /users/auth/phone/request-verification/
      console.log('📱 Requesting OTP for phone:', {
        raw: rawPhone,
        formatted: phone
      });
      
      const response = await api.post('/users/auth/phone/request-verification/', {
        phone: phone // Send FORMATTED phone number (+256...)
      });

      console.log('📱 OTP Request Response:', response.data);

      if (response.status === 200) {
        toast.success('📱 Verification code sent!');
        setCountdown(600); // Reset to 10 minutes
        
        // 🚀 DEVELOPMENT: Show OTP in console and UI
        if (response.data.debug_info?.otp) {
          const devOtp = response.data.debug_info.otp;
          console.log('🔧 ==================================');
          console.log('🔧 DEVELOPMENT MODE - OTP:', devOtp);
          console.log('🔧 Phone:', phone);
          console.log('🔧 Raw Phone:', rawPhone);
          console.log('🔧 Expires in:', response.data.debug_info.ttl_minutes, 'minutes');
          console.log('🔧 ==================================');
          
          setDebugOtp(devOtp);
          
          // Show OTP in toast for easy copying
          toast.success(`🔧 Development OTP: ${devOtp}`, {
            duration: 10000,
            icon: '🔧',
          });
        }
      }
    } catch (err: any) {
      console.error('❌ OTP request failed:', err);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        
        // Handle specific error messages
        if (err.response.status === 400) {
          setError('Invalid phone number format. Please use format: 0743790184');
        } else {
          setError(err.response.data?.error || err.response.data?.detail || 'Failed to send verification code');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      
      toast.error('Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Verify OTP with formatted phone number
  const handleVerify = async (otpValue?: string) => {
    const otpString = otpValue || otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!phone) {
      setError('Phone number is missing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ CORRECT ENDPOINT: /users/auth/phone/verify/
      // ✅ CORRECT PAYLOAD: { phone, otp } with FORMATTED phone
      console.log('✅ Verifying OTP for phone:', {
        raw: rawPhone,
        formatted: phone
      }, 'OTP:', otpString);
      
      const response = await api.post('/users/auth/phone/verify/', {
        phone: phone, // Send FORMATTED phone number (+256...)
        otp: otpString
      });

      console.log('✅ Verify Response:', response.data);

      if (response.status === 200) {
        toast.success('✅ Phone verified successfully!');
        
        // Update user verification status in localStorage
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          userData.phone_verified = true;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Also store tokens if returned from verification
        if (response.data.tokens) {
          localStorage.setItem('access_token', response.data.tokens.access);
          localStorage.setItem('refresh_token', response.data.tokens.refresh);
          
          // Set cookies for middleware
          document.cookie = `access_token=${response.data.tokens.access}; path=/; max-age=3600; SameSite=Lax`;
          document.cookie = `refresh_token=${response.data.tokens.refresh}; path=/; max-age=86400; SameSite=Lax`;
        }
        
        // Set cookie for middleware
        document.cookie = 'phone_verified=true; path=/; max-age=3600';
        
        // Redirect based on role
        setTimeout(() => {
          if (role === 'employer') {
            router.push('/dashboard/employer');
          } else if (role === 'worker') {
            router.push('/dashboard/worker');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error('❌ Verification failed:', err);
      
      if (err.response) {
        const errorMsg = err.response.data?.error || err.response.data?.detail;
        
        if (errorMsg?.includes('expired')) {
          setError('Code expired. Please request a new one.');
        } else if (errorMsg?.includes('attempt')) {
          setError(errorMsg); // Shows "Invalid OTP. X attempts remaining."
        } else {
          setError(errorMsg || 'Invalid verification code');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Resend OTP with formatted phone number
  const handleResend = async () => {
    if (!phone) {
      setError('Phone number is missing');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      // ✅ CORRECT ENDPOINT: /users/auth/phone/resend-otp/
      console.log('📱 Resending OTP for phone:', {
        raw: rawPhone,
        formatted: phone
      });
      
      const response = await api.post('/users/auth/phone/resend-otp/', {
        phone: phone // Send FORMATTED phone number (+256...)
      });

      console.log('📱 Resend Response:', response.data);

      if (response.status === 200) {
        toast.success('📱 New verification code sent!');
        setCountdown(600); // Reset to 10 minutes
        setOtp(['', '', '', '', '', '']); // Clear OTP
        setDebugOtp(null); // Clear debug OTP
        
        // 🚀 DEVELOPMENT: Show new OTP
        if (response.data.debug?.otp) {
          const devOtp = response.data.debug.otp;
          console.log('🔧 ==================================');
          console.log('🔧 DEVELOPMENT MODE - NEW OTP:', devOtp);
          console.log('🔧 Phone:', phone);
          console.log('🔧 Raw Phone:', rawPhone);
          console.log('🔧 ==================================');
          
          setDebugOtp(devOtp);
          
          toast.success(`🔧 New OTP: ${devOtp}`, {
            duration: 10000,
            icon: '🔧',
          });
        }
        
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (err: any) {
      console.error('❌ Resend failed:', err);
      
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before trying again.');
      } else if (err.response?.status === 400) {
        setError('Invalid phone number format. Please use format: 0743790184');
      } else {
        setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to resend code');
      }
      
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  // ✅ FIXED: Check OTP Status with formatted phone number
  const checkOTPStatus = async () => {
    try {
      const response = await api.get(`/users/auth/phone/status/${encodeURIComponent(phone)}/`);
      console.log('📊 OTP Status:', response.data);
      
      if (response.data.has_otp) {
        toast.success(`OTP still valid for ${response.data.ttl_minutes} minutes`);
      } else {
        toast.error('No active OTP found');
      }
    } catch (err) {
      console.error('Failed to check OTP status:', err);
    }
  };

  // OTP Input Handlers (unchanged)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const numbers = paste.replace(/\D/g, '').split('').slice(0, 6);
    
    if (numbers.length === 6) {
      const newOtp = [...otp];
      numbers.forEach((num, index) => {
        newOtp[index] = num;
      });
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      
      setTimeout(() => {
        handleVerify(newOtp.join(''));
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!rawPhone) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>No phone number provided</CardDescription>
            <p className="text-sm text-gray-500 mt-2">
              Please go back to registration and ensure your phone number is entered correctly.
            </p>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          href={role === 'employer' ? '/register/employer' : '/register/worker'} 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to registration
        </Link>

        <Card className="border-none shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 flex items-center justify-center shadow-xl">
                <Phone className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Verify Your Phone
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter the 6-digit code sent to your phone
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Phone Info Alert - Show both formats */}
            <Alert className="bg-blue-50 border-blue-200">
              <Phone className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-medium">Code sent to:</div>
                <div className="font-bold text-lg">{displayPhone}</div>
                {phone !== displayPhone && (
                  <div className="text-xs mt-1 text-blue-600">
                    Formatted: {phone}
                  </div>
                )}
                {email && (
                  <div className="text-xs mt-1 text-blue-600">
                    Account: {email}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* 🚀 DEVELOPMENT: Debug Info Banner */}
            {debugOtp && process.env.NODE_ENV === 'development' && (
              <Alert className="bg-amber-50 border-amber-200">
                <Bug className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">🔧 Development Mode</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(debugOtp);
                        toast.success('OTP copied to clipboard!');
                      }}
                      className="h-6 px-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800"
                    >
                      Copy OTP
                    </Button>
                  </div>
                  <div className="mt-2 font-mono text-center">
                    <span className="text-sm text-gray-600">OTP: </span>
                    <span className="font-bold text-2xl tracking-wider">{debugOtp}</span>
                  </div>
                  <div className="text-xs text-amber-700 mt-2 text-center">
                    This code is only visible in development mode
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-500">
                Enter the 6-digit verification code
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Code expires in: <span className="font-mono font-bold">{formatTime(countdown)}</span>
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleVerify()}
                className="w-full py-6 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verify Phone Number
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleResend}
                  variant="outline"
                  className="flex-1 py-5"
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend
                    </>
                  )}
                </Button>

                {/* Development Only: Check Status Button */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={checkOTPStatus}
                    variant="outline"
                    size="icon"
                    className="py-5 px-3"
                    title="Check OTP Status"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Development Helper */}
            {process.env.NODE_ENV === 'development' && !debugOtp && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">🔧 Development Mode</p>
                <p className="text-xs text-gray-600 font-mono mt-1">
                  Phone number will be formatted from <span className="font-bold">{displayPhone}</span> to <span className="font-bold">{phone}</span>
                </p>
                <div className="mt-2 p-2 bg-gray-800 rounded-md">
                  <code className="text-xs text-green-400 block">
                    ==================================================
                  </code>
                  <code className="text-xs text-green-400 block">
                    📱 OTP VERIFICATION (DEVELOPMENT MODE)
                  </code>
                  <code className="text-xs text-green-400 block">
                    ==================================================
                  </code>
                  <code className="text-xs text-green-400 block">
                    Phone: {phone}
                  </code>
                  <code className="text-xs text-green-400 block">
                    OTP Code: [6-digit code appears here]
                  </code>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-100 pt-6">
            <p className="text-center text-sm text-gray-600">
              Having trouble?{' '}
              <Link href="/support" className="font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">
                Contact Support
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}