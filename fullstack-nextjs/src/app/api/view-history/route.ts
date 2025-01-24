import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    const body = await request.json();
    // const userId = body.userId;
    const productId = body.productId;
    
    const user = await prisma.viewHistory.create({
      data: {
        userId: "auth0|user1",
        productId: parseInt(productId),
        viewedAt: new Date(),
      },
    });

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: true, user }, { status: 201 });

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