import { NextRequest, NextResponse } from "next/server";
import { signIn } from '@/lib/auth/cognito';
import * as jose from 'jose';
import { logger } from "@/lib/logger";

// レスポンスファクトリー
const ResponseFactory = {
  createErrorResponse(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
  },

  createSuccessResponse(user: { email: string, userId: string }, idToken: string) {
    const response = NextResponse.json({ 
      success: true,
      user
    });

    response.cookies.set({
      name: 'idToken',
      value: idToken,
      path: '/',
      secure: false,
      sameSite: 'lax',
      httpOnly: true,
    });

    return response;
  }
};

interface DecodedToken {
  email: string;
  sub: string;
}

// 認証処理ハンドラー
const AuthHandler = {
  async validateToken(idToken: string | undefined) {
    if (!idToken) {
      throw new Error('認証トークンがありません');
    }
    return await jose.decodeJwt(idToken) as DecodedToken;
  },

  async authenticate(email: string, password: string) {
    const result = await signIn(email, password);
    const idToken = result?.AuthenticationResult?.IdToken;
    
    if (!idToken) {
      throw new Error('認証トークンの取得に失敗しました');
    }
    
    const decoded = await this.validateToken(idToken);
    return {
      idToken,
      user: {
        email: decoded.email,
        userId: decoded.sub
      }
    };
  }
};

// メインハンドラー
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const { idToken, user } = await AuthHandler.authenticate(email, password);

    logger.action('user_login', {
      userId: user.userId,
      metadata: { email: user.email }
    });

    return ResponseFactory.createSuccessResponse(user, idToken);
  } catch (error) {
    console.error('Login error:', error);
    return ResponseFactory.createErrorResponse('ログインに失敗しました', 500);
  }
}