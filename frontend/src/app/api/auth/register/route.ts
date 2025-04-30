import { NextResponse } from 'next/server';
// Remove bcrypt import if not used directly here, it's handled in db.ts
// import { hash } from 'bcrypt'; 
import { addUser, findUserByUsername } from '@/lib/db'; // Import shared DB functions

// Remove the local mock database
// const mockUserDatabase: any[] = [];

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

    // Check if user already exists using the shared function
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 409 } // Conflict
      );
    }

    // Add the new user using the shared function (hashing is handled inside)
    const newUser = await addUser({ username, password, role });

    console.log('New user registered via API:', { id: newUser.id, username: newUser.username, role: newUser.role });

    // Return only non-sensitive user info
    return NextResponse.json(
      { 
        success: true, 
        user: newUser // The addUser function already returns the user without the password
      },
      { status: 201 } // Created
    );

  } catch (error) {
    console.error('Registration error:', error);
    // Check if it's a known error type or provide a generic message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error during registration';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}