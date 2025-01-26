import { prisma } from '@/lib/prisma';
import { BaseApiHandler } from '@/lib/api/baseHandler';

class ProductsHandler extends BaseApiHandler {
  async GET() {
    try {
      const { userId } = await this.getHeaders();
      
      // 商品一覧を取得
      const products = await prisma.product.findMany();

      return this.successResponse({ 
        products,
        user: { userId } // ユーザーIDをレスポンスに含める
      });
    } catch (error) {
      return this.handleError(error, '商品一覧の取得に失敗しました');
    }
  }
}

const handler = new ProductsHandler();
export const GET = handler.GET.bind(handler);