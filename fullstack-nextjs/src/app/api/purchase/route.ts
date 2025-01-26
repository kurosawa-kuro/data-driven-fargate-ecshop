import { prisma } from '@/lib/database/prisma';
import { BaseApiHandler } from '@/lib/api/handler';

class PurchaseHandler extends BaseApiHandler {
  async GET() {
    try {
      const { userId } = await this.getHeaders();
      const authError = this.checkAuth(userId);
      if (authError) return authError;

      // 購入履歴を取得（最新順）
      const purchases = await prisma.purchase.findMany({
        where: { userId: userId! },
        orderBy: { purchasedAt: 'desc' },
        include: {
          purchaseItems: {
            include: {
              product: true
            }
          }
        }
      });

      return this.successResponse({ purchases });
    } catch (error) {
      return this.handleError(error, '購入履歴の取得に失敗しました');
    }
  }
}

const handler = new PurchaseHandler();
export const GET = handler.GET.bind(handler);