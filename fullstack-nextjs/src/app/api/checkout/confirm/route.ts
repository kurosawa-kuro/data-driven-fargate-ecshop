import { prisma } from '@/lib/database/prisma';
import { BaseApiHandler } from '@/lib/api/handler';
import { ActionType } from '@prisma/client';
import { logger } from '@/lib/logger';

class CheckoutConfirmHandler extends BaseApiHandler {
  async POST( ) {
    try {
      const { userId, requestId } = await this.getHeaders();
      const authError = this.checkAuth(userId);
      if (authError) return authError;

      // トランザクション処理
      const result = await prisma.$transaction(async (tx) => {
        // 1. CartItems取得
        const cartItems = await tx.cartItem.findMany({
          where: { userId: userId! },
          include: { product: true }
        });

        if (cartItems.length === 0) {
          throw new Error('カートが空です');
        }

        // 2. Order作成
        const order = await tx.order.create({
          data: {
            userId: userId!,
            totalAmount: cartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
            orderItems: {
              create: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price
              }))
            }
          }
        });

        // 3. CartItems削除
        await tx.cartItem.deleteMany({
          where: { userId: userId! }
        });

        // ユーザーアクションログの記録
        await logger.action({
          actionType: ActionType.COMPLETE_ORDER,
          userId: userId!,
          requestID: requestId ?? undefined,
          orderId: order.id,
          metadata: {}
        });

        return { order };
      });

      return this.successResponse({ data: result });
    } catch (error) {
      return this.handleError(error, 'チェックアウトの処理に失敗しました');
    }
  }
}

const handler = new CheckoutConfirmHandler();
export const POST = handler.POST.bind(handler);