import mongoose, { Schema } from 'mongoose';
const WMSSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    wmsOrderId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'picking', 'packing', 'shipped', 'delivered', 'cancelled', 'error'],
        default: 'pending'
    },
    customer: {
        admin_graphql_api_id: String,
        email: String,
        first_name: String,
        last_name: String,
        note: String,
        tags: [String],
        verified_email: Boolean,
        created_at: Date,
        updated_at: Date,
        currency: String,
        email_marketing_consent: {
            consent_updated_at: Date,
            opt_in_level: String,
            state: String
        },
        sms_marketing_consent: {
            state: String
        },
        tax_exempt: Boolean,
        tax_exemptions: [String],
        multipass_identifier: String,
        phone: String,
        shipping_address: {
            address1: String,
            address2: String,
            city: String,
            company: String,
            country: String,
            country_code: String,
            first_name: String,
            last_name: String,
            latitude: Number,
            longitude: Number,
            name: String,
            phone: String,
            province: String,
            province_code: String,
            zip: String
        },
        billing_address: {
            address1: String,
            address2: String,
            city: String,
            company: String,
            country: String,
            country_code: String,
            first_name: String,
            last_name: String,
            name: String,
            phone: String,
            province: String,
            province_code: String,
            zip: String
        }
    },
    lastSync: {
        type: Date,
        default: Date.now
    },
    syncHistory: [{
            status: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            message: String
        }],
    inventoryUpdates: [{
            sku: String,
            quantity: Number,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
    errorLog: [{
            message: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            details: Schema.Types.Mixed
        }]
}, {
    timestamps: true
});
// Indexes for better query performance
WMSSchema.index({ orderId: 1 });
WMSSchema.index({ wmsOrderId: 1 });
WMSSchema.index({ status: 1 });
WMSSchema.index({ lastSync: 1 });
WMSSchema.index({ 'customer.email': 1 });
WMSSchema.index({ 'customer.phone': 1 });
const WMS = mongoose.model('WMS', WMSSchema);
export default WMS;
