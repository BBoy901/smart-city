-- CreateEnum
CREATE TYPE "SellerApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "seller_profiles" ADD COLUMN     "approval_status" "SellerApproval" NOT NULL DEFAULT 'PENDING';
