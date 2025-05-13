import mongoose, { Document } from 'mongoose';
interface MoneySet {
    shop_money: {
        amount: string;
        currency_code: string;
    };
    presentment_money: {
        amount: string;
        currency_code: string;
    };
}
interface LineItem {
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    variant_title: string;
    fulfillment_status: string;
    fulfillment_service: string;
    grams: number;
    product_id: number;
    variant_id: number;
    vendor: string;
    name: string;
    gift_card: boolean;
    price_set: MoneySet;
    properties: Array<{
        name: string;
        value: string;
    }>;
    taxable: boolean;
    tax_lines: Array<{
        title: string;
        price: string;
        price_set: MoneySet;
        rate: number;
        channel_liable: boolean;
    }>;
    total_discount: string;
    total_discount_set: MoneySet;
    discount_allocations: Array<{
        amount: string;
        discount_application_index: number;
        amount_set: MoneySet;
    }>;
}
interface ShippingLine {
    code: string;
    price: string;
    price_set: MoneySet;
    discounted_price: string;
    discounted_price_set: MoneySet;
    source: string;
    title: string;
    tax_lines: any[];
    carrier_identifier: string;
    requested_fulfillment_service_id: string;
    is_removed: boolean;
}
interface Customer {
    id: number;
    email: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    first_name: string;
    last_name: string;
    state: string;
    note: string | null;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    tax_exemptions: any[];
    phone: string;
    currency: string;
    addresses: any[];
    admin_graphql_api_id: string;
    default_address: any;
}
interface Address {
    address1: string;
    address2: string | null;
    city: string;
    company: string | null;
    country: string;
    first_name: string;
    last_name: string;
    phone: string;
    province: string;
    zip: string;
    name: string;
    province_code: string;
    country_code: string;
    latitude: string;
    longitude: string;
}
export interface IOrder extends Document {
    shopify_order_id: string;
    order_number: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    processed_at: Date;
    closed_at: Date | null;
    cancelled_at: Date | null;
    email: string;
    currency: string;
    presentment_currency: string;
    financial_status: string;
    fulfillment_status: string;
    total_price: number;
    total_price_set: MoneySet;
    subtotal_price: number;
    subtotal_price_set: MoneySet;
    total_tax: number;
    total_tax_set: MoneySet;
    total_discounts: number;
    total_discounts_set: MoneySet;
    total_line_items_price: number;
    total_line_items_price_set: MoneySet;
    total_shipping_price_set: MoneySet;
    total_outstanding: number;
    total_weight: number;
    total_tip_received: number;
    customer: Customer;
    shipping_address: Address;
    billing_address: Address;
    line_items: LineItem[];
    shipping_lines: ShippingLine[];
    tags: string[];
    note: string | null;
    note_attributes: Array<{
        name: string;
        value: string;
    }>;
    source_name: string;
    source_identifier: string;
    source_url: string;
    test: boolean;
    token: string;
    taxes_included: boolean;
    duties_included: boolean;
    payment_gateway_names: string[];
    phone: string;
    confirmed: boolean;
    estimated_taxes: boolean;
    customer_locale: string;
    landing_site: string;
    referring_site: string;
    order_status_url: {
        order_status_url: string;
    };
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
