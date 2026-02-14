// app/dashboard/page.tsx - FIXED
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import WorkerDashboard from '@/components/dashboard/WorkerDashboard';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading: dataLoading, error, refreshData } = useDashboard();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Handler functions
  const handleNewContract = () => {
    router.push('/contracts/new');
  };

  const handleViewAll = (type: string) => {
    router.push(`/${type}`);
  };

  const handlePostJob = () => {
    router.push('/post-job');
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render based on role
  switch (user.role) {
    case 'worker':
      return <WorkerDashboard />;
    case 'employer':
      return (
        <EmployerDashboard 
          user={user}
          onNewContract={handleNewContract}
          onViewAll={handleViewAll}
          onPostJob={handlePostJob}
          // ✅ FIXED: Removed contracts and payments props - they don't exist in EmployerDashboardProps
        />
      );
    case 'admin':
    case 'super_admin':
      return (
        <SuperAdminDashboard 
          user={user}
          data={data || { metrics: {} }}
          onRefresh={refreshData}
        />
      );
    default:
      return (
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="mt-4 bg-gradient-to-r from-emerald-600 to-blue-600"
          >
            Go Home
          </Button>
        </div>
      );
  }
}