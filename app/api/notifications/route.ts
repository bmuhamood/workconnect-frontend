// app/api/notifications/route.ts
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

    // Return sample notifications
    return NextResponse.json([
      {
        id: '1',
        title: 'Document Verified',
        message: 'Your National ID has been verified successfully.',
        type: 'verification',
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'New Contract Offer',
        message: 'You have received a new contract offer from ABC Company.',
        type: 'contract',
        read: false,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'UGX 500,000 has been credited to your account.',
        type: 'payment',
        read: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        title: 'Profile Update Required',
        message: 'Please update your profile information for better job matches.',
        type: 'profile',
        read: true,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ]);
    
  } catch (error: any) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}