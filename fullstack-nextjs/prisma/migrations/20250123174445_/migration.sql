-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('VIEW_PRODUCT', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'UPDATE_CART', 'START_CHECKOUT', 'COMPLETE_PURCHASE', 'CANCEL_PURCHASE');

-- CreateTable
CREATE TABLE "UserActionLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "productId" INTEGER,
    "cartItemId" INTEGER,
    "purchaseId" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActionLog_userId_actionType_createdAt_idx" ON "UserActionLog"("userId", "actionType", "createdAt");

-- CreateIndex
CREATE INDEX "UserActionLog_productId_idx" ON "UserActionLog"("productId");

-- AddForeignKey
ALTER TABLE "UserActionLog" ADD CONSTRAINT "UserActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionLog" ADD CONSTRAINT "UserActionLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
