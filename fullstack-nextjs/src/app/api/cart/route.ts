import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '商品IDが必要です' },
        { status: 400 }
      );
    }

    // カートアイテムを作成
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: "auth0|user1", // 仮のユーザーID（後で認証システムと連携）
        productId: productId,
        quantity: quantity
      }
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: 'カートへの追加に失敗しました' },
      { status: 500 }
    );
  }
}