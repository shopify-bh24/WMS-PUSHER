import { NextResponse } from 'next/server';
import { getShopifyRestClient } from '@/lib/shopify';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const shopify = await getShopifyRestClient();
        const variantRes = await shopify.get({ path: `variants/${params.id}` });
        const variant = variantRes.body.variant;
        if (!variant) throw new Error('Variant not found');
        const productRes = await shopify.get({ path: `products/${variant.product_id}` });
        const product = productRes.body.product;
        let imageUrl = null;
        if (variant.image_id && product.images) {
            const image = product.images.find((img: any) => img.id === variant.image_id);
            imageUrl = image ? image.src : null;
        }
        if (!imageUrl && product.images && product.images.length > 0) {
            imageUrl = product.images[0].src;
        }
        return NextResponse.json({ image_url: imageUrl });
    } catch (error: any) {
        console.error('Error fetching variant image:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch variant image' },
            { status: error.status || 500 }
        );
    }
} 