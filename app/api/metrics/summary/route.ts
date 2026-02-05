// app/api/metrics/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or headers
    const token = request.cookies.get('access_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return sample metrics based on user role
    // In production, you would fetch from backend
    const userRole = 'worker'; // This should come from token decoding
    
    const sampleMetrics = {
      worker: {
        total_earnings: 1550000,
        active_contracts: 2,
        completed_jobs: 5,
        average_rating: 4.5,
        verification_score: 85,
      },
      employer: {
        total_spent: 4500000,
        active_workers: 3,
        completed_contracts: 8,
        satisfaction_rate: 92,
        pending_payments: 850000,
      },
      admin: {
        total_users: 1248,
        active_contracts: 356,
        monthly_revenue: 45200000,
        pending_verifications: 42,
        user_growth: 12,
        contract_growth: 8,
        revenue_growth: 15,
      }
    };
    
    return NextResponse.json(sampleMetrics[userRole as keyof typeof sampleMetrics] || {});
    
  } catch (error: any) {
    console.error('Metrics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}