import { WMS_CONFIG } from '@/config/wms';

// Function to format order data for WMS
export function formatOrderForWMS(order: any) {
  return {
    orderId: order.id,
    orderNumber: order.order_number,
    customer: {
      name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim(),
      email: order.customer.email,
      phone: order.customer.phone
    },
    shippingAddress: {
      name: order.shipping_address.name,
      address1: order.shipping_address.address1,
      address2: order.shipping_address.address2,
      city: order.shipping_address.city,
      province: order.shipping_address.province,
      country: order.shipping_address.country,
      zip: order.shipping_address.zip,
      phone: order.shipping_address.phone
    },
    items: order.items.map((item: any) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      variant: item.variant_title
    })),
    status: order.fulfillment_status || 'pending',
    total: order.total,
    currency: order.currency,
    notes: order.notes
  };
}

// Function to map WMS status to Shopify status
export function mapWMSStatusToShopify(wmsStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'pending',
    'processing': 'processing',
    'picking': 'processing',
    'packing': 'processing',
    'shipped': 'fulfilled',
    'delivered': 'fulfilled',
    'cancelled': 'cancelled',
    'error': 'error'
  };

  return statusMap[wmsStatus.toLowerCase()] || 'pending';
}

// Function to map Shopify status to WMS status
export function mapShopifyStatusToWMS(shopifyStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'pending',
    'processing': 'processing',
    'fulfilled': 'shipped',
    'cancelled': 'cancelled',
    'error': 'error'
  };

  return statusMap[shopifyStatus.toLowerCase()] || 'pending';
}

// Function to validate WMS response
export function validateWMSResponse(response: any): boolean {
  if (!response || typeof response !== 'object') return false;
  if (!response.success && response.error) return false;
  return true;
}

// Function to handle WMS errors
export function handleWMSError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred while communicating with WMS';
}

// Function to retry WMS operations
export async function retryWMSOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = WMS_CONFIG.RETRY_CONFIG.MAX_RETRIES,
  delay: number = WMS_CONFIG.RETRY_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
} 