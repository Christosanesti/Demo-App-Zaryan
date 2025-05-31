/*
  Warnings:

  - The required column `id` was added to the `Category` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Category` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT '#000000',
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `icon` VARCHAR(191) NOT NULL DEFAULT 'circle',
    ALTER COLUMN `type` DROP DEFAULT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DaybookEntry` ADD COLUMN `attachments` VARCHAR(191) NULL,
    ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'uncategorized',
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'cash',
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'completed';

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'piece',
    `price` DOUBLE NOT NULL DEFAULT 0,
    `category` VARCHAR(191) NOT NULL DEFAULT 'uncategorized',
    `sku` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `minStock` INTEGER NOT NULL DEFAULT 0,
    `maxStock` INTEGER NULL,
    `supplier` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Inventory_sku_key`(`sku`),
    INDEX `Inventory_userId_idx`(`userId`),
    INDEX `Inventory_category_idx`(`category`),
    INDEX `Inventory_sku_idx`(`sku`),
    INDEX `Inventory_barcode_idx`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_userId_idx` ON `Category`(`userId`);

-- CreateIndex
CREATE INDEX `Category_type_idx` ON `Category`(`type`);

-- CreateIndex
CREATE INDEX `DaybookEntry_category_idx` ON `DaybookEntry`(`category`);

-- CreateIndex
CREATE INDEX `DaybookEntry_status_idx` ON `DaybookEntry`(`status`);

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
