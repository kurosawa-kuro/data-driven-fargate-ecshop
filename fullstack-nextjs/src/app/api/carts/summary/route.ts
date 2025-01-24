import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const userId = (await headersList).get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // カート内の商品と価格情報を取得
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: {
            price: true
          }
        }
      }
    });

    // 小計を計算
    const subtotal = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    return NextResponse.json({
      success: true,
      subtotal: subtotal,
    });
  } catch (error) {
    console.error('Cart summary error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'カート合計の取得に失敗しました' }, { status: 500 });
  }
}