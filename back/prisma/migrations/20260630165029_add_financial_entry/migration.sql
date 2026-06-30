-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('Ingreso', 'Egreso');

-- CreateEnum
CREATE TYPE "FinancialEntryStatus" AS ENUM ('Pendiente', 'Confirmado', 'Pagado');

-- CreateTable
CREATE TABLE "Financial_Entry" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Type" "FinancialEntryType" NOT NULL,
    "Category" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Amount" DECIMAL(10,2) NOT NULL,
    "Entry_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Status" "FinancialEntryStatus" NOT NULL DEFAULT 'Confirmado',
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Financial_Entry_pkey" PRIMARY KEY ("ID")
);
