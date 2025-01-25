import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionType } from '@prisma/client';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const email = headersList.get('x-user-email');
    const userId = headersList.get('x-user-id');
    const requestID = headersList.get('x-request-id');

    console.log("Checkout Confirm - userId from header:", userId);
    console.log("Checkout Confirm - email from header:", email);
    console.log("Checkout Confirm - requestID from header:", requestID);

    const body = await request.json();

    // トランザクション処理の実装
    const result = await prisma.$transaction(async (tx) => {
      // 1. CartItems取得
      const cartItems = await tx.cartItem.findMany({
        where: { userId: userId || '' },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        throw new Error('カートが空です');
      }

      // 2. Purchase作成
      const purchase = await tx.purchase.create({
        data: {
          userId: userId || '',
          totalAmount: cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
          purchaseItems: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          }
        }
      });

      // 3. CartItems削除
      await tx.cartItem.deleteMany({
        where: { userId: userId || '' }
      });

    // ユーザーアクションログの記録
    await logger.action({
      actionType: ActionType.COMPLETE_PURCHASE,
      userId: userId || '',
      requestID: requestID ?? undefined,
      purchaseId: purchase.id,
      metadata: {

      }
    });

      return { purchase };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('チェックアウトの処理に失敗しました:', error);
    return NextResponse.json(
      { error: 'チェックアウトの処理に失敗しました' },
      { status: 500 }
    );
  }
}