import { NextRequest } from "next/server";
import { signIn } from '@/lib/auth/cognito';
import * as jose from 'jose';
import { ActionLogType, logger } from "@/lib/logger";
import { prisma } from '@/lib/database/prisma';
import { BaseApiHandler } from '@/lib/api/handler';

interface DecodedToken {
  email: string;
  sub: string;
}

class LoginHandler extends BaseApiHandler {
  private async validateToken(idToken: string | undefined): Promise<DecodedToken> {
    if (!idToken) {
      throw new Error('認証トークンがありません');
    }
    return await jose.decodeJwt(idToken) as DecodedToken;
  }

  private async authenticate(email: string, password: string) {
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

  async POST(request: NextRequest) {
    try {
      const { email, password } = await request.json();
      const { idToken, user} = await this.authenticate(email, password);

      await prisma.user.update({
        where: { email: email },
        data: { lastLoginAt: new Date() }
      });

      await logger.action({
        actionType: ActionLogType.USER.LOGIN,
        userId: user.userId
      });

      const response = this.successResponse({ 
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        await logger.action({
          actionType: ActionLogType.USER.LOGIN,
          userId: 'unknown',
          metadata: {
            error: error instanceof Error ? error.message : 'ログインに失敗しました',
            timestamp: new Date()
          }
        });
      }
      return this.errorResponse('ログインに失敗しました', 500);
    }
  }
}

const handler = new LoginHandler();
export const POST = handler.POST.bind(handler);