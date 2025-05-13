import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { username, password, role } = await request.json();

    // Basic validation
    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing username, password, or role' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'warehouse') {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const backendResponse = await axios.post(
      `${process.env.BACKEND_URL}/api/auth/register`,
      { username, password, role },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Transform backend response to match expected frontend format
    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: backendResponse.data.user
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error.response?.data || error);

    // Handle different error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status || 500;
      const message = error.response.data?.message || 'Registration failed';

      return NextResponse.json(
        { success: false, error: message },
        { status }
      );
    } else if (error.request) {
      // The request was made but no response was received
      return NextResponse.json(
        { success: false, error: 'No response from authentication server' },
        { status: 503 }
      );
    } else {
      const errorMessage = error.message || 'Internal server error during registration';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  }
}