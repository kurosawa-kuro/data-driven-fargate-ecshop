import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
    // ミドルウェアからのヘッダーを取得
    const headersList = headers();
    const email = (await headersList).get('x-middleware-request-x-user-email');
    const userId = (await headersList).get('x-middleware-request-x-user-id');

    console.log("API Route - All headers:", Object.fromEntries([...(await headersList).entries()]));
    console.log("API Route - Email from middleware:", email);
    console.log("API Route - UserId from middleware:", userId);

    try {
        // ユーザー情報の確認（開発中は一時的にコメントアウト）
        // if (!email) {
        //     return NextResponse.json(
        //         { error: 'Unauthorized: User email not found' },
        //         { status: 401 }
        //     );
        // }

        const products = await prisma.product.findMany();
        return NextResponse.json({ 
            success: true, 
            products,
            user: { email, userId },
            debug: {
                headers: Object.fromEntries((await headersList).entries())
            }
        }, { 
            status: 200,
            headers: {
                'x-debug-email': email || 'not-found',
                'x-debug-user-id': userId || 'not-found'
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}