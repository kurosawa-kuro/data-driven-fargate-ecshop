generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@localhost:5432/training?sslmode=require"
}

model User {
  id              String    @id
  email           String    @unique
  cognitoId       String    @unique
  emailVerified   Boolean   @default(false)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  status          UserStatus @default(ACTIVE)
  userRoles       UserRole[]
  viewHistories   ViewHistory[]
  cartItems       CartItem[]
  purchases       Purchase[]
  returns         Return[]
}

model TopPage {
  id          Int       @id @default(autoincrement())
  productId   Int
  displayType DisplayType
  sortOrder   Int       @default(0)
  saleStartAt DateTime?
  saleEndAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  product     Product   @relation(fields: [productId], references: [id])

  @@index([displayType, sortOrder])
  @@index([productId])
  @@index([saleStartAt, saleEndAt])
}

enum DisplayType {
  FEATURE_SALE
  RECOMMENDED
  TIME_SALE
}

enum UserStatus {
  ACTIVE
  DISABLED
  DELETED
}

model Role {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userRoles       UserRole[]
}

model UserRole {
  userId          String
  roleId          Int
  assignedAt      DateTime  @default(now())
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role            Role      @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@id([userId, roleId])
  @@index([userId])
  @@index([roleId])
}

model Product {
  id              Int       @id @default(autoincrement())
  name            String
  price           Float
  discountRate    Float?
  rating          Float
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  topPage         TopPage[]
  productCategories ProductCategory[]
  viewHistories   ViewHistory[]
  cartItems       CartItem[]
  purchaseItems   PurchaseItem[]
  returnItems     ReturnItem[]
}

model Category {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  productCategories ProductCategory[]
}

model ProductCategory {
  productId       Int
  categoryId      Int
  assignedAt      DateTime  @default(now())
  
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  category        Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([productId, categoryId])
  @@index([productId])
  @@index([categoryId])
}

model ViewHistory {
  id          Int       @id @default(autoincrement())
  userId      String
  productId   Int
  viewedAt    DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  
  @@index([userId])
  @@index([productId])
  @@unique([userId, productId, viewedAt])
}

model CartItem {
  id          Int       @id @default(autoincrement())
  userId      String
  productId   Int
  quantity    Int       @default(1)
  addedAt     DateTime  @default(now())
  
  user        User      @relation(fields: [userId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
}

model Purchase {
  id          Int       @id @default(autoincrement())
  userId      String
  totalAmount Float
  purchasedAt DateTime  @default(now())
  
  user          User            @relation(fields: [userId], references: [id])
  purchaseItems PurchaseItem[]
  returns       Return[]
  
  @@index([userId])
}

model PurchaseItem {
  id          Int       @id @default(autoincrement())
  purchaseId  Int
  productId   Int
  quantity    Int
  price       Float
  
  purchase    Purchase  @relation(fields: [purchaseId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  
  @@index([purchaseId])
  @@index([productId])
}

model UserActionLog {
  id          Int       @id @default(autoincrement())
  requestID   String?
  userId      String
  actionType  ActionType
  productId   Int?
  cartItemId  Int?
  quantity    Int?
  savedForLater Boolean?
  purchaseId  Int?
  paymentErrorDetails String?
  returnId    Int?
  returnReason String?
  reviewText  String?
  rating      Float?
  deleteReason String?
  metadata    Json?
  createdAt   DateTime  @default(now())
  
  @@index([userId, actionType, createdAt])
  @@index([requestID])
}

enum ActionType {
  CART_ADD
  CART_REMOVE
  CART_UPDATE
  COMPLETE_PURCHASE
  PURCHASE_CANCEL
  RETURN_REQUESTED
  RETURN_COMPLETED
  USER_REGISTER_START
  USER_REGISTER_COMPLETE
  PROFILE_UPDATE
  USER_LOGIN
  USER_LOGOUT
  DELETE_ACCOUNT
}

model Return {
  id           Int       @id @default(autoincrement())
  purchaseId   Int
  userId       String
  returnedAt   DateTime  @default(now())
  status       ReturnStatus @default(REQUESTED)
  reason       String
  
  purchase     Purchase  @relation(fields: [purchaseId], references: [id])
  returnItems  ReturnItem[]
  user         User      @relation(fields: [userId], references: [id])
  
  @@index([purchaseId])
  @@index([userId])
}

model ReturnItem {
  id          Int       @id @default(autoincrement())
  returnId    Int
  productId   Int
  quantity    Int
  
  return      Return    @relation(fields: [returnId], references: [id])
  product     Product   @relation(fields: [productId], references: [id])
  
  @@index([returnId])
  @@index([productId])
}

enum ReturnStatus {
  REQUESTED
  APPROVED
  REJECTED
  COMPLETED
}