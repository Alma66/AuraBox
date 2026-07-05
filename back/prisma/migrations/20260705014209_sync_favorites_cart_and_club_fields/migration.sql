/*
  Warnings:

  - You are about to drop the column `ID_Club` on the `Favorites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ID_User,ID_Subscription_Types]` on the table `Favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ID_Subscription_Types` to the `Favorites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Favorites" DROP COLUMN "ID_Club",
ADD COLUMN     "ID_Subscription_Types" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Favorites_ID_User_ID_Subscription_Types_key" ON "Favorites"("ID_User", "ID_Subscription_Types");
