import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify'; // Adjust path if needed
import axios from 'axios';
import { LATEST_API_VERSION } from '@shopify/shopify-api'; // Import API version constant

// Define your backend API URL (replace with your actual backend URL)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000'; // Ensure this matches your backend port

// Helper function to parse the Link header for the next page URL
const getNextPageInfo = (linkHeader: string | undefined | null): string | null => {
    if (!linkHeader) {
        return null;
    }
    // Example Link header: <https://.../orders.json?limit=50&page_info=...>; rel="next"
    const links = linkHeader.split(',');
    const nextLink = links.find(link => link.includes('rel="next"'));
    if (!nextLink) {
        return null;
    }
    const urlMatch = nextLink.match(/<([^>]+)>/);
    if (!urlMatch) {
        return null;
    }
    const url = new URL(urlMatch[1]);
    return url.searchParams.get('page_info');
};


export async function GET(request: Request) {
    let allOrders: any[] = [];
    let nextPageInfo: string | null = null;
    let success = true;
    let errorMessage = 'Failed to fetch orders';
    let statusCode = 500;

    try {
        const client = await getShopifyRestClient();
        console.log(`Using Shopify API Version: ${LATEST_API_VERSION}`);

        do {
            const query: { [key: string]: any } = {
                status: 'any',
                limit: 250, // Fetch max allowed per page
                fields: 'id,order_number,name,created_at,processed_at,updated_at,customer,line_items,financial_status,fulfillment_status,total_price,currency,source_name,shipping_lines,tags,shipping_address,billing_address,note', // Added more fields based on schema
            };

            if (nextPageInfo) {
                query.page_info = nextPageInfo;
            }

            console.log(`Fetching orders page with params: ${JSON.stringify(query)}`);

            const response: any = await client.get({
                path: 'orders',
                query: query,
            });

            // Type assertion for the response body and headers
            const responseBody = response.body as { orders: any[] };
            const fetchedOrders = responseBody?.orders || [];
            allOrders = allOrders.concat(fetchedOrders);

            console.log(`Fetched ${fetchedOrders.length} orders. Total fetched: ${allOrders.length}`);

            // Get next page info from Link header - Safely handle different header types
            let linkHeaderValue: string | undefined | null = null;
            if (typeof response.headers?.get === 'function') {
                // Standard Headers interface approach
                linkHeaderValue = response.headers.get('Link');
            } else if (response.headers?.['Link']) {
                // Fallback for plain object headers, handle potential array
                const header = response.headers['Link'];
                linkHeaderValue = Array.isArray(header) ? header[0] : header; // Use first value if array
            }

            nextPageInfo = getNextPageInfo(linkHeaderValue); // Pass the extracted value
            console.log(`Next page_info: ${nextPageInfo}`);

            // Optional: Add a small delay to avoid hitting rate limits aggressively
            // await new Promise(resolve => setTimeout(resolve, 250)); // 250ms delay

        } while (nextPageInfo); // Continue while there's a next page

        console.log(`Finished fetching all orders. Total: ${allOrders.length}`);

        console.log(JSON.stringify(allOrders, null, 2))

        // **Send ALL fetched orders to the backend for saving**
        if (allOrders.length > 0) {
            console.log(`Sending ${allOrders.length} orders to backend sync endpoint...`);
            try {
                const syncResponse = await axios.post(`${BACKEND_API_URL}/api/orders/sync`, {
                    orders: allOrders // Send the complete list
                });
                // console.log('Backend sync successful:', syncResponse.data);
            } catch (syncError: any) {
                // Log the error but don't necessarily block the frontend response
                console.error('Error syncing orders to backend:', syncError.response?.data || syncError.message);
                // Optionally, you could set success to false or modify the error message here
                // success = false;
                // errorMessage = 'Fetched orders but failed to sync to backend';
                // statusCode = 500;
            }
        } else {
            console.log('No orders found in Shopify to sync.');
        }

    } catch (error: any) {
        console.error('Error fetching orders from Shopify:', error);
        // Extract more specific error message if available
        errorMessage = error.response?.body?.errors || error.message || 'Failed to fetch orders';
        statusCode = error.response?.code || 500;
        success = false;
        allOrders = []; // Clear orders on error
    }

    // Return the result to the frontend dashboard
    return NextResponse.json(
        { success: success, orders: allOrders, error: success ? undefined : errorMessage },
        { status: success ? 200 : statusCode }
    );
}