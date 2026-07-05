-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Country" TEXT,
ADD COLUMN     "Gender" TEXT,
ADD COLUMN     "Home_Latitude" DECIMAL(9,6),
ADD COLUMN     "Home_Longitude" DECIMAL(9,6),
ADD COLUMN     "Show_Gender_Publicly" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "User_Category_Preference" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Category" INTEGER NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Category_Preference_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Category_Preference_ID_User_ID_Category_key" ON "User_Category_Preference"("ID_User", "ID_Category");
