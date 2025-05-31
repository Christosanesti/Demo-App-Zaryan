-- AlterTable
ALTER TABLE `DaybookEntry` ALTER COLUMN `description` DROP DEFAULT,
    ALTER COLUMN `reference` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;
