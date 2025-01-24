import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionType } from '@prisma/client';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const email = headersList.get('x-user-email');
    const userId = headersList.get('x-user-id');
  
    console.log("Checkout Confirm - userId from header:", userId);
    console.log("Checkout Confirm - email from header:", email);

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

      // 4. UserActionLog作成
      await tx.userActionLog.create({
        data: {
          userId: userId || '',
          actionType: ActionType.COMPLETE_PURCHASE,
          purchaseId: purchase.id,
          metadata: body
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