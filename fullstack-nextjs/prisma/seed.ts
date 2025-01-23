// /home/wsl/app/fullstack-nextjs/src/lib/prisma.tsx
import { prisma } from '../src/lib/prisma';
import { UserStatus, ActionType } from '@prisma/client';


/**
 * すべてのテーブルのデータを削除する
 * リレーションの依存関係を考慮した順序で削除
 */
async function cleanAllTables() {
  await prisma.userActionLog.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.viewHistory.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  
  console.log("全テーブルのクリーンアップが完了しました");
}

async function main() {
  console.log("シードプロセスを開始します...");
  
  try {
    await cleanAllTables();

    // ユーザーの作成
    const users = await Promise.all([
      prisma.user.create({
        data: {
          id: "auth0|user1",
          email: "user1@example.com",
          cognitoId: "cognito|user1",
          emailVerified: true,
          status: UserStatus.ACTIVE
        }
      }),
      // ... 4人分追加のユーザーを作成
    ]);

    // ロールの作成
    const roles = await Promise.all([
      prisma.role.create({
        data: { name: "ADMIN" }
      }),
      prisma.role.create({
        data: { name: "USER" }
      }),
      // ... 3つ追加のロールを作成
    ]);

    // UserRoleの作成
    await Promise.all([
      prisma.userRole.create({
        data: {
          userId: users[0].id,
          roleId: roles[0].id
        }
      }),
      // ... 4つ追加のUserRoleを作成
    ]);

    // カテゴリーの作成
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: "Electronics" }
      }),
      // ... 4つ追加のカテゴリーを作成
    ]);

    // 商品の作成
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Laptop",
          price: 999.99,
          rating: 4.5
        }
      }),
      // ... 4つ追加の商品を作成
    ]);

    // ProductCategoryの作成
    await Promise.all([
      prisma.productCategory.create({
        data: {
          productId: products[0].id,
          categoryId: categories[0].id
        }
      }),
      // ... 4つ追加のProductCategoryを作成
    ]);

    // ViewHistoryの作成
    await Promise.all([
      prisma.viewHistory.create({
        data: {
          userId: users[0].id,
          productId: products[0].id
        }
      }),
      // ... 4つ追加のViewHistoryを作成
    ]);

    // CartItemの作成
    await Promise.all([
      prisma.cartItem.create({
        data: {
          userId: users[0].id,
          productId: products[0].id,
          quantity: 2
        }
      }),
      // ... 4つ追加のCartItemを作成
    ]);

    // Purchaseの作成
    const purchases = await Promise.all([
      prisma.purchase.create({
        data: {
          userId: users[0].id,
          totalAmount: 1999.98
        }
      }),
      // ... 4つ追加のPurchaseを作成
    ]);

    // PurchaseItemの作成
    await Promise.all([
      prisma.purchaseItem.create({
        data: {
          purchaseId: purchases[0].id,
          productId: products[0].id,
          quantity: 2,
          price: 999.99
        }
      }),
      // ... 4つ追加のPurchaseItemを作成
    ]);

    // UserActionLogの作成
    await Promise.all([
      prisma.userActionLog.create({
        data: {
          userId: users[0].id,
          actionType: ActionType.VIEW_PRODUCT,
          productId: products[0].id
        }
      }),
      // ... 4つ追加のUserActionLogを作成
    ]);

    console.log("シードプロセスが完了しました");
  } catch (error: unknown) {
    console.error('予期せぬエラーが発生しました:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Seed process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

