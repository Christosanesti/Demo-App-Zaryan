/*
  Warnings:

  - You are about to drop the column `photo` on the `Customer` table. All the data in the column will be lost.
  - Made the column `userId` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Customer` DROP FOREIGN KEY `Customer_userId_fkey`;

-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `photo`,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'individual',
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `Customer_type_idx` ON `Customer`(`type`);

-- CreateIndex
CREATE INDEX `Customer_status_idx` ON `Customer`(`status`);

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Customer_userId_idx` ON `Customer`(`userId`);
