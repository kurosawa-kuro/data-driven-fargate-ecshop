import { prisma } from '@/lib/database/prisma';
import { BaseApiHandler } from '@/lib/api/handler';
import { NextResponse } from 'next/server';

enum DisplayType {
  SALE,                 // セール商品
  RECOMMENDED,          // 閲覧履歴ベースのおすすめ
  REPURCHASE,           // 再び購入
  DAILY_DEAL,           // 今日の特価
  RECOMMENDED_CATEGORY, // おすすめカテゴリー
  CONTINUE_SHOPPING     // ショッピングを続ける
}

class ProductsHandler extends BaseApiHandler {
  async GET() {
    try {
      const { userId } = await this.getHeaders();
      
      // トップページ表示を取得
      const topPageDisplay = await prisma.topPageDisplay.findMany();

      const topPageDisplayByDisplayType = topPageDisplay.reduce((acc, curr) => {
        const key = curr.displayType as unknown as number;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
      }, {} as Partial<Record<number, typeof topPageDisplay[number][]>>);

      return NextResponse.json(
        {  topPageDisplayByDisplayType },
        {
          headers: {
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    } catch (error) {
      return this.handleError(error, 'トップページ表示の取得に失敗しました');
    }
  }
}

const handler = new ProductsHandler();
export const GET = handler.GET.bind(handler);