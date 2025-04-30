import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Function to verify the Shopify webhook signature
// Ref: https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
async function verifyShopifyWebhook(request: Request): Promise<boolean> {
  const hmacHeader = request.headers.get('X-Shopify-Hmac-Sha256');
  const body = await request.text(); // Read the raw body text
  const secret = process.env.SHOPIFY_API_SECRET_KEY;

  if (!hmacHeader || !body || !secret) {
    console.error('Webhook verification failed: Missing header, body, or secret.');
    return false;
  }

  try {
    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    // Use timingSafeEqual for security
    const trusted = Buffer.from(generatedHash, 'base64');
    const untrusted = Buffer.from(hmacHeader, 'base64');

    if (trusted.length !== untrusted.length) {
        return false;
    }

    return crypto.timingSafeEqual(trusted, untrusted);
  } catch (error) {
    console.error('Error during webhook verification:', error);
    return false;
  }
}

// Mock WMS update function (replace with your actual WMS logic)
const processOrderWebhook = async (orderData: any) => {
  console.log('Processing webhook for order:', orderData.id);
  // TODO: Implement your logic to update the WMS based on the order data
  // Example: await updateWMSOrder(orderData.id, orderData.financial_status);
  console.log(`Order ${orderData.id} data received via webhook.`);
  return { success: true };
};

// POST handler for Shopify Order webhooks (e.g., orders/create, orders/updated)
export async function POST(request: Request) {
  // 1. Verify the webhook signature
  // Clone the request to read the body multiple times (once for verification, once for JSON parsing)
  const requestClone = request.clone();
  const isValid = await verifyShopifyWebhook(requestClone);

  if (!isValid) {
    console.warn('Invalid webhook signature received.');
    return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
  }

  console.log('Webhook signature verified successfully.');

  // 2. Process the webhook payload
  try {
    const orderData = await request.json(); // Parse the JSON body after verification
    const topic = request.headers.get('X-Shopify-Topic');

    console.log(`Received webhook for topic: ${topic}`);
    // console.log('Order Data:', JSON.stringify(orderData, null, 2)); // Log payload if needed

    // Add logic based on the topic if necessary
    // if (topic === 'orders/create') { ... } 
    // if (topic === 'orders/updated') { ... }

    // Process the order data (e.g., send to WMS)
    await processOrderWebhook(orderData);

    // Respond to Shopify with a 200 OK to acknowledge receipt
    return NextResponse.json({ success: true, message: 'Webhook received and processed' });

  } catch (error: any) {
    console.error('Error processing webhook payload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook payload' },
      { status: 500 }
    );
  }
}

// Optional: GET handler for verification or other purposes (if needed)
export async function GET(request: Request) {
  return NextResponse.json({ message: 'Webhook endpoint is active. Use POST for webhooks.' });
}