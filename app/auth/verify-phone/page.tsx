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
  RefreshCw, Shield 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

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

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
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
      
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (otpValue?: string) => {
    const otpString = otpValue || otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-phone/', {
        email,
        otp: otpString,
      });
      
      toast.success('Phone verified successfully!');
      router.push('/login?verified=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return;

    setIsResending(true);
    try {
      await api.post('/auth/resend-otp/', { email });
      setCountdown(60);
      toast.success('OTP resent successfully!');
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/register" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to registration
        </Link>

        <Card className="border-none shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Verify Your Phone
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter the 6-digit code sent to your phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            {email && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Phone className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Code sent to phone linked with <strong>{email}</strong>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-8">
              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[index] = el;
                        }
                      }}                      
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">
                  Enter the 6-digit verification code
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {countdown > 0 ? (
                      `Resend code in ${countdown}s`
                    ) : (
                      'Code expired'
                    )}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={() => handleSubmit()}
                  className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
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

                <Button
                  onClick={handleResendOTP}
                  variant="outline"
                  className="w-full py-5"
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-2"></div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    This verification helps ensure account security and prevent fraud.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    The code expires in 10 minutes. If you don't receive it, check your spam folder or request a new code.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-gray-600">
              Having trouble?{' '}
              <Link href="/support" className="font-semibold text-purple-600 hover:text-purple-800 hover:underline">
                Contact Support
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}