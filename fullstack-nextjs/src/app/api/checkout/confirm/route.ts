import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  console.log('');

  try {
    // トランザクション処理の実装
    await prisma.$transaction(async (tx) => {
      // 1. CartItems取得
      const cartItems = await tx.cartItem.findMany({
        where: { userId: "1" },
        include: { product: true }
      });

      // 2. Purchase作成
      const purchase = await tx.purchase.create({
        data: {
          userId: "1",
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
        where: { userId: "1" }
      });
    });

    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actionType: 'order_complete'
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('チェックアウトの開始に失敗しました', error as Error);
    return NextResponse.json({ error: 'チェックアウトの開始に失敗しました' }, { status: 500 });
  }
}