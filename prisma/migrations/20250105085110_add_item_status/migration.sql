-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_initiativeId_fkey";

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Item_initiativeId_idx" ON "Item"("initiativeId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
