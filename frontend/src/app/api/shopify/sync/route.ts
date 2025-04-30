import { NextResponse } from 'next/server';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'; // Import the adapter

// Initialize the Shopify API client
// IMPORTANT: Replace with your actual credentials and configuration
// Store these securely, preferably in environment variables
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || '',
  scopes: process.env.SHOPIFY_API_SCOPES?.split(',') || ['read_orders', 'write_orders'], // Adjust scopes as needed
  hostName: process.env.HOST?.replace(/https:\/\//, "") || '', // Your app's public host name
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false, // Set to true if building an embedded app
  // You might need session storage depending on your auth strategy
  // session_storage: new shopify.session.MemorySessionStorage(), 
});

// Helper function to get an authenticated Shopify client (example using offline token)
// You'll need a proper authentication flow (e.g., OAuth) to get a valid session
// This is a simplified example and might need adjustment based on your auth setup
async function getShopifyClient(shopName: string) {
  // In a real app, you'd load the session for the specific shop from your session storage
  // This example assumes you have an offline access token stored securely
  const offlineToken = process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN;
  const session = new Session({
    id: `offline_${shopName}`,
    shop: shopName,
    state: 'mock_state', // Placeholder state
    isOnline: false,
    accessToken: offlineToken,
    // scope: shopify.config.scopes.toString(), // Ensure scopes match
  });

  if (!offlineToken) {
    throw new Error('Missing Shopify offline access token in environment variables.');
  }

  // Use REST client for this example
  const client = new shopify.clients.Rest({ session });
  return client;
}

// Mock WMS connection (keep as is for now)
const updateWMSOrder = async (orderId: string, status: string) => {
  console.log(`Updating order ${orderId} in WMS with status: ${status}`);
  return { success: true };
};

// GET handler to fetch orders from Shopify
export async function GET(request: Request) {
  const shopName = process.env.SHOPIFY_SHOP_NAME || 'j-wi-co-jp.myshopify.com';

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET_KEY || !shopName || !process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN) {
    console.error('Missing Shopify API credentials or shop name in environment variables.');
    return NextResponse.json(
      { success: false, error: 'Server configuration error: Missing Shopify credentials.' },
      { status: 500 }
    );
  }

  try {
    const client = await getShopifyClient(shopName);
    const response = await client.get({
      path: 'orders',
      query: {
        status: 'any',
        limit: 250, // Max allowed
        fields: 'id,line_items,customer,created_at,financial_status,total_price'
      },
    });
    return NextResponse.json({
      success: true,
      orders: (response.body as any)?.orders || []
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST handler to sync orders between Shopify and WMS
export async function POST(request: Request) {
  const shopName = process.env.SHOPIFY_SHOP_NAME || 'your-shop-name.myshopify.com'; // Replace with dynamic logic

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET_KEY || !shopName || !process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN) {
    console.error('Missing Shopify API credentials or shop name in environment variables.');
    return NextResponse.json(
      { success: false, error: 'Server configuration error: Missing Shopify credentials.' },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();

    if (!data.orderId || !data.action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (orderId, action)' },
        { status: 400 }
      );
    }

    const client = await getShopifyClient(shopName);

    switch (data.action) {
      case 'update_status':
        if (!data.status) {
          return NextResponse.json(
            { success: false, error: 'Missing status for update_status action' },
            { status: 400 }
          );
        }
        // Update order status in WMS (mock)
        await updateWMSOrder(data.orderId, data.status);

        // Update Shopify order tags (example)
        // Ref: https://shopify.dev/docs/api/admin-rest/latest/resources/order#put-orders-order-id
        await client.put({
          path: `orders/${data.orderId}`,
          data: {
            order: {
              id: data.orderId,
              tags: `wms_status:${data.status}` // Example tagging
            }
          }
        });

        return NextResponse.json({
          success: true,
          message: `Order ${data.orderId} status updated to ${data.status} in WMS and tagged in Shopify`
        });

      case 'sync_all':
        // Fetch orders again for sync_all demonstration
        const response = await client.get({
          path: 'orders',
          query: { status: 'any', limit: 10 }, // Limit for demo
        });
        const ordersToSync = (response.body as any)?.orders || [];
        // Here you would implement logic to compare/sync with WMS
        console.log(`Syncing ${ordersToSync.length} orders...`);
        // Placeholder: In reality, loop through orders and update WMS
        for (const order of ordersToSync) {
          // await updateWMSOrder(order.id, order.financial_status); // Example
        }

        return NextResponse.json({
          success: true,
          message: 'Full synchronization initiated (mock)',
          syncedOrdersCount: ordersToSync.length
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action type' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Error processing sync request:', error.message);
    const errorMessage = error.response?.body?.errors || error.message || 'Failed to process synchronization request';
    const statusCode = error.response?.code || 500;
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}