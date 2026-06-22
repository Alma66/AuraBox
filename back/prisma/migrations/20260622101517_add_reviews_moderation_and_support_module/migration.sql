-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('Abierta', 'Cerrada');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('User', 'Entrepreneur', 'System');

-- CreateEnum
CREATE TYPE "AutoReplyTrigger" AS ENUM ('Primer_Mensaje', 'Contiene_Frase');

-- CreateEnum
CREATE TYPE "VerificationChannel" AS ENUM ('Email', 'SMS');

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN     "Hidden_Reason" TEXT,
ADD COLUMN     "ID_Subscription_Types" INTEGER,
ADD COLUMN     "Is_Hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Media_Type" "ContentType",
ADD COLUMN     "Media_URL" TEXT;

-- CreateTable
CREATE TABLE "Forbidden_Word" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Word" TEXT NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Forbidden_Word_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Support_Conversation" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "ID_Subscription_Types" INTEGER NOT NULL,
    "Subject" TEXT NOT NULL,
    "Status" "ConversationStatus" NOT NULL DEFAULT 'Abierta',
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Closed_At" TIMESTAMP(3),
    "Last_Message_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Has_Unread_For_Entrepreneur" BOOLEAN NOT NULL DEFAULT true,
    "Has_Unread_For_User" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Support_Conversation_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Support_Message" (
    "ID" SERIAL NOT NULL,
    "ID_Conversation" INTEGER NOT NULL,
    "Sender_Type" "SenderType" NOT NULL,
    "Sender_Id" INTEGER NOT NULL,
    "Content" TEXT,
    "Is_Auto_Reply" BOOLEAN NOT NULL DEFAULT false,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Support_Message_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Support_Message_Attachment" (
    "ID" SERIAL NOT NULL,
    "ID_Message" INTEGER NOT NULL,
    "File_URL" TEXT NOT NULL,
    "File_Type" "ContentType" NOT NULL,
    "File_Name" TEXT,

    CONSTRAINT "Support_Message_Attachment_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Auto_Reply_Rule" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Trigger_Type" "AutoReplyTrigger" NOT NULL,
    "Trigger_Value" TEXT,
    "Reply_Message" TEXT NOT NULL,
    "Active" BOOLEAN NOT NULL DEFAULT true,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auto_Reply_Rule_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Sensitive_Data_Verification" (
    "ID" SERIAL NOT NULL,
    "ID_Conversation" INTEGER NOT NULL,
    "Code" TEXT NOT NULL,
    "Channel" "VerificationChannel" NOT NULL,
    "Used" BOOLEAN NOT NULL DEFAULT false,
    "Expires_At" TIMESTAMP(3) NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Created_By" INTEGER,

    CONSTRAINT "Sensitive_Data_Verification_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Sensitive_Data_Access_Log" (
    "ID" SERIAL NOT NULL,
    "ID_Conversation" INTEGER NOT NULL,
    "ID_Entrepreneur" INTEGER NOT NULL,
    "Fields_Viewed" TEXT NOT NULL,
    "Viewed_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sensitive_Data_Access_Log_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Forbidden_Word_ID_Club_Word_key" ON "Forbidden_Word"("ID_Club", "Word");
