import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { customer } = body;

        const shopify = await getShopifyRestClient();

        const response = await shopify.put({
            path: `customers/${params.id}`,
            data: { customer }
        });

        return NextResponse.json(response.body);
    } catch (error: any) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update customer' },
            { status: error.status || 500 }
        );
    }
} 