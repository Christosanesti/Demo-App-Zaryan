/*
  Warnings:

  - You are about to drop the column `userId` on the `Reference` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Reference` will be added. If there are existing duplicate values, this will fail.
  - Made the column `description` on table `DaybookEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reference` on table `DaybookEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `DaybookEntry` DROP FOREIGN KEY `DaybookEntry_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Reference` DROP FOREIGN KEY `Reference_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSettings` DROP FOREIGN KEY `UserSettings_userId_fkey`;

-- DropIndex
DROP INDEX `Reference_userId_idx` ON `Reference`;

-- DropIndex
DROP INDEX `Reference_userId_name_key` ON `Reference`;

-- AlterTable
ALTER TABLE `User` 
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `emailVerified`,
    DROP COLUMN `image`;

-- Update existing User records to ensure name and email are not null
UPDATE `User` SET `name` = 'Unknown' WHERE `name` IS NULL;
UPDATE `User` SET `email` = 'unknown@example.com' WHERE `email` IS NULL;

-- Now make the columns required
ALTER TABLE `User` 
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `DaybookEntry` 
    MODIFY `description` VARCHAR(191) NOT NULL DEFAULT 'No description',
    MODIFY `reference` VARCHAR(191) NOT NULL DEFAULT 'No reference';

-- AlterTable
ALTER TABLE `Reference` DROP COLUMN `userId`;

-- CreateIndex
CREATE UNIQUE INDEX `Reference_name_key` ON `Reference`(`name`);

-- CreateIndex
CREATE INDEX `UserSettings_userId_idx` ON `UserSettings`(`userId`);

-- AddForeignKey
ALTER TABLE `UserSettings` ADD CONSTRAINT `UserSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `CustomerPayment_customerId_idx` ON `CustomerPayment`(`customerId`);
