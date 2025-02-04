/// <reference types="node" />

// /home/wsl/app/fullstack-nextjs/src/lib/prisma.tsx
import { prisma } from '../src/lib/database/prisma';
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
      DELETE FROM "ReturnItem";
      DELETE FROM "Return";
      DELETE FROM "UserActionLog";
      DELETE FROM "OrderItem";
      DELETE FROM "Order";
      DELETE FROM "CartItem";
      DELETE FROM "ViewHistory";
      DELETE FROM "ProductCategory";
      DELETE FROM "Category";
      DELETE FROM "Product";
      DELETE FROM "UserRole";
      DELETE FROM "Role";
      DELETE FROM "User";
      
      ALTER SEQUENCE "ReturnItem_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Return_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "UserActionLog_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "OrderItem_id_seq" RESTART WITH 1;
      ALTER SEQUENCE "Order_id_seq" RESTART WITH 1;
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
          roleId: roles[1].id  // USER
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
    

    // UserActionLogの作成を更新
    await Promise.all([
      prisma.userActionLog.create({
        data: {
          userId: users[0].id,
          actionType: ActionType.CART_ADD,
          productId: products[0].id,
          productName: products[0].name,
          categoryId: categories[0].id,
          categoryName: categories[0].name,
          cartItemId: 1,
          quantity: 2,
          metadata: { source: "product_page" }
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[1].id,
          actionType: ActionType.ORDER_RETURN_REQUEST,
          productId: products[1].id,
          metadata: { returnId: 1 }
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[2].id,
          actionType: ActionType.SEARCH_BY_KEYWORD,
          searchKeyword: "スマートフォン",
          metadata: { searchResults: 15 }
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[3].id,
          actionType: ActionType.REVIEW_SUBMIT,
          productId: products[3].id,
          reviewText: "とても使いやすいです",
          rating: 5.0,
          metadata: { reviewId: 1 }
        }
      }),
      prisma.userActionLog.create({
        data: {
          userId: users[4].id,
          actionType: ActionType.USER_LOGIN,
          metadata: { loginMethod: "email" }
        }
      })
    ]);

    // TopPageDisplayのシード作成 (各グループに５件ずつ)
    const topPageDisplays = await Promise.all([
      // 5 entries for SALE display type
      ...Array.from({ length: 5 }, (_, index) =>
        prisma.topPageDisplay.create({
          data: {
            displayType: "SALE", // Display type for sale products
            productId: products[index % products.length].id, // Cycle through available products
            priority: index + 1,
            specialPrice: Number((products[index % products.length].price * 0.9).toFixed(2)), // 10% off
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Valid for 7 days
            isActive: true
          }
        })
      ),
      // 5 entries for RECOMMENDED_CATEGORY display type
      ...Array.from({ length: 5 }, (_, index) =>
        prisma.topPageDisplay.create({
          data: {
            displayType: "RECOMMENDED_CATEGORY", // Display type for recommended categories
            categoryId: categories[index % categories.length].id, // Cycle through available categories
            priority: index + 1,
            startDate: new Date(),
            // For indefinite display, endDate is omitted (null)
            isActive: true
          }
        })
      ),
      // 5 entries for CONTINUE_SHOPPING display type
      ...Array.from({ length: 5 }, (_, index) =>
        prisma.topPageDisplay.create({
          data: {
            displayType: "CONTINUE_SHOPPING", // Display type to encourage continuous shopping
            productId: products[index % products.length].id, // Cycle through available products
            priority: index + 1,
            startDate: new Date(),
            isActive: true
          }
        })
      )
    ]);

    console.log("TopPageDisplayのシードデータが作成されました");

    // OrderとOrderItemの作成例
    const order = await prisma.order.create({
      data: {
        userId: users[0].id,
        totalAmount: 999.99,
        orderedAt: new Date(),
        orderItems: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: 999.99
          }
        }
      }
    });

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

