-- Add manager audit support and record origin tracking.
DO $$ BEGIN
  ALTER TABLE "StockRecord" ADD COLUMN IF NOT EXISTS "origin" "StockOrigin";
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StockRecord" ADD COLUMN IF NOT EXISTS "userId" TEXT;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StockRecord" ADD COLUMN IF NOT EXISTS "snPhotoUrl" TEXT;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "StockRecord"
    ADD CONSTRAINT "StockRecord_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_table THEN null;
END $$;
