import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node'; // Import the adapter

// Validate required environment variables
const validateEnvVars = () => {
    const requiredVars = {
        SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
        SHOPIFY_API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY,
        SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
        SHOPIFY_OFFLINE_ACCESS_TOKEN: process.env.SHOPIFY_OFFLINE_ACCESS_TOKEN,
        HOST: process.env.HOST
    };

    const missingVars = Object.entries(requiredVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

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
    validateEnvVars();

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

const getNextPageInfo = (linkHeader: string | undefined | null): string | null => {
    if (!linkHeader) {
        return null;
    }

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

export const getShopifyOrders = async () => {
    let allOrders: any[] = [];
    let nextPageInfo: string | null = null;

    try {
        validateEnvVars();
        const client = await getShopifyRestClient();
        do {
            const query: { [key: string]: any } = {
                status: 'any',
                limit: 250,
                fields: 'id,order_number,name,created_at,processed_at,updated_at,customer,line_items,financial_status,fulfillment_status,total_price,currency,source_name,shipping_lines,tags,shipping_address,billing_address,note',
            };

            if (nextPageInfo) {
                query.page_info = nextPageInfo;
            }

            const response: any = await client.get({
                path: 'orders',
                query: query,
            });

            const responseBody = response.body as { orders: any[] };
            const fetchedOrders = responseBody?.orders || [];
            allOrders = allOrders.concat(fetchedOrders);

            let linkHeaderValue: string | undefined | null = null;
            if (typeof response.headers?.get === 'function') {
                linkHeaderValue = response.headers.get('Link');
            } else if (response.headers?.['Link']) {
                const header = response.headers['Link'];
                linkHeaderValue = Array.isArray(header) ? header[0] : header;
            }

            nextPageInfo = getNextPageInfo(linkHeaderValue);

        } while (nextPageInfo);

        return allOrders;
    } catch (error: any) {
        console.error('Error fetching orders from Shopify:', error);
        throw new Error(
            error.response?.body?.errors ||
            error.message ||
            'Failed to fetch orders from Shopify. Please check your API credentials and try again.'
        );
    }
};