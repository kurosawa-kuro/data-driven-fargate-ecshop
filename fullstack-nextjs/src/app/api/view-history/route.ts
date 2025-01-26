import { prisma } from '@/lib/prisma';
import { BaseApiHandler } from '@/lib/api/baseHandler';

class ViewHistoryHandler extends BaseApiHandler {
  async POST(request: Request) {
    try {
      const { userId } = await this.getHeaders();
      const authError = this.checkAuth(userId);
      if (authError) return authError;

      const { productId } = await request.json();

      // 閲覧履歴を作成
      const viewHistory = await prisma.viewHistory.create({
        data: {
          userId: userId!,
          productId: parseInt(productId),
          viewedAt: new Date(),
        },
      });

      return this.successResponse({ viewHistory }, 201);
    } catch (error) {
      return this.handleError(error, '閲覧履歴の作成に失敗しました');
    }
  }
}

const handler = new ViewHistoryHandler();
export const POST = handler.POST.bind(handler);