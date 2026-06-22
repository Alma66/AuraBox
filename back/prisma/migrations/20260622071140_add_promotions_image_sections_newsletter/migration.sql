-- CreateEnum
CREATE TYPE "ImageSection" AS ENUM ('Logo', 'Banner', 'Historia', 'Equipo');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('Descuento_Temporal', 'Combo_Suscripciones', 'Descuento_Por_Cantidad', 'Envio_Gratis', 'Cupon_Proxima', 'Descuento_Primeros_Meses');

-- AlterTable
ALTER TABLE "Image_Club" ADD COLUMN     "Is_Active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Section" "ImageSection" NOT NULL DEFAULT 'Banner',
ADD COLUMN     "Uploaded_By" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Accepts_Newsletter" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Promotion" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Promotion_Type" "PromotionType" NOT NULL,
    "Discount_Percentage" DECIMAL(5,2),
    "ID_Subscription_Types" INTEGER,
    "Combo_Subscription_Ids" TEXT,
    "Min_Subscriptions_Qty" INTEGER,
    "Free_Shipping" BOOLEAN NOT NULL DEFAULT false,
    "Coupon_Code" TEXT,
    "Duration_Months" INTEGER,
    "Start_Date" TIMESTAMP(3),
    "End_Date" TIMESTAMP(3),
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Created_By" INTEGER,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_Coupon_Code_key" ON "Promotion"("Coupon_Code");
