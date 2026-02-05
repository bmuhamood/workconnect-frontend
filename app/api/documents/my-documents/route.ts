// app/api/documents/my-documents/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching documents...');
    
    // Get token from cookies or headers
    const token = request.cookies.get('access_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    console.log('Token present:', !!token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
    const apiUrl = `${backendUrl}/api/v1/documents/documents/my_documents/`;
    
    console.log('Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Documents fetched:', data.length || 0);
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        details: error.message 
      },
      { status: 500 }
    );
  }
}