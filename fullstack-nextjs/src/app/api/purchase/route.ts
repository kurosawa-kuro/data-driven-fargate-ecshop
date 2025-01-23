import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
  try {
    // 注文一覧取得
    // // 購入履歴（Linear Regression, PCA用）
    // model Purchase {
    //   id          Int       @id @default(autoincrement())
    //   userId      String
    //   totalAmount Float
    //   purchasedAt DateTime  @default(now())

    //   // リレーション
    //   user          User            @relation(fields: [userId], references: [id])
    //   purchaseItems PurchaseItem[]
    //   userActionLogs UserActionLog[]
    //   @@index([userId])
    // }

    // // 購入商品詳細
    // model PurchaseItem {
    //   id          Int       @id @default(autoincrement())
    //   purchaseId  Int
    //   productId   Int
    //   quantity    Int
    //   price       Float     // 購入時の価格を保存

    //   // リレーション
    //   purchase    Purchase  @relation(fields: [purchaseId], references: [id])
    //   product     Product   @relation(fields: [productId], references: [id])
    //   @@index([purchaseId])
    //   @@index([productId])
    // }

    // 購入履歴取得
    // 商品名、購入日時、購入金額、購入数量、購入時の価格
    // 購入履歴はユーザーIDで絞り込む
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: "auth0|user1"
      },
      include: {
        purchaseItems: {
          include: {
            product: true
          }
        }
      },
    });
    console.log("◇◇◇◇◇◇◇◇◇◇◇◇◇◇ purchases", purchases);

    // 成功時のレスポンスを追加
    return NextResponse.json({ success: true, purchases }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating sample:', error.message);
      return NextResponse.json(
        { error: 'Failed to create sample: ' + error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create sample' },
      { status: 500 }
    );
  }
}