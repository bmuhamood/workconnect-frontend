// app/post-job/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import JobPostingForm from '@/components/jobs/JobPostingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function PostJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      // Check if user is employer or admin
      const userIsEmployer = user?.role === 'employer' || user?.role === 'admin';
      setIsEmployer(userIsEmployer);
      
      if (!user) {
        toast.error('Please sign in to post jobs');
        router.push('/login?redirect=/post-job');
      } else if (!userIsEmployer) {
        toast.error('Only employers and administrators can post jobs');
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isEmployer) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post a Job Opportunity</h1>
            <p className="text-xl text-gray-600">
              Find the perfect skilled worker for your needs
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">High Visibility</h3>
                </div>
                <p className="text-gray-600">
                  Your job will be seen by thousands of skilled workers across Uganda
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Verified Workers</h3>
                </div>
                <p className="text-gray-600">
                  Access to pre-vetted workers with verified skills and experience
                </p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Hiring</h3>
                </div>
                <p className="text-gray-600">
                  Streamlined process from posting to hiring in days, not weeks
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tips Alert */}
          <Alert className="mb-10 border-blue-200 bg-blue-50">
            <AlertTitle className="text-blue-800">Tips for a Great Job Post</AlertTitle>
            <AlertDescription className="text-blue-700">
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Be specific about skills and experience required</li>
                <li>Include clear salary expectations to attract the right candidates</li>
                <li>Describe your company culture and work environment</li>
                <li>Specify location and work schedule clearly</li>
                <li>Highlight any benefits or unique opportunities</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Job Posting Form */}
          <JobPostingForm
            onSuccess={() => {
              toast.success('Job posted successfully!');
              setTimeout(() => {
                router.push('/dashboard/jobs');
              }, 2000);
            }}
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      </div>
    </div>
  );
}