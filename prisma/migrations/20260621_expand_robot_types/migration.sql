-- Expand robot type enum with new product catalog.
DO $$ BEGIN
  CREATE TYPE "RobotTypeCode_new" AS ENUM (
    'YUANZHENG_A3',
    'YUANZHENG_A2_FLAGSHIP',
    'YUANZHENG_A2_YOUTH',
    'LINGXI_X2_FLAGSHIP',
    'LINGXI_X2_YOUTH',
    'D1_ULTRA',
    'D1_EDU',
    'D1_PRO',
    'D1_MAX'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Robot" ALTER COLUMN "type" TYPE "RobotTypeCode_new" USING (
  CASE "type"::text
    WHEN 'YUANZHENG_A2' THEN 'YUANZHENG_A2_FLAGSHIP'
    ELSE "type"::text
  END
)::"RobotTypeCode_new";

ALTER TABLE "Robot" ALTER COLUMN "type" TYPE "RobotTypeCode" USING "type"::text::"RobotTypeCode";
DROP TYPE IF EXISTS "RobotTypeCode_new";

-- If the old enum still exists on some environments, normalize the legacy value too.
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'YUANZHENG_A2_FLAGSHIP';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'YUANZHENG_A2_YOUTH';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'LINGXI_X2_FLAGSHIP';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'LINGXI_X2_YOUTH';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'D1_ULTRA';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'D1_EDU';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'D1_PRO';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE "RobotTypeCode" ADD VALUE IF NOT EXISTS 'D1_MAX';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
