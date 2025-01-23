import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
  try {
    // 商品一覧取得 
    const products = await prisma.product.findMany();

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: true, products }, { status: 200 });

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