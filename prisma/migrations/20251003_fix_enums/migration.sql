-- prisma/migrations/20251003_enhanced_shelf/migration.sql

-- Add isVisible column to Book table
ALTER TABLE "public"."Book" 
  ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- Add deletedAt column to Book table (for soft delete)
ALTER TABLE "public"."Book" 
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create index for better query performance
CREATE INDEX "Book_isVisible_deletedAt_idx" 
  ON "public"."Book"("isVisible", "deletedAt");