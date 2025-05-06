import mongoose from "mongoose";

// Schema for tax lines within line items
const taxLineSchema = new mongoose.Schema({
  channel_liable: Boolean,
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
  title: String
}, { _id: false });

// Schema for money objects
const moneySchema = new mongoose.Schema({
  amount: String,
  currency_code: String
}, { _id: false });

// Schema for price set objects
const priceSetSchema = new mongoose.Schema({
  shop_money: moneySchema,
  presentment_money: moneySchema
}, { _id: false });

// Line item schema matching Shopify API structure
const lineItemSchema = new mongoose.Schema({
  shopifyId: { type: Number, required: true },
  admin_graphql_api_id: String,
  current_quantity: Number,
  discount_allocations: Array,
  duties: Array,
  fulfillable_quantity: Number,
  fulfillment_service: String,
  fulfillment_status: String,
  gift_card: Boolean,
  grams: Number,
  name: String,
  price: String,
  price_set: priceSetSchema,
  product_exists: Boolean,
  product_id: Number,
  properties: Array,
  quantity: Number,
  requires_shipping: Boolean,
  sku: String,
  tax_lines: [taxLineSchema],
  taxable: Boolean,
  title: String,
  total_discount: String,
  total_discount_set: priceSetSchema,
  variant_id: Number,
  variant_inventory_management: String,
  variant_title: String,
  vendor: String
}, { _id: false });

// Shipping line schema
const shippingLineSchema = new mongoose.Schema({
  shopifyId: Number,
  title: String,
  price: String,
  code: String,
  source: String
}, { _id: false });

// Address schema
const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address1: String,
  address2: String,
  city: String,
  province: String,
  provinceCode: String,
  country: String,
  countryCode: String,
  zip: String,
  phone: String,
  company: String,
  name: String
}, { _id: false });

// Customer schema
const customerSchema = new mongoose.Schema({
  id: Number,
  admin_graphql_api_id: String,
  created_at: String,
  currency: String,
  email: String,
  email_marketing_consent: {
    consent_updated_at: String,
    opt_in_level: String,
    state: String
  },
  first_name: String,
  last_name: String,
  multipass_identifier: String,
  note: String,
  phone: String,
  sms_marketing_consent: {
    state: String
  },
  tags: String,
  tax_exempt: Boolean,
  tax_exemptions: [String],
  updated_at: String,
  verified_email: Boolean
}, { _id: false });

const orderSchema = new mongoose.Schema({
  shopifyId: { type: Number, required: true, unique: true },
  orderNumber: { type: String, required: true },
  name: String,
  customer: customerSchema,
  lineItems: [lineItemSchema],
  shippingLines: [shippingLineSchema],
  shipping_address: addressSchema,
  billing_address: addressSchema,
  financialStatus: String,
  fulfillmentStatus: String,
  currency: String,
  totalPrice: String,
  subtotalPrice: String,
  totalTax: String,
  totalDiscounts: String,
  totalLineItemsPrice: String,
  tags: String,
  note: String,
  sourceName: String,
  processedAt: Date,
  shopifyCreatedAt: Date,
  shopifyUpdatedAt: Date
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;