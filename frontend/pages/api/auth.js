import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
    scopes: process.env.SHOPIFY_API_SCOPES.split(','),
    hostName: process.env.HOST,
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
});

export default shopify;

// Helper function for creating admin client
export function createAdminClient() {
    return new shopify.clients.Rest({
        session: {
            shop: process.env.SHOPIFY_SHOP_NAME,
            accessToken: process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN,
        },
    });
}