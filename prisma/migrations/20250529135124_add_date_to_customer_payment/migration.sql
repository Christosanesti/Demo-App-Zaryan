-- Add date column to CustomerPayment table
ALTER TABLE `CustomerPayment` ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3); 