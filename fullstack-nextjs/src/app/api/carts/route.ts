import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { ActionType } from '@prisma/client';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const headersList = headers();
    const userId = (await headersList).get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        product: true
      }
    });

    return NextResponse.json({ success: true, cartItems });
  } catch (error) {
    console.error('Cart error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'カートの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const requestID = headersList.get('x-request-id');

    // ユーザーIDがDBに存在しない場合はエラーを返す
    const user = await prisma.user.findUnique({ 
      where: { id: userId ?? undefined } 
    });
    if (!user) {
      return NextResponse.json({ error: 'ユーザーIDが存在しません' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: '商品IDが必要です' }, { status: 400 });
    }

    // 既存のカートアイテムを確認
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: parseInt(productId)
      }
    });

    let cartItem: {
      id: number;
      userId: string;
      productId: number;
      quantity: number;
      addedAt: Date;
      product: {
        name: string;
        price: number;
      };
    };
    if (existingCartItem) {
      // 既存のアイテムを更新
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        },
        include: { product: true }
      });
    } else {
      // 新しいカートアイテムを作成
      cartItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: parseInt(productId),
          quantity: quantity
        },
        include: { product: true }
      });
    }

    // ユーザーアクションログの記録
    await logger.action({
      actionType: ActionType.CART_ADD,
      userId: userId,
      requestID: requestID ?? undefined,
      productId: parseInt(productId),
      quantity: quantity,
      cartItemId: cartItem.id,
      metadata: {
        productName: cartItem.product.name,
        productPrice: cartItem.product.price
      }
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error('Cart error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'カートへの追加に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return NextResponse.json({ error: 'カートアイテムIDが必要です' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        userId: userId
      },
      include: { product: true }
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'カートアイテムが見つかりません' }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) }
    });

    // ユーザーアクションログの記録
    await prisma.userActionLog.create({
      data: {
        userId: userId,
        actionType: ActionType.CART_REMOVE,
        productId: cartItem.productId,
        metadata: {
          quantity: cartItem.quantity
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'カートアイテムの削除に失敗しました' }, { status: 500 });
  }
}