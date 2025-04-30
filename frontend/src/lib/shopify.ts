import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'; // Import the adapter

// Initialize the Shopify API client using environment variables
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || '',
  scopes: process.env.SHOPIFY_API_SCOPES?.split(',') || ['read_orders'], // Ensure read_orders scope
  hostName: process.env.HOST?.replace(/https?:\/\//, '') || '', // Use HOST from .env
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

// Helper function to get an authenticated Shopify REST client using the offline token
export async function getShopifyRestClient() {
  const shopName = process.env.SHOPIFY_SHOP_NAME;
  const offlineToken = process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN;

  if (!shopName || !offlineToken) {
    throw new Error('Missing Shopify shop name or offline access token in environment variables.');
  }

  // Create a session object for the offline token
  const session = new Session({
    id: `offline_${shopName}`, // Unique ID for the offline session
    shop: shopName,
    state: 'mock_state', // Placeholder, not used for offline token auth
    isOnline: false,
    accessToken: offlineToken,
    // scope: shopify.config.scopes.toString(), // Optional: verify scopes if needed
  });

  // Return an instance of the REST client
  return new shopify.clients.Rest({ session });
}

// Export the configured shopify instance if needed elsewhere
export default shopify;