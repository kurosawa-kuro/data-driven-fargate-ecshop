import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const cartItems = await prisma.cartItem.findMany({
    include: {
      product: true
    }
  });
  return NextResponse.json({ cartItems });
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const email = headersList.get('x-user-email')?.split(',')[0];
    const userId = headersList.get('x-user-id')?.split(',')[0];

    // console.log("API Route - All headers:", Object.fromEntries([...headersList.entries()]));
    console.log("API Cart Route - Email:", email);
    console.log("API Cart Route - UserId:", userId);
    // const userId = (await headersList).get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ error: '商品IDが必要です' }, { status: 400 });
    }

    // ユーザーIDがDBに存在しない場合はエラーを返す
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'ユーザーIDが存在しません' }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity
      }
    });

    return NextResponse.json({ success: true, cartItem });
  } catch (error) {
    console.error('Cart error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'カートへの追加に失敗しました' }, { status: 500 });
  }
}