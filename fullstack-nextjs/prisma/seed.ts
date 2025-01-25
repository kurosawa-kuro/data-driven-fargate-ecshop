/// <reference types="node" />

// /home/wsl/app/fullstack-nextjs/src/lib/prisma.tsx
import { prisma } from '../src/lib/prisma';
import { UserStatus, ActionType } from '@prisma/client';


/**
 * すべてのテーブルのデータを削除する
 * リレーションの依存関係を考慮した順序で削除
 */
async function cleanAllTables() {
  // 依存関係のあるすべてのテーブルを完全に削除
  await prisma.$executeRaw`
    DO $$ 
    BEGIN 
      DELETE FROM "UserActionLog";
      DELETE FROM "PurchaseItem";
      DELETE FROM "Purchase";
      DELETE FROM "CartItem";
      DELETE FROM "ViewHistory";
      DELETE FROM "ProductCategory";
      DELETE FROM "Category";
      DELETE FROM "Product";
      DELETE FROM "UserRole";
      DELETE FROM "Role";
      DELETE FROM "User";
      
      ALTER SEQUENCE "UserActionLog_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "PurchaseItem_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Purchase_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "CartItem_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "ViewHistory_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Category_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Product_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Role_id_seq" RESTART WITH 1;
    END $$;
  `;
  
  console.log("全テーブルのクリーンアップとシーケンスのリセットが完了しました");
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
      prisma.user.create({
        data: {
          id: "auth0|user2",
          email: "user2@example.com",
          cognitoId: "cognito|user2",
          emailVerified: true,
          status: UserStatus.ACTIVE
        }
      }),
      prisma.user.create({
        data: {
          id: "auth0|user3",
          email: "user3@example.com",
          cognitoId: "cognito|user3",
          emailVerified: false,
          status: UserStatus.DELETED
        }
      }),
      prisma.user.create({
        data: {
          id: "auth0|user4",
          email: "user4@example.com",
          cognitoId: "cognito|user4",
          emailVerified: true,
          status: UserStatus.ACTIVE
        }
      }),
      prisma.user.create({
        data: {
          id: "auth0|user5",
          email: "user5@example.com",
          cognitoId: "cognito|user5",
          emailVerified: true,
          status: UserStatus.DISABLED
        }
      })
    ]);

    // ロールの作成
    const roles = await Promise.all([
      prisma.role.create({
        data: { name: "ADMIN" }
      }),
      prisma.role.create({
        data: { name: "USER" }
      }),
      prisma.role.create({
        data: { name: "GUEST" }
      })
    ]);

    // UserRoleの作成
    await Promise.all([
      prisma.userRole.create({
        data: {
          userId: users[0].id,
          roleId: roles[0].id  // ADMIN
        }
      }),
      prisma.userRole.create({
        data: {
          userId: users[1].id,
          roleId: roles[1].id  // USER
        }
      }),
      prisma.userRole.create({
        data: {
          userId: users[2].id,
          roleId: roles[2].id  // GUEST
        }
      }),
      prisma.userRole.create({
        data: {
          userId: users[3].id,
          roleId: roles[1].id  // USER
        }
      }),
      prisma.userRole.create({
        data: {
          userId: users[4].id,
          roleId: roles[1].id  // USER（roles[4]から修正）
        }
      })
    ]);

    // カテゴリーの作成
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: "Electronics" }
      }),
      prisma.category.create({
        data: { name: "Books" }
      }),
      prisma.category.create({
        data: { name: "Clothing" }
      }),
      prisma.category.create({
        data: { name: "Sports" }
      }),
      prisma.category.create({
        data: { name: "Home & Garden" }
      })
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
      prisma.product.create({
        data: {
          name: "Smartphone",
          price: 699.99,
          rating: 4.3
        }
      }),
      prisma.product.create({
        data: {
          name: "Headphones",
          price: 199.99,
          rating: 4.7
        }
      }),
      prisma.product.create({
        data: {
          name: "Tablet",
          price: 499.99,
          rating: 4.2
        }
      }),
      prisma.product.create({
        data: {
          name: "Smartwatch",
          price: 299.99,
          rating: 4.4
        }
      })
    ]);

    // ProductCategoryの作成
    await Promise.all([
      prisma.productCategory.create({
        data: {
          productId: products[0].id,
          categoryId: categories[0].id
        }
      }),
      prisma.productCategory.create({
        data: {
          productId: products[1].id,
          categoryId: categories[0].id
        }
      }),
      prisma.productCategory.create({
        data: {
          productId: products[2].id,
          categoryId: categories[0].id
        }
      }),
      prisma.productCategory.create({
        data: {
          productId: products[3].id,
          categoryId: categories[0].id
        }
      }),
      prisma.productCategory.create({
        data: {
          productId: products[4].id,
          categoryId: categories[0].id
        }
      })
    ]);

    // ViewHistoryの作成
    await Promise.all([
      prisma.viewHistory.create({
        data: {
          userId: users[0].id,
          productId: products[0].id
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[1].id,
          productId: products[1].id
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[2].id,
          productId: products[2].id
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[3].id,
          productId: products[3].id
        }
      }),
      prisma.viewHistory.create({
        data: {
          userId: users[4].id,
          productId: products[4].id
        }
      })
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
      prisma.cartItem.create({
        data: {
          userId: users[1].id,
          productId: products[1].id,
          quantity: 1
        }
      }),
      prisma.cartItem.create({
        data: {
          userId: users[2].id,
          productId: products[2].id,
          quantity: 3
        }
      }),
      prisma.cartItem.create({
        data: {
          userId: users[3].id,
          productId: products[3].id,
          quantity: 1
        }
      }),
      prisma.cartItem.create({
        data: {
          userId: users[4].id,
          productId: products[4].id,
          quantity: 2
        }
      })
    ]);

    // Purchaseの作成
    const purchases = await Promise.all([
      prisma.purchase.create({
        data: {
          userId: users[0].id,
          totalAmount: 1999.98
        }
      }),
      prisma.purchase.create({
        data: {
          userId: users[1].id,
          totalAmount: 699.99
        }
      }),
      prisma.purchase.create({
        data: {
          userId: users[2].id,
          totalAmount: 599.97
        }
      }),
      prisma.purchase.create({
        data: {
          userId: users[3].id,
          totalAmount: 499.99
        }
      }),
      prisma.purchase.create({
        data: {
          userId: users[4].id,
          totalAmount: 599.98
        }
      })
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
      prisma.purchaseItem.create({
        data: {
          purchaseId: purchases[1].id,
          productId: products[1].id,
          quantity: 1,
          price: 699.99
        }
      }),
      prisma.purchaseItem.create({
        data: {
          purchaseId: purchases[2].id,
          productId: products[2].id,
          quantity: 3,
          price: 199.99
        }
      }),
      prisma.purchaseItem.create({
        data: {
          purchaseId: purchases[3].id,
          productId: products[3].id,
          quantity: 1,
          price: 499.99
        }
      }),
      prisma.purchaseItem.create({
        data: {
          purchaseId: purchases[4].id,
          productId: products[4].id,
          quantity: 2,
          price: 299.99
        }
      })
    ]);

    // UserActionLogの作成
    await Promise.all([
      prisma.userActionLog.create({
        data: {
          userId: users[0].id,
          actionType: ActionType.PRODUCT_VIEW,
          productId: products[0].id
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[1].id,
          actionType: ActionType.CART_ADD,
          productId: products[1].id
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[2].id,
          actionType: ActionType.COMPLETE_PURCHASE,
          productId: products[2].id
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[3].id,
          actionType: ActionType.PRODUCT_VIEW,
          productId: products[3].id
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[4].id,
          actionType: ActionType.CART_ADD,
          productId: products[4].id
        }
      })
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

