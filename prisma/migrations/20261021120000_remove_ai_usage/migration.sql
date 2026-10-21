-- DropForeignKey
ALTER TABLE "AIUsage" DROP CONSTRAINT IF EXISTS "AIUsage_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "AIUsage";
