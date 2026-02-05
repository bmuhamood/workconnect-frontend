// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get token from cookies or headers
    const token = request.cookies.get('access_token')?.value || 
                  request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    // Use environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000';
    const apiUrl = `${backendUrl}/api/v1/documents/documents/`;
    
    console.log('Uploading document to:', apiUrl);
    
    // Forward to backend API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Invalid response from server' };
    }
    
    if (!response.ok) {
      console.error('Backend upload error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return NextResponse.json(
        { 
          error: data.detail || data.error || `Upload failed (${response.status})`,
          details: data
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Document upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error.message 
      },
      { status: 500 }
    );
  }
}