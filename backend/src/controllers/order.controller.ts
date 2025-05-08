import { Request, Response } from 'express';
import { Order } from '../models/order.model.js';
import { AppError } from '../utils/error.util.js';

export const saveOrders = async (orders: any[]) => {
    try {
        const savedOrders = await Promise.all(
            orders.map(async (order) => {
                const existingOrder = await Order.findOne({ shopify_order_id: order.id.toString() });

                if (existingOrder) {
                    return Order.findOneAndUpdate(
                        { shopify_order_id: order.id.toString() },
                        {
                            order_number: order.order_number || order.name?.replace('#', ''),
                            customer: {
                                id: order.customer?.id,
                                email: order.customer?.email,
                                first_name: order.customer?.first_name,
                                last_name: order.customer?.last_name,
                                phone: order.customer?.phone,
                                tags: order.customer?.tags ? (Array.isArray(order.customer.tags) ? order.customer.tags : order.customer.tags.split(',')) : []
                            },
                            created_at: order.created_at,
                            source: order.source_name,
                            total_price: parseFloat(order.total_price),
                            currency: order.currency,
                            financial_status: order.financial_status,
                            fulfillment_status: order.fulfillment_status,
                            line_items: order.line_items?.map((item: any) => ({
                                id: item.id,
                                title: item.title,
                                quantity: item.quantity,
                                price: parseFloat(item.price),
                                sku: item.sku,
                                variant_title: item.variant_title
                            })) || [],
                            shipping_address: order.shipping_address || {},
                            billing_address: order.billing_address || {},
                            note: order.note,
                            tags: order.tags ? (Array.isArray(order.tags) ? order.tags : order.tags.split(',')) : [],
                            shipping_lines: order.shipping_lines?.map((line: any) => ({
                                title: line.title,
                                price: parseFloat(line.price)
                            })) || []
                        },
                        { new: true }
                    );
                } else {
                    // Create new order
                    return Order.create({
                        shopify_order_id: order.id.toString(),
                        order_number: order.order_number || order.name?.replace('#', ''),
                        customer: {
                            id: order.customer?.id,
                            email: order.customer?.email,
                            first_name: order.customer?.first_name,
                            last_name: order.customer?.last_name,
                            phone: order.customer?.phone,
                            tags: order.customer?.tags ? (Array.isArray(order.customer.tags) ? order.customer.tags : order.customer.tags.split(',')) : []
                        },
                        created_at: order.created_at,
                        source: order.source_name,
                        total_price: parseFloat(order.total_price),
                        currency: order.currency,
                        financial_status: order.financial_status,
                        fulfillment_status: order.fulfillment_status,
                        line_items: order.line_items?.map((item: any) => ({
                            id: item.id,
                            title: item.title,
                            quantity: item.quantity,
                            price: parseFloat(item.price),
                            sku: item.sku,
                            variant_title: item.variant_title
                        })) || [],
                        shipping_address: order.shipping_address || {},
                        billing_address: order.billing_address || {},
                        note: order.note,
                        tags: order.tags ? (Array.isArray(order.tags) ? order.tags : order.tags.split(',')) : [],
                        shipping_lines: order.shipping_lines?.map((line: any) => ({
                            title: line.title,
                            price: parseFloat(line.price)
                        })) || []
                    });
                }
            })
        );

        return savedOrders;
    } catch (error) {
        console.error('Error saving orders:', error);
        throw error;
    }
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error: any) {
        throw new AppError(500, error.message || 'Failed to fetch orders');
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            throw new AppError(404, 'Order not found');
        }
        res.json({ success: true, order });
    } catch (error: any) {
        throw new AppError(500, error.message || 'Failed to fetch order');
    }
};

