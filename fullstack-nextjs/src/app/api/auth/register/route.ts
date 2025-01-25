import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ActionLogType, logger } from '@/lib/logger';
import { signUp } from '@/lib/auth/cognito';

interface RegisterRequestBody {
  email: string;
  password: string;
}

interface UserCreationData {
  id: string;
  email: string;
  cognitoId: string;
  status: "ACTIVE";
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function createUserData(email: string, sub: string): UserCreationData {
  const now = new Date();
  return {
    id: sub,
    email,
    cognitoId: sub,
    status: "ACTIVE",
    emailVerified: false,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RegisterRequestBody;
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // Cognitoでユーザー登録
    const cognitoResponse = await signUp(email, password);
    const sub = cognitoResponse.UserSub;

    if (!sub) {
      return NextResponse.json(
        { error: 'Cognitoの登録に失敗しました' },
        { status: 500 }
      );
    }

    const userData = createUserData(email, sub);
    
    // トランザクションでユーザー作成とログ記録を行う
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      
      // ログ記録を確実に実行
      await logger.action({
        actionType: ActionLogType.USER.REGISTER_START,
        userId: sub
      });

      return { user };
    });

    return NextResponse.json({ 
      success: true, 
      user: result.user,
      sub: cognitoResponse.UserSub 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      console.error('ユーザー登録エラー:', error);
      return NextResponse.json(
        { error: `ユーザー登録に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'ユーザー登録に失敗しました' },
      { status: 500 }
    );
  }
}