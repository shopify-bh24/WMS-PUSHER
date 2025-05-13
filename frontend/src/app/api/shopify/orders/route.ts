import { NextResponse } from 'next/server';
import { getShopifyOrders } from '@/lib/shopify';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import config from '@/config';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.BACKEND_URL;

export async function GET() {
    try {
        console.log('Fetching orders from Shopify...');
        const orders = await getShopifyOrders();
        console.log(`Successfully fetched ${orders.length} orders from Shopify`);

        try {
            console.log('Saving orders to MongoDB...');
            // Get the session to access the token
            const session = await getServerSession(authOptions);
            if (!session?.accessToken) {
                throw new Error('No authentication token available');
            }

            const saveResponse = await axios.post(
                `${BACKEND_API_URL}/api/orders/sync`,
                { orders },
                {
                    headers: {
                        'Authorization': `Bearer ${session.accessToken}`
                    }
                }
            );
        } catch (saveError: any) {
            console.error('Error saving to MongoDB:', saveError.response?.data || saveError.message);
        }

        return NextResponse.json({
            success: true,
            orders
        });
    } catch (error: any) {
        console.error('Error in orders API route:', error.response?.data || error.message);
        return NextResponse.json(
            {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch orders',
                details: error.response?.data || error
            },
            { status: 500 }
        );
    }
}