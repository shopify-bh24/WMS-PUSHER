export const WMS_CONFIG = {
  // WMS API Configuration
  API_URL: process.env.WMS_API_URL || 'http://your-wms-api-url',
  API_KEY: process.env.WMS_API_KEY,

  // WMS Status Mapping
  STATUS_MAPPING: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PICKING: 'picking',
    PACKING: 'packing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    ERROR: 'error'
  },

  // WMS API Endpoints
  ENDPOINTS: {
    CONNECT: '/connect',
    ORDERS: {
      SYNC: '/orders/sync',
      STATUS: '/orders/:id/status',
      UPDATE: '/orders/:id/update'
    }
  },

  // Retry Configuration
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // milliseconds
    TIMEOUT: 30000 // milliseconds
  }
}; 