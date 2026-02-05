// app/api/payments/recent/route.ts
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

    // Use environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
    
    // Try to get payments from backend
    try {
      const response = await fetch(
        `${backendUrl}/api/v1/payments/worker-payments/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data.results || []);
      }
    } catch (backendError) {
      console.log('Backend payments endpoint not available, returning sample data');
    }
    
    // Return sample data if backend is not available
    return NextResponse.json([
      {
        id: '1',
        amount: 500000,
        status: 'completed',
        scheduled_date: new Date().toISOString(),
        payment_method: 'mobile_money_mtn',
        description: 'March Salary Payment'
      },
      {
        id: '2',
        amount: 750000,
        status: 'pending',
        scheduled_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'bank_transfer',
        description: 'April Salary Payment'
      },
      {
        id: '3',
        amount: 300000,
        status: 'completed',
        scheduled_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'mobile_money_airtel',
        description: 'February Salary Payment'
      }
    ]);
    
  } catch (error: any) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}