import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";

export async function GET(request: NextRequest) {

  // そもそもリクエストヘッダーではなくレスポンスヘッダーに設定ではないので
    const headersList = await headers();
    const email = headersList.get('x-user-email')?.split(',')[0];
    const userId = headersList.get('x-user-id')?.split(',')[0];

    // console.log("API Route - All headers:", Object.fromEntries([...headersList.entries()]));
    console.log("API Route - Email:", email);
    console.log("API Route - UserId:", userId);

    try {
        const products = await prisma.product.findMany();
        return NextResponse.json({ 
            success: true, 
            products,
            user: { email, userId }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}