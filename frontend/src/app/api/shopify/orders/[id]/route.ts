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
            timeout: 3000,
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
    const id = await Promise.resolve(params.id);

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

export async function PUT(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await Promise.resolve(context.params);
        const body = await request.json();
        console.log('Request body:', JSON.stringify(body, null, 2));

        if (!id) {
            return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
        }

        if (!body.order) {
            return NextResponse.json({ success: false, error: 'Order data is required' }, { status: 400 });
        }

        const client = await getShopifyRestClient();


        const shopifyResponse = await client.put({
            path: `orders/${id}`,
            data: {
                order: {
                    id: id,
                    note: body.order.note,
                    tags: Array.isArray(body.order.tags) ? body.order.tags.join(', ') : (typeof body.order.tags === 'string' ? body.order.tags : ''),
                    customer: body.order.customer,
                    shipping_address: body.order.shipping_address,
                    billing_address: body.order.billing_address,
                    line_items: body.order.line_items
                }
            }
        });

        console.log('Shopify response:', JSON.stringify(shopifyResponse.body, null, 2));

        if (!shopifyResponse.body?.order) {
            throw new Error('Failed to update order in Shopify');
        }

        const backendResponse = await fetch(`http://localhost:5000/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        let responseData;
        try {
            responseData = await backendResponse.json();
        } catch (error) {
            console.error('Error parsing backend response:', error);
            return NextResponse.json(
                { success: false, error: 'Invalid response from server' },
                { status: 500 }
            );
        }

        if (!backendResponse.ok) {
            return NextResponse.json(
                { success: false, error: responseData.message || 'Failed to update order in database' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            order: {
                ...responseData.order,
                note: shopifyResponse.body.order.note,
                customer: shopifyResponse.body.order.customer,
                shipping_address: shopifyResponse.body.order.shipping_address,
                billing_address: shopifyResponse.body.order.billing_address,
                line_items: shopifyResponse.body.order.line_items
            },
        });

    } catch (error: any) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.body,
            status: error.response?.code,
            stack: error.stack
        });

        const errorMessage = error.response?.body?.errors || error.message || 'Failed to update order';
        const statusCode = error.response?.code || 500;

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: error.response?.body?.errors || null
            },
            { status: statusCode }
        );
    }
}

// export async function PUT(request: Request, context: { params: { id: string } }) {
//     try {
//         const { id } = await Promise.resolve(context.params);
//         const body = await request.json();

//         if (!id) {
//             return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
//         }

//         if (!body.order) {
//             return NextResponse.json({ success: false, error: 'Order data is required' }, { status: 400 });
//         }

//         const client = await getShopifyRestClient();

//         // Update Shopify order
//         const shopifyResponse = await client.put({
//             path: `orders/${id}`,
//             data: {
//                 order: {
//                     id: id,
//                     shipping_address: body.order.shipping_address,
//                     billing_address: body.order.billing_address,
//                     customer: body.order.customer,
//                     note: body.order.note,
//                     fulfillment_status: body.order.fulfillment_status
//                 }
//             }
//         });

//         if (!shopifyResponse.body?.order) {
//             throw new Error('Failed to update order in Shopify');
//         }

//         // Update MongoDB
//         const backendResponse = await fetch(`http://localhost:5000/api/orders/${id}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 customer: body.order.customer,
//                 shipping_address: body.order.shipping_address,
//                 billing_address: body.order.billing_address,
//                 note: body.order.note,
//                 fulfillment_status: body.order.fulfillment_status
//             })
//         });

//         if (!backendResponse.ok) {
//             throw new Error('Failed to update order in database');
//         }

//         return NextResponse.json({
//             success: true,
//             order: shopifyResponse.body.order
//         });

//     } catch (error: any) {
//         console.error('Error updating order:', error);
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to update order' },
//             { status: 500 }
//         );
//     }
// }