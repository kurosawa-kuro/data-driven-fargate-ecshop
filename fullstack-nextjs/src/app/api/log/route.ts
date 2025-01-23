import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

// Action type constants
const ACTION_TYPES = {
  CART_ADD: 'cart_add',
  CART_REMOVE: 'cart_remove',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  ORDER_COMPLETE: 'order_complete',
} as const;

type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// Common types for logging
interface BaseLogPayload {
  amount?: number;
  quantity: number;
  productId?: string;
}

// Handler functions for each action type
const handleCartAdd = () => {
  const product = {
    id: 1,
    name: 'Product 1',
    price: 1000
  };
  
  return {
    productId: product.id.toString(),
    quantity: 1,
    amount: product.price,
    currency: 'JPY',
    metadata: {
      productName: product.name,
    }
  };
};

const handleCartRemove = (body: any): BaseLogPayload => ({
  productId: body.productId,
  quantity: body.quantity
});

const handleCheckoutOrOrder = (body: any): BaseLogPayload => ({
  amount: body.cartTotal,
  quantity: body.itemCount
});

// Main request handler
export async function POST(request: Request) {
  const body = await request.json();
  const actionType = body.actionType as ActionType;

  // Action type to handler mapping
  const actionHandlers: Record<ActionType, (body: any) => any> = {
    [ACTION_TYPES.CART_ADD]: handleCartAdd,
    [ACTION_TYPES.CART_REMOVE]: handleCartRemove,
    [ACTION_TYPES.CHECKOUT_START]: handleCheckoutOrOrder,
    [ACTION_TYPES.CHECKOUT_COMPLETE]: handleCheckoutOrOrder,
    [ACTION_TYPES.ORDER_COMPLETE]: handleCheckoutOrOrder,
  };

  const handler = actionHandlers[actionType];
  if (handler) {
    const logPayload = handler(body);
    logger.action(actionType, logPayload);
  }

  return NextResponse.json({});
}