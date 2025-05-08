import mongoose, { Schema } from 'mongoose';
const OrderSchema = new Schema({
    shopify_order_id: { type: String, required: true, unique: true },
    order_number: { type: String, required: true },
    name: { type: String, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    processed_at: { type: Date, required: true },
    closed_at: { type: Date },
    cancelled_at: { type: Date },
    email: { type: String, required: true },
    currency: { type: String, required: true },
    presentment_currency: { type: String, required: true, default: 'USD' },
    financial_status: { type: String, required: true },
    fulfillment_status: { type: String },
    total_price: { type: Number, required: true },
    total_price_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    subtotal_price: { type: Number, required: true, default: 0 },
    subtotal_price_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    total_tax: { type: Number, required: true, default: 0 },
    total_tax_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    total_discounts: { type: Number, required: true, default: 0 },
    total_discounts_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    total_line_items_price: { type: Number, required: true, default: 0 },
    total_line_items_price_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    total_shipping_price_set: {
        shop_money: {
            amount: String,
            currency_code: String
        },
        presentment_money: {
            amount: String,
            currency_code: String
        }
    },
    total_outstanding: { type: Number, required: true, default: 0 },
    total_weight: { type: Number, required: true, default: 0 },
    total_tip_received: { type: Number, required: true, default: 0 },
    customer: {
        id: Number,
        email: String,
        accepts_marketing: Boolean,
        created_at: String,
        updated_at: String,
        first_name: String,
        last_name: String,
        state: String,
        note: String,
        verified_email: Boolean,
        multipass_identifier: String,
        tax_exempt: Boolean,
        tax_exemptions: [Schema.Types.Mixed],
        phone: String,
        currency: String,
        addresses: [Schema.Types.Mixed],
        admin_graphql_api_id: String,
        default_address: Schema.Types.Mixed
    },
    shipping_address: {
        address1: String,
        address2: String,
        city: String,
        company: String,
        country: String,
        first_name: String,
        last_name: String,
        phone: String,
        province: String,
        zip: String,
        name: String,
        province_code: String,
        country_code: String,
        latitude: String,
        longitude: String
    },
    billing_address: {
        address1: String,
        address2: String,
        city: String,
        company: String,
        country: String,
        first_name: String,
        last_name: String,
        phone: String,
        province: String,
        zip: String,
        name: String,
        province_code: String,
        country_code: String,
        latitude: String,
        longitude: String
    },
    line_items: [{
            id: Number,
            title: String,
            quantity: Number,
            price: String,
            sku: String,
            variant_title: String,
            fulfillment_status: String,
            fulfillment_service: String,
            grams: Number,
            product_id: Number,
            variant_id: Number,
            vendor: String,
            name: String,
            gift_card: Boolean,
            price_set: {
                shop_money: {
                    amount: String,
                    currency_code: String
                },
                presentment_money: {
                    amount: String,
                    currency_code: String
                }
            },
            properties: [{
                    name: String,
                    value: String
                }],
            taxable: Boolean,
            tax_lines: [{
                    title: String,
                    price: String,
                    price_set: {
                        shop_money: {
                            amount: String,
                            currency_code: String
                        },
                        presentment_money: {
                            amount: String,
                            currency_code: String
                        }
                    },
                    rate: Number,
                    channel_liable: Boolean
                }],
            total_discount: String,
            total_discount_set: {
                shop_money: {
                    amount: String,
                    currency_code: String
                },
                presentment_money: {
                    amount: String,
                    currency_code: String
                }
            },
            discount_allocations: [{
                    amount: String,
                    discount_application_index: Number,
                    amount_set: {
                        shop_money: {
                            amount: String,
                            currency_code: String
                        },
                        presentment_money: {
                            amount: String,
                            currency_code: String
                        }
                    }
                }]
        }],
    shipping_lines: [{
            code: String,
            price: String,
            price_set: {
                shop_money: {
                    amount: String,
                    currency_code: String
                },
                presentment_money: {
                    amount: String,
                    currency_code: String
                }
            },
            discounted_price: String,
            discounted_price_set: {
                shop_money: {
                    amount: String,
                    currency_code: String
                },
                presentment_money: {
                    amount: String,
                    currency_code: String
                }
            },
            source: String,
            title: String,
            tax_lines: [Schema.Types.Mixed],
            carrier_identifier: String,
            requested_fulfillment_service_id: String,
            is_removed: Boolean
        }],
    tags: String,
    note: String,
    note_attributes: [{
            name: String,
            value: String
        }],
    source_name: String,
    source_identifier: String,
    source_url: String,
    test: Boolean,
    token: String,
    taxes_included: Boolean,
    duties_included: Boolean,
    payment_gateway_names: [String],
    phone: String,
    confirmed: Boolean,
    estimated_taxes: Boolean,
    customer_locale: String,
    landing_site: String,
    referring_site: String,
    order_status_url: {
        order_status_url: String
    }
}, {
    timestamps: true,
    strict: false
});
OrderSchema.index({ shopify_order_id: 1 }, { unique: true });
OrderSchema.index({ order_number: 1 });
OrderSchema.index({ created_at: -1 });
OrderSchema.index({ financial_status: 1 });
OrderSchema.index({ fulfillment_status: 1 });
OrderSchema.index({ email: 1 });
export const Order = mongoose.model('Order', OrderSchema);
//# sourceMappingURL=order.model.js.map