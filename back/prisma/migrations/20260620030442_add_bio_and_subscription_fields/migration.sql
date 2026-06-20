-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Moto', 'Auto', 'Bicicleta', 'A_Pie');

-- AlterEnum
ALTER TYPE "ShipmentStatus" ADD VALUE 'Asignado';

-- AlterTable
ALTER TABLE "Entrepreneurs" ADD COLUMN     "Bio" TEXT;

-- AlterTable
ALTER TABLE "Shipments" ADD COLUMN     "Address_Number" TEXT,
ADD COLUMN     "Box_Content" TEXT,
ADD COLUMN     "City" TEXT,
ADD COLUMN     "Delivery_Window_From" TEXT,
ADD COLUMN     "Delivery_Window_To" TEXT,
ADD COLUMN     "ID_Assigned_Rider" INTEGER,
ADD COLUMN     "Instructions" TEXT,
ADD COLUMN     "Locality" TEXT,
ADD COLUMN     "Postal_Code" TEXT,
ADD COLUMN     "Province" TEXT,
ADD COLUMN     "Street" TEXT;

-- AlterTable
ALTER TABLE "Subscription_Types" ADD COLUMN     "Image_URL" TEXT,
ADD COLUMN     "Includes" TEXT,
ADD COLUMN     "Shipping_Areas" TEXT;

-- CreateTable
CREATE TABLE "Rider_Profile" (
    "ID" SERIAL NOT NULL,
    "ID_Entrepreneur" INTEGER NOT NULL,
    "Vehicle_Type" "VehicleType" NOT NULL,
    "License_Plate" TEXT,
    "Availability" BOOLEAN NOT NULL DEFAULT true,
    "Zones_Covered" TEXT,
    "Is_Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rider_Profile_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rider_Profile_ID_Entrepreneur_key" ON "Rider_Profile"("ID_Entrepreneur");
