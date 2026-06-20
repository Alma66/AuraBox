/*
  Warnings:

  - You are about to drop the column `Logistics_Company` on the `Shipments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shipments" DROP COLUMN "Logistics_Company",
ADD COLUMN     "ID_Courier" INTEGER;

-- CreateTable
CREATE TABLE "Courier" (
    "ID" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Is_Internal" BOOLEAN NOT NULL DEFAULT false,
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Courier_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club_Courier" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Courier" INTEGER NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_Courier_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "User_Courier_Preference" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Courier" INTEGER NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_Courier_Preference_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courier_Code_key" ON "Courier"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Club_Courier_ID_Club_ID_Courier_key" ON "Club_Courier"("ID_Club", "ID_Courier");

-- CreateIndex
CREATE UNIQUE INDEX "User_Courier_Preference_ID_User_ID_Club_ID_Courier_key" ON "User_Courier_Preference"("ID_User", "ID_Club", "ID_Courier");
