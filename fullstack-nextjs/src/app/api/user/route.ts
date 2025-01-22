import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(request: Request) {
  try {
    // ユーザー登録 引数でemail, passwordを受け取る
    console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ post user api request", request);
    const body = await request.json();
    const email = body.email;
    const sub = body.sub;
    
    const user = await prisma.user.create({
      data: {
        id: sub,
        email: email,
        cognitoId: sub,
        status: "ACTIVE",
        emailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
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