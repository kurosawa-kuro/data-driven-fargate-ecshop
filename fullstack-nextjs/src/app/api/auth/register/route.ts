import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface RegisterRequestBody {
  email: string;
  sub: string;
}

// ユーザー作成のインターフェース
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

// ユーザー作成データの生成
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
    const { email, sub } = body;

    // バリデーション
    if (!email || !sub) {
      return NextResponse.json(
        { error: 'メールアドレスとsubは必須です' },
        { status: 400 }
      );
    }

    // ユーザー作成
    const userData = createUserData(email, sub);
    const user = await prisma.user.create({ data: userData });

    // ログ記録
    logger.action('user_register', {
      userId: user.id,
      metadata: {
        email: email
      }
    }); 

    return NextResponse.json({ success: true, user }, { status: 201 });

  } catch (error) {
    // エラーハンドリング
    logger.error('ユーザー登録エラー:', error as Error);
    
    if (error instanceof Error) {
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