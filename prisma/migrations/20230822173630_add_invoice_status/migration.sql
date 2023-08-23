-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('draft', 'pending', 'paid') NOT NULL DEFAULT 'pending';
