import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify'; // Adjust path if needed

interface RouteParams {
    params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
    const { id } = params; // Extract the order ID from the URL

    if (!id) {
        return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    try {
        const client = await getShopifyRestClient();

        const response = await client.get({
            path: `orders/${id}`,
            query: {
                fields: 'id,order_number,created_at,currency,financial_status,fulfillment_status,line_items,name,note,customer,shipping_address,billing_address,shipping_lines,subtotal_price,total_discounts,total_line_items_price,total_price,total_tax,total_shipping_price_set,source_name,tags',
            },
        });

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
        // Extract more specific error message if available
        const errorMessage = error.response?.body?.errors || error.message || 'Failed to fetch order';
        const statusCode = error.response?.code || 500;

        // Handle specific case where order ID might be invalid format or not found
        if (statusCode === 404) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: statusCode }
        );
    }
}



