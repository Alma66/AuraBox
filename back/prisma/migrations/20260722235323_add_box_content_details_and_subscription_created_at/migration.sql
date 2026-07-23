-- AlterTable
ALTER TABLE "Box_Content_History" ADD COLUMN     "Age_Restriction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Allergens_Detail" TEXT,
ADD COLUMN     "Cleaning_Instructions" TEXT,
ADD COLUMN     "Contains_Allergens" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Danger_Detail" TEXT,
ADD COLUMN     "Is_Dangerous_Item" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Origin_Location" TEXT,
ADD COLUMN     "Requires_Cleaning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Updated_At" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Subscription_Types" ADD COLUMN     "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
