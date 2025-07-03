-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "clerkSubscriptionId" TEXT,
ADD COLUMN     "currentProducts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentUsers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyTransactions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "planId" TEXT DEFAULT 'starter',
ADD COLUMN     "planStatus" TEXT DEFAULT 'active',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BillingEvent" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillingEvent_shopId_createdAt_idx" ON "BillingEvent"("shopId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingEvent_eventType_createdAt_idx" ON "BillingEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
