import { NextResponse } from 'next/server';

// WMS API configuration
const WMS_API_URL = process.env.WMS_API_URL || 'http://your-wms-api-url';
const WMS_API_KEY = process.env.WMS_API_KEY;

// Function to connect to WMS
async function connectToWMS() {
  try {
    const response = await fetch(`${WMS_API_URL}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WMS_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to connect to WMS');
    }

    return await response.json();
  } catch (error) {
    console.error('WMS connection error:', error);
    throw error;
  }
}

// Function to sync order with WMS
async function syncOrderWithWMS(orderId: string, orderData: any) {
  try {
    const response = await fetch(`${WMS_API_URL}/orders/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WMS_API_KEY}`
      },
      body: JSON.stringify({
        orderId,
        orderData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to sync order with WMS');
    }

    return await response.json();
  } catch (error) {
    console.error('WMS sync error:', error);
    throw error;
  }
}

// GET handler to check WMS status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // Connect to WMS
    await connectToWMS();
    
    // Get order status from WMS
    const response = await fetch(`${WMS_API_URL}/orders/${orderId}/status`, {
      headers: {
        'Authorization': `Bearer ${WMS_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get order status from WMS');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      wms_status: data.status,
      message: 'Successfully retrieved WMS status'
    });
  } catch (error: any) {
    console.error('Error in WMS sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to sync with WMS'
      },
      { status: 500 }
    );
  }
}

// POST handler to sync order with WMS
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const orderData = await request.json();

    // Connect to WMS
    await connectToWMS();
    
    // Sync order with WMS
    const syncResult = await syncOrderWithWMS(orderId, orderData);

    return NextResponse.json({
      success: true,
      wms_status: syncResult.status,
      message: 'Successfully synchronized with WMS'
    });
  } catch (error: any) {
    console.error('Error in WMS sync:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to sync with WMS'
      },
      { status: 500 }
    );
  }
} 