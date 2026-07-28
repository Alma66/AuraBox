-- CreateEnum
CREATE TYPE "NewsletterStatus" AS ENUM ('Enviando', 'Completado', 'Con_Errores');

-- CreateTable
CREATE TABLE "Newsletter_Send" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "ID_Entrepreneur" INTEGER NOT NULL,
    "Subject" TEXT NOT NULL,
    "Content" TEXT NOT NULL,
    "Recipient_Count" INTEGER NOT NULL,
    "Sent_Count" INTEGER NOT NULL DEFAULT 0,
    "Failed_Count" INTEGER NOT NULL DEFAULT 0,
    "Status" "NewsletterStatus" NOT NULL DEFAULT 'Enviando',
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Completed_At" TIMESTAMP(3),

    CONSTRAINT "Newsletter_Send_pkey" PRIMARY KEY ("ID")
);
