-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DaybookEntry` MODIFY `description` VARCHAR(191) NOT NULL DEFAULT 'No description',
    MODIFY `reference` VARCHAR(191) NOT NULL DEFAULT 'No reference';

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateIndex
CREATE INDEX `DaybookEntry_type_idx` ON `DaybookEntry`(`type`);

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DaybookEntry` ADD CONSTRAINT `DaybookEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
