import { Document } from 'mongoose';
export interface IAddress {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    provinceCode: string;
    country: string;
    countryCode: string;
    zip: string;
    phone?: string;
    company?: string;
    name?: string;
}
export interface IShippingAddress extends IAddress {
    latitude?: number;
    longitude?: number;
}
export interface IMoney {
    amount: string;
    currency_code: string;
}
export interface IPriceSet {
    shop_money: IMoney;
    presentment_money: IMoney;
}
export interface ITaxLine {
    channel_liable: boolean;
    price: string;
    price_set: IPriceSet;
    rate: number;
    title: string;
}
export interface ILineItem {
    shopifyId: number;
    admin_graphql_api_id?: string;
    current_quantity: number;
    discount_allocations: any[];
    duties: any[];
    fulfillable_quantity: number;
    fulfillment_service?: string;
    fulfillment_status?: string;
    gift_card: boolean;
    grams: number;
    name: string;
    price: string;
    price_set: IPriceSet;
    product_exists: boolean;
    product_id?: number;
    properties: any[];
    quantity: number;
    requires_shipping: boolean;
    sku?: string;
    tax_lines: ITaxLine[];
    taxable: boolean;
    title: string;
    total_discount: string;
    total_discount_set: IPriceSet;
    variant_id?: number;
    variant_inventory_management?: string;
    variant_title?: string;
    vendor?: string;
}
export interface IShippingLine {
    shopifyId: number;
    title: string;
    price: string;
    code?: string;
    source?: string;
}
export interface IEmailMarketingConsent {
    consent_updated_at: Date;
    opt_in_level: string;
    state: string;
}
export interface ISmsMarketingConsent {
    state: string;
}
export interface ICustomer {
    id?: number;
    admin_graphql_api_id?: string;
    created_at?: Date;
    currency?: string;
    email?: string;
    email_marketing_consent?: IEmailMarketingConsent;
    first_name?: string;
    last_name?: string;
    multipass_identifier?: string;
    note?: string;
    phone?: string;
    sms_marketing_consent?: ISmsMarketingConsent;
    tax_exempt?: boolean;
    tax_exemptions?: string[];
    updated_at?: Date;
    verified_email?: boolean;
}
export interface IOrder extends Document {
    shopifyId: number;
    orderNumber: string;
    name: string;
    customer: ICustomer;
    line_items: ILineItem[];
    shippingLines: IShippingLine[];
    shipping_address?: IShippingAddress;
    billing_address?: IAddress;
    financialStatus?: string;
    fulfillmentStatus?: string;
    currency?: string;
    totalPrice?: string;
    subtotalPrice?: string;
    totalTax?: string;
    totalDiscounts?: string;
    totalLineItemsPrice?: string;
    tags?: string;
    note?: string;
    sourceName?: string;
    processedAt?: Date;
    shopifyCreatedAt?: Date;
    shopifyUpdatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
