import { NextResponse } from 'next/server';
import { confirmSignUp } from '@/lib/auth/cognito';
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { client } from '@/lib/auth/cognito';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    // メール確認
    const response = await confirmSignUp(email, code);
    console.log("confirmSignUp response", response.sub);
    console.log("confirmSignUp response.UserSub", response.sub);

    if (response.sub) {
      await prisma.user.update({
        where: { id: response.sub },
        data: { emailVerified: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: error.message || '確認コードの検証に失敗しました' },
      { status: 400 }
    );
  }
} 