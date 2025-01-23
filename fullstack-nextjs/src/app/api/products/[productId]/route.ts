import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = await params;
    // 商品詳細取得 引数でproductIdを受け取る
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: true, product }, { status: 200 });

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