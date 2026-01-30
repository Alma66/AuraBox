-- CreateEnum
CREATE TYPE "AssignedToType" AS ENUM ('Admins', 'Entrepreneur');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'Pasaporte', 'LC', 'LE');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('Pendiente_Aprobacion', 'Aprobado', 'Suspendido', 'Inactivo');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('Pendiente', 'Aprobado', 'Rechazado');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('Imagen', 'Video');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('Unica', 'Mensual', 'Bimestral', 'Trimestral', 'Cuatrimestral', 'Quinquemestral', 'Semestral', 'Anual');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Exitoso', 'Pendiente', 'Rechazado', 'Reembolsado');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('Pendiente', 'En_Camino', 'Entregado', 'Problema', 'Devuelto');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Activa', 'Pendiente_Pago', 'Cancelada', 'Pausada', 'Finalizada');

-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('PLATFORM', 'CLUB');

-- CreateTable
CREATE TABLE "AdminOrEntrepreneur_Role" (
    "ID" SERIAL NOT NULL,
    "ID_Role" INTEGER NOT NULL,
    "Assigned_To_Type" "AssignedToType" NOT NULL,
    "Assigned_To" INTEGER NOT NULL,
    "Assigned_By_Type" "AssignedToType" NOT NULL,
    "Assigned_By" INTEGER NOT NULL,
    "Assigned_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminOrEntrepreneur_Role_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Admins" (
    "ID" SERIAL NOT NULL,
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password_Hash" TEXT NOT NULL,
    "Document_Type" "DocumentType" NOT NULL,
    "Document_Number" TEXT NOT NULL,
    "Phone_Number" TEXT NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMP(3),
    "Notes" TEXT,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Box_Content_History" (
    "ID" SERIAL NOT NULL,
    "ID_Subscription_Types" INTEGER NOT NULL,
    "Delivery_Month_Year" TEXT NOT NULL,
    "Product_Name" TEXT NOT NULL,
    "Product_Description" TEXT NOT NULL,
    "Usage_Instructions" TEXT,
    "Product_Expiration_Date" TIMESTAMP(3),
    "Product_Image_URL" TEXT,
    "Product_Video_URL" TEXT,
    "Additional_Notes" TEXT,
    "Publication_Date" TIMESTAMP(3),

    CONSTRAINT "Box_Content_History_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Categories" (
    "ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club" (
    "ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Logo_URL" TEXT NOT NULL,
    "Slogan" TEXT,
    "History" TEXT,
    "Short_Description" TEXT NOT NULL,
    "Contact_Email" TEXT NOT NULL,
    "Whatsapp_Contact" TEXT,
    "Club_Status" "ClubStatus" NOT NULL DEFAULT 'Pendiente_Aprobacion',
    "Creation_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Average_Rating" DECIMAL(3,1),
    "Total_Reviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club_Categories" (
    "ID" SERIAL NOT NULL,
    "ID_Categories" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,

    CONSTRAINT "Club_Categories_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club_Payment_Method" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Payment_Methods" INTEGER NOT NULL,

    CONSTRAINT "Club_Payment_Method_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club_Social_Networks" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Network_Type" TEXT NOT NULL,
    "Profile_URL" TEXT NOT NULL,

    CONSTRAINT "Club_Social_Networks_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Club_Status_History" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Admins" INTEGER NOT NULL,
    "Previous_Status" "ClubStatus" NOT NULL,
    "New_Status" "ClubStatus" NOT NULL,
    "Change_Date" BOOLEAN NOT NULL DEFAULT true,
    "Change_Reason" TEXT,

    CONSTRAINT "Club_Status_History_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Entrepreneurs" (
    "ID" SERIAL NOT NULL,
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password_Hash" TEXT NOT NULL,
    "Document_Type" "DocumentType" NOT NULL,
    "Document_Number" INTEGER NOT NULL,
    "CUIT_CUIL" INTEGER,
    "Phone_Number" TEXT,
    "Registration_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "City" TEXT,
    "Province" TEXT,
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Entrepreneurs_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Entrepreneur_Club" (
    "ID" SERIAL NOT NULL,
    "ID_Entrepreneurs" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Association_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entrepreneur_Club_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Entrepreneur_Licenses" (
    "ID" SERIAL NOT NULL,
    "ID_Entrepreneurs" INTEGER NOT NULL,
    "ID_License_Types" INTEGER NOT NULL,
    "Issue_Date" TIMESTAMP(3),
    "Expiration_Date" TIMESTAMP(3),
    "Document_URL" TEXT,
    "Verification_Status" "VerificationStatus" NOT NULL DEFAULT 'Pendiente',
    "Verification_Date" TIMESTAMP(3),
    "Verification_Notes" TEXT,

    CONSTRAINT "Entrepreneur_Licenses_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Favorites" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Date_Added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorites_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Image_Club" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Image_URL" TEXT NOT NULL,
    "Description" TEXT,
    "Content_Type" "ContentType" NOT NULL DEFAULT 'Imagen',
    "Upload_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_Club_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "License_Types" (
    "ID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,

    CONSTRAINT "License_Types_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Payment" (
    "ID" SERIAL NOT NULL,
    "ID_User_Subscription" INTEGER NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Gateway_Transaction" INTEGER,
    "ID_Payment_Methods" INTEGER,
    "Total_Amount_Paid" DECIMAL(10,2) NOT NULL,
    "Club_Amount" DECIMAL(10,2) NOT NULL,
    "Commission_Amount" DECIMAL(10,2) NOT NULL,
    "Payment_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Payment_Status" "PaymentStatus" NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Payment_Methods" (
    "ID" SERIAL NOT NULL,
    "Method" TEXT NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Payment_Methods_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "ID" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Platform_Rules" (
    "ID" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "Version" TEXT NOT NULL,
    "Publication_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Rule_Type" TEXT NOT NULL,

    CONSTRAINT "Platform_Rules_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Rating" INTEGER NOT NULL,
    "Title" TEXT,
    "Comment" TEXT,
    "Review_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Last_Edit_Date" TIMESTAMP(3),
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Role" (
    "ID" SERIAL NOT NULL,
    "Code" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Scope" "RoleScope" NOT NULL DEFAULT 'PLATFORM',
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Role_Permissions" (
    "ID" SERIAL NOT NULL,
    "ID_Role" INTEGER NOT NULL,
    "ID_Permissions" INTEGER NOT NULL,
    "Granted_By_ID" INTEGER NOT NULL,
    "Granted_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_Permissions_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Shipments" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_User_Subscriptions" INTEGER NOT NULL,
    "ID_Club" INTEGER,
    "Box_Month_Year" TEXT NOT NULL,
    "Estimated_Delivery_START_Date" TIMESTAMP(3),
    "Estimated_Delivery_END_Date" TIMESTAMP(3),
    "Actual_Delivery_Date" TIMESTAMP(3),
    "Shipment_Status" "ShipmentStatus" NOT NULL,
    "Tracking_Number" TEXT,
    "Logistics_Company" TEXT,
    "Shipping_Cost" DECIMAL(10,2),
    "Shipping_Notes" TEXT,

    CONSTRAINT "Shipments_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Subscription_Types" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT,
    "Base_Price" DECIMAL(10,2) NOT NULL,
    "Frequency" "Frequency" NOT NULL,
    "Cash_Discount" DECIMAL(5,2),
    "Transfer_Discount" DECIMAL(5,2),
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Subscription_Types_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Transaction_History" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_User_Subscriptions" INTEGER NOT NULL,
    "ID_Gateway_Transaction" TEXT,
    "ID_Club" INTEGER,
    "ID_Payment_Methods" INTEGER,
    "Total_Amount_Paid" DECIMAL(10,2) NOT NULL,
    "Club_Amount" DECIMAL(10,2) NOT NULL,
    "Commission_Amount" DECIMAL(10,2) NOT NULL,
    "Payment_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Payment_Status" "PaymentStatus" NOT NULL,
    "Payment_Notes" TEXT,

    CONSTRAINT "Transaction_History_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "User" (
    "ID" SERIAL NOT NULL,
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password_Hash" TEXT NOT NULL,
    "Document_Type" "DocumentType" NOT NULL,
    "Document_Number" INTEGER NOT NULL,
    "Phone_Number" TEXT,
    "Registration_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Balance_Available" DECIMAL(10,2),
    "Street_Address" TEXT,
    "Address_Number" INTEGER,
    "Floor_Number" TEXT,
    "Address_Details" TEXT,
    "City" TEXT,
    "Province" TEXT,
    "Postal_Code" TEXT,
    "Active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "User_Club_Preferences" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Subscription_Types" INTEGER NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Preference_Type" TEXT NOT NULL,
    "Preference_Value" TEXT NOT NULL,
    "Update_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Club_Preferences_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "User_Subscriptions" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Payment_Methods" INTEGER,
    "ID_Subscription_Types" INTEGER NOT NULL,
    "Start_Date" TIMESTAMP(3) NOT NULL,
    "Expected_End_Date" TIMESTAMP(3),
    "Subscription_Status" "SubscriptionStatus" NOT NULL,
    "Last_Payment_Date" TIMESTAMP(3),
    "Next_Payment_Date" TIMESTAMP(3),
    "Monthly_Amount_Paid" DECIMAL(10,2),
    "Cancellation_Reason" TEXT,
    "Cancellation_Date" TIMESTAMP(3),

    CONSTRAINT "User_Subscriptions_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admins_Email_key" ON "Admins"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_Document_Number_key" ON "Admins"("Document_Number");

-- CreateIndex
CREATE UNIQUE INDEX "Club_Social_Networks_Profile_URL_key" ON "Club_Social_Networks"("Profile_URL");

-- CreateIndex
CREATE UNIQUE INDEX "Entrepreneurs_Email_key" ON "Entrepreneurs"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Entrepreneurs_Document_Number_key" ON "Entrepreneurs"("Document_Number");

-- CreateIndex
CREATE UNIQUE INDEX "Entrepreneurs_CUIT_CUIL_key" ON "Entrepreneurs"("CUIT_CUIL");

-- CreateIndex
CREATE UNIQUE INDEX "License_Types_Name_key" ON "License_Types"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_Methods_Method_key" ON "Payment_Methods"("Method");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_Code_key" ON "Permissions"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "Role_Code_key" ON "Role"("Code");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "User_Document_Number_key" ON "User"("Document_Number");
