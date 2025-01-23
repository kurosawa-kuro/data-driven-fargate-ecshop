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

  // cart_remove
  if (actionType === 'cart_remove') {
    logger.action('cart_remove', {
      productId: body.productId,
      quantity: body.quantity
    });
  }

  // action checkout_start
  if (actionType === 'checkout_start') {
    logger.action('checkout_start', {
      amount: body.cartTotal,
      quantity: body.itemCount
    });
  }

  // checkout_complete
  if (actionType === 'checkout_complete') {
    logger.action('checkout_complete', {
      amount: body.cartTotal,
      quantity: body.itemCount
    });
  }

  // order_complete
  if (actionType === 'order_complete') {
    logger.action('order_complete', {
      amount: body.cartTotal,
      quantity: body.itemCount
    });
  }

  return NextResponse.json({ });
}