import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const email = headersList.get('x-user-email');
    const userId = headersList.get('x-user-id');
  
    console.log("Checkout Confirm - userId from header:", userId);
    console.log("Checkout Confirm - email from header:", email);
    // 購入履歴はユーザーIDで絞り込む 最新順番に並べ替え
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: userId || ''
      },
      orderBy: {
        purchasedAt: 'desc' 
      },
      include: {
        purchaseItems: {
          include: {
            product: true
          }
        }
      },
    });
    // console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ purchases", purchases);

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: true, purchases }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating sample:', error.message);
      return NextResponse.json(
        { error: 'Failed to create sample: ' + error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create sample' },
      { status: 500 }
    );
  }
}