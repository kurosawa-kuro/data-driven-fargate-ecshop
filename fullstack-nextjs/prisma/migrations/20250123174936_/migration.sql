-- CreateIndex
CREATE INDEX "UserActionLog_cartItemId_idx" ON "UserActionLog"("cartItemId");

-- CreateIndex
CREATE INDEX "UserActionLog_purchaseId_idx" ON "UserActionLog"("purchaseId");

-- AddForeignKey
ALTER TABLE "UserActionLog" ADD CONSTRAINT "UserActionLog_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActionLog" ADD CONSTRAINT "UserActionLog_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
