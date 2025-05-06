import WMS from '../models/WMS.js';
import Order from '../models/Order.js';
class WMSService {
    // Connect to WMS
    async connect() {
        try {
            // Here you would implement the actual WMS connection logic
            // For now, we'll return a mock successful connection
            return {
                success: true,
                message: 'Successfully connected to WMS',
                connection: {
                    status: 'connected',
                    lastSync: new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error('WMS connection error:', error);
            throw new Error('Failed to connect to WMS');
        }
    }
    // Format customer data
    formatCustomerData(customerData) {
        let tags = [];
        if (typeof customerData.tags === 'string') {
            tags = customerData.tags.split(',').map((tag) => tag.trim());
        }
        else if (Array.isArray(customerData.tags)) {
            tags = customerData.tags;
        }
        return {
            admin_graphql_api_id: customerData.admin_graphql_api_id || '',
            email: customerData.email || '',
            first_name: customerData.first_name || '',
            last_name: customerData.last_name || '',
            note: customerData.note || '',
            tags,
            verified_email: customerData.verified_email || false,
            created_at: customerData.created_at || new Date(),
            updated_at: customerData.updated_at || new Date(),
            currency: customerData.currency || '',
            email_marketing_consent: {
                consent_updated_at: customerData.email_marketing_consent?.consent_updated_at || new Date(),
                opt_in_level: customerData.email_marketing_consent?.opt_in_level || '',
                state: customerData.email_marketing_consent?.state || ''
            },
            sms_marketing_consent: {
                state: customerData.sms_marketing_consent?.state || ''
            },
            tax_exempt: customerData.tax_exempt || false,
            tax_exemptions: customerData.tax_exemptions || [],
            multipass_identifier: customerData.multipass_identifier || '',
            phone: customerData.phone || ''
        };
    }
    // Sync order with WMS
    async syncOrder(orderId, orderData) {
        try {
            // Find or create WMS record
            let wmsRecord = await WMS.findOne({ orderId });
            if (!wmsRecord) {
                wmsRecord = new WMS({
                    orderId,
                    wmsOrderId: `WMS-${orderId}`, // Generate a WMS order ID
                    status: 'pending',
                    customer: this.formatCustomerData(orderData.customer || {})
                });
            }
            else {
                // Update customer data if provided
                if (orderData.customer) {
                    wmsRecord.customer = this.formatCustomerData(orderData.customer);
                }
            }
            // Update WMS record
            wmsRecord.status = orderData.status || wmsRecord.status;
            wmsRecord.lastSync = new Date();
            wmsRecord.syncHistory.push({
                status: wmsRecord.status,
                message: 'Order synchronized with WMS',
                timestamp: new Date()
            });
            await wmsRecord.save();
            // Update order status in the main Order collection
            await Order.findByIdAndUpdate(orderId, {
                wmsStatus: wmsRecord.status,
                customer: wmsRecord.customer
            });
            return {
                success: true,
                wms_status: wmsRecord.status,
                customer: wmsRecord.customer,
                message: 'Successfully synchronized with WMS'
            };
        }
        catch (error) {
            console.error('WMS sync error:', error);
            throw new Error('Failed to sync order with WMS');
        }
    }
    // Get order status from WMS
    async getOrderStatus(orderId) {
        try {
            const wmsRecord = await WMS.findOne({ orderId });
            if (!wmsRecord) {
                throw new Error('Order not found in WMS');
            }
            return {
                success: true,
                wms_status: wmsRecord.status,
                customer: wmsRecord.customer,
                message: 'Successfully retrieved WMS status'
            };
        }
        catch (error) {
            console.error('Error getting WMS status:', error);
            throw new Error('Failed to get order status from WMS');
        }
    }
    // Update customer data
    async updateCustomer(orderId, customerData) {
        try {
            const wmsRecord = await WMS.findOne({ orderId });
            if (!wmsRecord) {
                throw new Error('Order not found in WMS');
            }
            wmsRecord.customer = this.formatCustomerData(customerData);
            wmsRecord.lastSync = new Date();
            await wmsRecord.save();
            return {
                success: true,
                customer: wmsRecord.customer,
                message: 'Successfully updated customer data in WMS'
            };
        }
        catch (error) {
            console.error('Error updating customer data:', error);
            throw new Error('Failed to update customer data in WMS');
        }
    }
    // Update inventory
    async updateInventory(sku, quantity) {
        try {
            // Here you would implement the actual inventory update logic
            // For now, we'll just log the update
            console.log(`Updating inventory for SKU ${sku}: ${quantity} units`);
            return {
                success: true,
                message: 'Inventory updated successfully'
            };
        }
        catch (error) {
            console.error('Inventory update error:', error);
            throw new Error('Failed to update inventory');
        }
    }
    // Log WMS error
    async logError(orderId, error) {
        try {
            const wmsRecord = await WMS.findOne({ orderId });
            if (wmsRecord) {
                wmsRecord.errorLog.push({
                    message: error.message || 'Unknown error',
                    details: error,
                    timestamp: new Date()
                });
                await wmsRecord.save();
            }
        }
        catch (err) {
            console.error('Error logging WMS error:', err);
        }
    }
}
export default new WMSService();
