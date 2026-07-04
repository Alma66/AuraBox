-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "Cash_Payment_Code" TEXT,
ADD COLUMN     "Cash_Payment_Expires_At" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Cart_Item" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Subscription_Types" INTEGER NOT NULL,
    "ID_Preferred_Courier" INTEGER,
    "Added_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_Item_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_Item_ID_User_ID_Subscription_Types_key" ON "Cart_Item"("ID_User", "ID_Subscription_Types");
