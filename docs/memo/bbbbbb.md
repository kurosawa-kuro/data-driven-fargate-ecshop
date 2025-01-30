ECサイトシミュレーター用の最低限必要なスキーマを設計します：
prismaCopygenerator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
// ユーザー関連
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // リレーション
  viewHistories   ViewHistory[]
  cartItems       CartItem[]
  orders       Order[]
}
// 商品関連
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  price       Float
  categoryId  Int
  rating      Float
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  // リレーション
  category        Category      @relation(fields: [categoryId], references: [id])
  viewHistories   ViewHistory[]
  cartItems       CartItem[]
  orderItems   OrderItem[]
  @@index([categoryId])
}
// カテゴリー
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  products  Product[]
}
// 閲覧履歴（Random Forest, Logistic Regression用）
model ViewHistory {
  id          Int       @id @default(autoincrement())
  userId      Int
  productId   Int
  viewedAt    DateTime  @default(now())

  // リレーション
  user        User      @relation(fields: [userId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  @@index([userId])
  @@index([productId])
}
// カート（K-means用）
model CartItem {
  id          Int       @id @default(autoincrement())
  userId      Int
  productId   Int
  quantity    Int       @default(1)
  addedAt     DateTime  @default(now())

  // リレーション
  user        User      @relation(fields: [userId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  @@index([userId])
  @@index([productId])
}
// 購入履歴（Linear Regression, PCA用）
model Order {
  id          Int       @id @default(autoincrement())
  userId      Int
  totalAmount Float
  orderedAt DateTime  @default(now())

  // リレーション
  user          User            @relation(fields: [userId], references: [id])
  orderItems OrderItem[]
  @@index([userId])
}
// 購入商品詳細
model OrderItem {
  id          Int       @id @default(autoincrement())
  orderId  Int
  productId   Int
  quantity    Int
  price       Float     // 購入時の価格を保存

  // リレーション
  Order    Order  @relation(fields: [orderId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  @@index([orderId])
  @@index([productId])
}
このスキーマで収集できるデータと対応する機械学習モデル：
ランダムフォレスト：
ViewHistory + Product + Order テーブルから
特徴量：閲覧回数、商品属性
目的変数：購入有無
ロジスティック回帰：
CartItem + Product テーブルから
特徴量：商品属性
目的変数：カート追加有無
線形回帰：
ViewHistory テーブルから
特徴量：時間帯、商品属性
目的変数：閲覧数推移
K-means：
CartItem + Order テーブルから
ユーザーの購買行動クラスタリング
PCA：
Product + ViewHistory + Order テーブルから
商品特性の次元削減
主要な特徴：
必要最小限のテーブル構成
適切なインデックス設定
時系列データの取得が容易
柔軟な拡張性
このスキーマは必要に応じて以下のように拡張可能です：
商品の在庫管理
より詳細なユーザープロフィール
商品レビュー機能
セッション管理
割引・クーポン機能