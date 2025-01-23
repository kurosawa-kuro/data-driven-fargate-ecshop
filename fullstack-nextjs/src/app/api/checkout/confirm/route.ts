import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionType } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // トランザクション処理の実装
    const result = await prisma.$transaction(async (tx) => {
      // 1. CartItems取得
      const cartItems = await tx.cartItem.findMany({
        where: { userId: "auth0|user1" },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        throw new Error('カートが空です');
      }

      // 2. Purchase作成
      const purchase = await tx.purchase.create({
        data: {
          userId: "auth0|user1",
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
        where: { userId: "auth0|user1" }
      });

      // 4. UserActionLog作成
      await tx.userActionLog.create({
        data: {
          userId: "auth0|user1",
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