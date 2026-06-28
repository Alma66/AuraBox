-- CreateEnum
CREATE TYPE "SupplyOrderStatus" AS ENUM ('Pendiente', 'En_Camino', 'Recibido', 'Cancelado');

-- AlterTable
ALTER TABLE "Rider_Profile" ADD COLUMN     "Cost_Per_Km" DECIMAL(10,2),
ADD COLUMN     "Current_Latitude" DECIMAL(9,6),
ADD COLUMN     "Current_Longitude" DECIMAL(9,6),
ADD COLUMN     "Last_Location_Update" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shipments" ADD COLUMN     "Destination_Latitude" DECIMAL(9,6),
ADD COLUMN     "Destination_Longitude" DECIMAL(9,6);

-- CreateTable
CREATE TABLE "Supply_Category" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supply_Category_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Contact_Email" TEXT,
    "Contact_Phone" TEXT,
    "Address" TEXT,
    "Notes" TEXT,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Supplier_Category" (
    "ID" SERIAL NOT NULL,
    "ID_Supplier" INTEGER NOT NULL,
    "ID_Supply_Category" INTEGER NOT NULL,

    CONSTRAINT "Supplier_Category_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Product_Inventory" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Supply_Category" INTEGER NOT NULL,
    "ID_Supplier" INTEGER,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Unit_Type" TEXT NOT NULL,
    "Current_Stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "Min_Stock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "Cost_Per_Unit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_Inventory_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Supply_Order" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Supplier" INTEGER NOT NULL,
    "ID_Product_Inventory" INTEGER NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "Total_Cost" DECIMAL(10,2) NOT NULL,
    "Status" "SupplyOrderStatus" NOT NULL DEFAULT 'Pendiente',
    "Order_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Estimated_Arrival" TIMESTAMP(3),
    "Received_Date" TIMESTAMP(3),
    "Notes" TEXT,

    CONSTRAINT "Supply_Order_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_Category_ID_Supplier_ID_Supply_Category_key" ON "Supplier_Category"("ID_Supplier", "ID_Supply_Category");
