
ALTER TABLE "Entrepreneurs" ADD COLUMN     "Birth_Date" TIMESTAMP(3),
DROP COLUMN "Phone_Number",
ADD COLUMN     "Phone_Number" INTEGER;

ALTER TABLE "User" ADD COLUMN     "Birth_Date" TIMESTAMP(3),
DROP COLUMN "Phone_Number",
ADD COLUMN     "Phone_Number" INTEGER;
