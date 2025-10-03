/*
  Warnings:

  - The `status` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ownerId` on the `BorrowRequest` table. All the data in the column will be lost.
  - The `status` column on the `BorrowRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'DELIVERY_AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."BookStatus" AS ENUM ('AVAILABLE', 'BORROWED');

-- CreateEnum
CREATE TYPE "public"."BorrowRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- DropIndex
DROP INDEX "public"."Book_isVisible_deletedAt_idx";

-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "status",
ADD COLUMN     "status" "public"."BookStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "public"."BorrowRequest" DROP COLUMN "ownerId",
DROP COLUMN "status",
ADD COLUMN     "status" "public"."BorrowRequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';
