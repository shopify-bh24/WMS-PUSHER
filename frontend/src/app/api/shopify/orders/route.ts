import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify'; // Adjust path if needed

export async function GET(request: Request) {
  try {
    const client = await getShopifyRestClient();

    // Fetch orders from Shopify, requesting specific fields including dates
    const response = await client.get({
      path: 'orders',
      query: {
        status: 'any', // Fetch orders of any status
        limit: 250,     // Limit the number of results (max 250)
        fields: 'id,order_number,name,created_at,processed_at,updated_at,customer,line_items,financial_status,fulfillment_status,total_price,currency,source_name,shipping_lines,tags', // Add desired date fields
      },
    });

    // Type assertion for the response body
    const responseBody = response.body as { orders: any[] };

    return NextResponse.json({
      success: true,
      orders: responseBody?.orders || [],
    });

  } catch (error: any) {
    console.error('Error fetching orders:', error);
    // Extract more specific error message if available
    const errorMessage = error.response?.body?.errors || error.message || 'Failed to fetch orders';
    const statusCode = error.response?.code || 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}