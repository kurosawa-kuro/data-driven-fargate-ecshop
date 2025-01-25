import { NextRequest, NextResponse } from "next/server";
import { signIn } from '@/lib/auth/cognito';
import * as jose from 'jose';
import { ActionLogType, logger } from "@/lib/logger";
import { prisma } from '@/lib/prisma';

interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    userId: string;
  };
  error?: string;
}

const ResponseFactory = {
  createErrorResponse(message: string, status: number): NextResponse<LoginResponse> {
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status });
  },

  createSuccessResponse(user: { email: string, userId: string }, idToken: string): NextResponse<LoginResponse> {
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

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const { idToken, user} = await AuthHandler.authenticate(email, password);

    await prisma.user.update({
      where: { email: email },
      data: { lastLoginAt: new Date() }
    });

    // ログ記録を await する
    await logger.action({
      actionType: ActionLogType.USER.LOGIN,
      userId: user.userId
    });

    return ResponseFactory.createSuccessResponse(user, idToken);
  } catch (error) {
    // エラーハンドリングもaction logを使用
    if (error instanceof Error) {
      await logger.action({
        actionType: ActionLogType.USER.LOGIN,
        userId: 'unknown',
        metadata: {
          error: error.message,
          timestamp: new Date()
        }
      });
    }
    return ResponseFactory.createErrorResponse('ログインに失敗しました', 500);
  }
}