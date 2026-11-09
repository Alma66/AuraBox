CREATE TYPE "InboundRequestType" AS ENUM ('Consulta', 'Trabajo');

CREATE TYPE "InboundRequestStatus" AS ENUM ('Nuevo', 'En_Revision', 'Respondido', 'Archivado');

CREATE TABLE "Inbound_Request" (
    "ID" SERIAL NOT NULL,
    "Type" "InboundRequestType" NOT NULL,
    "Status" "InboundRequestStatus" NOT NULL DEFAULT 'Nuevo',
    "Full_Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Phone" TEXT,
    "Subject" TEXT,
    "Area" TEXT,
    "Profile_URL" TEXT,
    "Message" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Handled_At" TIMESTAMP(3),

    CONSTRAINT "Inbound_Request_pkey" PRIMARY KEY ("ID")
);

CREATE INDEX "Inbound_Request_Type_Status_Created_At_idx" ON "Inbound_Request"("Type", "Status", "Created_At");