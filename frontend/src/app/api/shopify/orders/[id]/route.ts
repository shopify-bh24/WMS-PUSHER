import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify'; // Adjust path if needed

interface RouteParams {
    params: { id: string };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOrderWithRetry(client: any, id: string, retryCount = 0): Promise<any> {
    try {
        const response = await client.get({
            path: `orders/${id}`,
            query: {
                fields: 'id,order_number,created_at,currency,financial_status,fulfillment_status,line_items,name,note,customer,shipping_address,billing_address,shipping_lines,subtotal_price,total_discounts,total_line_items_price,total_price,total_tax,total_shipping_price_set,source_name,tags',
            },
            timeout: 30000,
        });
        return response;
    } catch (error: any) {
        if (retryCount < MAX_RETRIES &&
            (error.message.includes('socket disconnected') ||
                error.message.includes('socket hang up') ||
                error.message.includes('ECONNRESET'))) {
            await sleep(RETRY_DELAY * (retryCount + 1));
            return fetchOrderWithRetry(client, id, retryCount + 1);
        }
        throw error;
    }
}

export async function GET(request: Request, { params }: RouteParams) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    try {
        const client = await getShopifyRestClient();
        const response = await fetchOrderWithRetry(client, id);
        const responseBody = response.body as { order: any };

        if (!responseBody?.order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            order: responseBody.order,
        });

    } catch (error: any) {
        console.error(`Error fetching order ${id}:`, error);
        const errorMessage = error.response?.body?.errors || error.message || 'Failed to fetch order';
        const statusCode = error.response?.code || 500;

        if (statusCode === 404) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        if (error.message.includes('socket disconnected') || error.message.includes('socket hang up')) {
            return NextResponse.json(
                { success: false, error: 'Network error occurred while connecting to Shopify. Please try again.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: statusCode }
        );
    }
}