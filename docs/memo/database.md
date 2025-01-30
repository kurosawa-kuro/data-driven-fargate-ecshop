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
  role            Role        @relation(fields: [roleId], references: [id])     
  viewHistories   ViewHistory[]
  cartItems       CartItem[]
  orders       Order[]
}

model Role {
  id              Int       @id @default(autoincrement())
  name            String
  users           User[]
}

model UserRole {
    userId Int
    roleId Int
    user User @relation(fields: [userId], references: [id])
    role Role @relation(fields: [roleId], references: [id])
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

model ProductCategory {
  productId Int
  categoryId Int
  product Product @relation(fields: [productId], references: [id])
  category Category @relation(fields: [categoryId], references: [id])
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