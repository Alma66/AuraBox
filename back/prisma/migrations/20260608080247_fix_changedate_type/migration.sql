/*
  Warnings:

  - The `Change_Date` column on the `Club_Status_History` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Club_Status_History" DROP COLUMN "Change_Date",
ADD COLUMN     "Change_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "ID_Gateway_Transaction" SET DATA TYPE TEXT;
