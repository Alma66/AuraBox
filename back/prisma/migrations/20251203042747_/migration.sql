
ALTER TABLE "Admins" DROP COLUMN "Document_Number",
ADD COLUMN     "Document_Number" INTEGER NOT NULL;

CREATE UNIQUE INDEX "Admins_Document_Number_key" ON "Admins"("Document_Number");