export const syncOrders = async (req: Request, res: Response) => {
    try {
        const { orders } = req.body;

        if (!Array.isArray(orders)) {
            throw new AppError(400, 'Invalid orders data');
        }

        const savedOrders = await Promise.all(
            orders.map(async (shopifyOrder: any) => {
                const existingOrder = await Order.findOne({ shopify_order_id: shopifyOrder.id.toString() });

                const orderData = {
                    shopify_order_id: shopifyOrder.id.toString(),
                    order_number: shopifyOrder.order_number || shopifyOrder.name?.replace('#', ''),
                    name: shopifyOrder.name || `#${shopifyOrder.order_number}`,
                    email: shopifyOrder.email || shopifyOrder.customer?.email || 'no-email@example.com',
                    processed_at: new Date(shopifyOrder.processed_at || shopifyOrder.created_at),
                    created_at: new Date(shopifyOrder.created_at),
                    updated_at: new Date(),
                    customer: shopifyOrder.customer,
                    total_price: parseFloat(shopifyOrder.total_price) || 0,
                    currency: shopifyOrder.currency || 'USD',
                    presentment_currency: shopifyOrder.presentment_currency || shopifyOrder.currency || 'USD',
                    financial_status: shopifyOrder.financial_status,
                    fulfillment_status: shopifyOrder.fulfillment_status,
                    line_items: shopifyOrder.line_items,
                    shipping_address: shopifyOrder.shipping_address,
                    billing_address: shopifyOrder.billing_address,
                    tags: Array.isArray(shopifyOrder.tags) ? shopifyOrder.tags : (shopifyOrder.tags ? shopifyOrder.tags.split(',') : []),
                    note: shopifyOrder.note,
                    shipping_lines: shopifyOrder.shipping_lines,
                    subtotal_price: parseFloat(shopifyOrder.subtotal_price) || 0,
                    total_tax: parseFloat(shopifyOrder.total_tax) || 0,
                    total_discounts: parseFloat(shopifyOrder.total_discounts) || 0,
                    total_line_items_price: parseFloat(shopifyOrder.total_line_items_price) || 0,
                    total_outstanding: parseFloat(shopifyOrder.total_outstanding) || 0,
                    total_weight: parseFloat(shopifyOrder.total_weight) || 0,
                    total_tip_received: parseFloat(shopifyOrder.total_tip_received) || 0
                };

                if (existingOrder) {
                    return Order.findByIdAndUpdate(
                        existingOrder._id,
                        orderData,
                        { new: true }
                    );
                } else {
                    return Order.create(orderData);
                }
            })
        );

        res.json({
            success: true,
            message: `Successfully synced ${savedOrders.length} orders`,
            orders: savedOrders
        });
    } catch (error: any) {
        console.error('Error syncing orders:', error);
        throw new AppError(500, error.message || 'Failed to sync orders');
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (!updateData) {
            throw new AppError(400, 'Update data is required');
        }

        const existingOrder = await Order.findOne({ shopify_order_id: id });
        if (!existingOrder) {
            throw new AppError(404, 'Order not found');
        }

        const formattedData = {
            ...updateData,
            updated_at: new Date().toISOString(),
            note: updateData.note,
            // email: updateData?.email,
            // tags: Array.isArray(updateData.tags)
            //     ? updateData.tags.join(',')
            //     : updateData.tags,
            // customer: {
            //     ...updateData.customer,
            // },
            // shipping_address: {
            //     ...updateData.shipping_address,
            //     name: updateData.shipping_address.first_name && updateData.shipping_address.last_name
            //         ? `${updateData.shipping_address.first_name} ${updateData.shipping_address.last_name}`
            //         : null
            // },
            // line_items: updateData.line_items?.map((item: any) => ({
            //     id: item.id,
            //     title: item.title || item.name,
            //     quantity: item.quantity,
            //     price: typeof item.price === 'string'
            //         ? parseFloat(item.price.replace(/[^0-9.-]+/g, ""))
            //         : item.price,
            //     sku: item.sku,
            //     variant_title: item.variant_title,
            //     fulfillment_status: item.fulfillment_status,
            //     fulfillment_service: item.fulfillment_service,
            //     grams: item.grams,
            //     product_id: item.product_id,
            //     variant_id: item.variant_id,
            //     vendor: item.vendor,
            //     gift_card: item.gift_card,
            //     price_set: item.price_set,
            //     properties: item.properties,
            //     taxable: item.taxable,
            //     tax_lines: item.tax_lines,
            //     total_discount: item.total_discount,
            //     total_discount_set: item.total_discount_set,
            //     discount_allocations: item.discount_allocations
            // }))
        };

        const updatedOrder = await Order.findOneAndUpdate(
            { shopify_order_id: id },
            { $set: formattedData },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: `Order ${id} updated successfully`,
            order: updatedOrder
        });
    } catch (error: any) {
        console.error('Error updating order:', error);
        throw new AppError(500, error.message || 'Failed to update order');
    }
};