import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import { type NextRequest } from 'next/server';

// Define the handler using explicit Next.js naming convention
export async function PUT(
    request: NextRequest, 
    { params }: { params: { id: string } }
) {
    try {
        // Extract the ID from URL parameters
        const id = params.id;
        
        // Get session for authentication
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();

        // Make the request to your backend API
        const response = await axios.put(
            `${process.env.BACKEND_URL}/api/orders/${id}`,
            body,
            {
                headers: {
                    'Authorization': `Bearer ${session.user.accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Return the response
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Error updating order:', error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.message || 'Failed to update order' },
            { status: error.response?.status || 500 }
        );
    }
} 