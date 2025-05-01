import express from "express";
import Order from "../models/Order.js"; // Assuming your model is here

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
    try {
        // Consider adding pagination or filtering if needed for general GET
        const orders = await Order.find().sort({ createdAt: -1 }); // Example sort
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch orders", error: err.message });
    }
});

// Create a new order (Might be less used if syncing from Shopify)
router.post("/", async (req, res) => {
    try {
        // Add validation if necessary
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "Failed to create order", error: err.message });
    }
});

// Get a single order by Database ID (_id)
router.get("/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch order", error: err.message });
    }
});

// Update an order by Database ID (_id)
router.put("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Failed to update order", error: err.message });
    }
});

// Delete an order by Database ID (_id)
router.delete("/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete order", error: err.message });
    }
});


// **New Route: Sync Shopify Orders to DB**
router.post("/sync", async (req, res) => {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
        return res.status(400).json({ message: "Invalid request body: 'orders' array is required." });
    }

    if (orders.length === 0) {
        return res.status(200).json({ message: "No orders provided to sync.", syncedCount: 0, errors: 0 });
    }

    let syncedCount = 0;
    let errorCount = 0;
    const bulkOps = [];

    console.log(`Received ${orders.length} orders to sync.`);

    for (let shopifyOrder of orders) {
        if (!shopifyOrder.id) {
            console.warn("Skipping order due to missing Shopify ID:", shopifyOrder);
            errorCount++;
            continue; // Skip if Shopify ID is missing
        }

        // **IMPORTANT:** Map Shopify order fields to your Order schema fields
        // You need to adjust this mapping based on your actual Order model schema
        const orderData = {
            shopifyId: shopifyOrder.id,
            orderNumber: shopifyOrder.order_number || shopifyOrder.name?.replace('#', ''),
            name: shopifyOrder.name || `#${shopifyOrder.order_number}`,

            // Customer mapping
            customer: {
                shopifyId: shopifyOrder.customer?.id,
                email: shopifyOrder.customer?.email,
                firstName: shopifyOrder.customer?.first_name,
                lastName: shopifyOrder.customer?.last_name,
                phone: shopifyOrder.customer?.phone
            },

            // Map line items - updated to match Shopify API structure exactly
            lineItems: shopifyOrder.line_items?.map((item, index) => {
                return {
                    shopifyId: item.id,
                    admin_graphql_api_id: item.admin_graphql_api_id,
                    current_quantity: item.current_quantity,
                    discount_allocations: item.discount_allocations || [],
                    duties: item.duties || [],
                    fulfillable_quantity: item.fulfillable_quantity,
                    fulfillment_service: item.fulfillment_service,
                    fulfillment_status: item.fulfillment_status,
                    gift_card: item.gift_card,
                    grams: item.grams,
                    name: item.name,
                    price: item.price,
                    price_set: {
                        presentment_money: item.price_set?.presentment_money ? {
                            amount: item.price_set.presentment_money.amount,
                            currency_code: item.price_set.presentment_money.currency_code
                        } : {},
                        shop_money: item.price_set?.shop_money ? {
                            amount: item.price_set.shop_money.amount,
                            currency_code: item.price_set.shop_money.currency_code
                        } : {}
                    },
                    product_exists: item.product_exists,
                    product_id: item.product_id,
                    properties: item.properties || [],
                    quantity: item.quantity,
                    requires_shipping: item.requires_shipping,
                    sku: item.sku || '',
                    tax_lines: item.tax_lines?.map(tax => ({
                        channel_liable: tax.channel_liable,
                        price: tax.price,
                        price_set: {
                            shop_money: tax.price_set?.shop_money ? {
                                amount: tax.price_set.shop_money.amount,
                                currency_code: tax.price_set.shop_money.currency_code
                            } : {},
                            presentment_money: tax.price_set?.presentment_money ? {
                                amount: tax.price_set.presentment_money.amount,
                                currency_code: tax.price_set.presentment_money.currency_code
                            } : {}
                        },
                        rate: tax.rate,
                        title: tax.title
                    })) || [],
                    taxable: item.taxable,
                    title: item.title,
                    total_discount: item.total_discount,
                    total_discount_set: item.total_discount_set ? {
                        shop_money: item.total_discount_set.shop_money ? {
                            amount: item.total_discount_set.shop_money.amount,
                            currency_code: item.total_discount_set.shop_money.currency_code
                        } : {},
                        presentment_money: item.total_discount_set.presentment_money ? {
                            amount: item.total_discount_set.presentment_money.amount,
                            currency_code: item.total_discount_set.presentment_money.currency_code
                        } : {}
                    } : {},
                    variant_id: item.variant_id,
                    variant_inventory_management: item.variant_inventory_management,
                    variant_title: item.variant_title,
                    vendor: item.vendor
                }
            }) || [],

            // Map shipping lines - this was missing before
            shippingLines: shopifyOrder.shipping_lines?.map(line => ({
                shopifyId: line.id,
                title: line.title,
                price: line.price,
                code: line.code,
                source: line.source
            })) || [],

            // Addresses
            shippingAddress: shopifyOrder.shipping_address ? {
                firstName: shopifyOrder.shipping_address.first_name,
                lastName: shopifyOrder.shipping_address.last_name,
                address1: shopifyOrder.shipping_address.address1,
                address2: shopifyOrder.shipping_address.address2,
                city: shopifyOrder.shipping_address.city,
                province: shopifyOrder.shipping_address.province,
                provinceCode: shopifyOrder.shipping_address.province_code,
                country: shopifyOrder.shipping_address.country,
                countryCode: shopifyOrder.shipping_address.country_code,
                zip: shopifyOrder.shipping_address.zip,
                phone: shopifyOrder.shipping_address.phone,
                company: shopifyOrder.shipping_address.company,
                name: shopifyOrder.shipping_address.name
            } : null,

            billingAddress: shopifyOrder.billing_address ? {
                firstName: shopifyOrder.billing_address.first_name,
                lastName: shopifyOrder.billing_address.last_name,
                address1: shopifyOrder.billing_address.address1,
                address2: shopifyOrder.billing_address.address2,
                city: shopifyOrder.billing_address.city,
                province: shopifyOrder.billing_address.province,
                provinceCode: shopifyOrder.billing_address.province_code,
                country: shopifyOrder.billing_address.country,
                countryCode: shopifyOrder.billing_address.country_code,
                zip: shopifyOrder.billing_address.zip,
                phone: shopifyOrder.billing_address.phone,
                company: shopifyOrder.billing_address.company,
                name: shopifyOrder.billing_address.name
            } : null,

            // Other fields
            financialStatus: shopifyOrder.financial_status,
            fulfillmentStatus: shopifyOrder.fulfillment_status,
            currency: shopifyOrder.currency,
            totalPrice: shopifyOrder.total_price,
            subtotalPrice: shopifyOrder.subtotal_price,
            totalTax: shopifyOrder.total_tax,
            totalDiscounts: shopifyOrder.total_discounts,
            totalLineItemsPrice: shopifyOrder.total_line_items_price,

            tags: shopifyOrder.tags,
            note: shopifyOrder.note,
            sourceName: shopifyOrder.source_name,

            processedAt: shopifyOrder.processed_at,
            shopifyCreatedAt: shopifyOrder.created_at,
            shopifyUpdatedAt: shopifyOrder.updated_at
        };

        // Prepare bulk write operation (more efficient than individual saves)
        bulkOps.push({
            updateOne: {
                filter: { shopifyId: shopifyOrder.id }, // Find by Shopify ID
                update: { $set: orderData },          // Set the new data
                upsert: true                          // Insert if not found
            }
        });
    }

    try {
        if (bulkOps.length > 0) {
            const result = await Order.bulkWrite(bulkOps, { ordered: false }); // ordered:false continues on error
            syncedCount = result.upsertedCount + result.modifiedCount;
            // Check for write errors if ordered: false
            if (result.hasWriteErrors()) {
                errorCount += result.getWriteErrorCount();
                console.error("Bulk write errors occurred:", result.getWriteErrors());
            }
            console.log(`Bulk write result: Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Errors: ${errorCount}`);
        } else {
            console.log("No valid orders found to perform bulk write.");
        }

        res.status(200).json({
            message: `Sync completed. Processed: ${orders.length}, Synced/Updated: ${syncedCount}, Errors: ${errorCount}`,
            syncedCount: syncedCount,
            errors: errorCount
        });
    } catch (err) {
        console.error("Error during bulk sync:", err);
        res.status(500).json({ message: "Failed to sync orders", error: err.message });
    }
});


export default router;