import { NextResponse } from 'next/server';
import { confirmSignUp } from '@/lib/auth/cognito';
import { prisma } from '@/lib/prisma';
import { ActionLogType, logger } from '@/lib/logger';
import { ActionType } from '@prisma/client';
import { BaseApiHandler } from '@/lib/api/baseHandler';

class ConfirmHandler extends BaseApiHandler {
  async POST(request: Request) {
    try {
      const { email, code } = await request.json();

      // メール確認
      const response = await confirmSignUp(email, code);

      if (response.sub) {
        await prisma.user.update({
          where: { id: response.sub },
          data: { emailVerified: true }
        });
        
        // ログ記録
        await logger.action({
          actionType: ActionType.USER_REGISTER_COMPLETE,
          userId: response.sub,
        });
      }

      return this.successResponse({ success: true });
    } catch (error: any) {
      console.error('Confirmation error:', error);
      return this.errorResponse(
        error.message || '確認コードの検証に失敗しました',
        400
      );
    }
  }
}

const handler = new ConfirmHandler();
export const POST = handler.POST.bind(handler); 