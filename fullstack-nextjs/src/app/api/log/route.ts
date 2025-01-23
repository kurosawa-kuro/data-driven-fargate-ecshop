import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

  const body = await request.json();
  const actionType = body.actionType;

  // action card_add
  if (actionType === 'cart_add') {
    const product = {
    id: 1,
    name: 'Product 1',
    price: 1000
    };
    logger.action('cart_add', {
    productId: product.id.toString(),
    quantity: 1,
    amount: product.price,
    currency: 'JPY',
    metadata: {
    productName: product.name,
    }
    });

    return NextResponse.json({ });
  }
}