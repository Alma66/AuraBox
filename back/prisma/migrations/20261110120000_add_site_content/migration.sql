CREATE TABLE "Site_Content" (
    "ID" SERIAL NOT NULL,
    "Key" TEXT NOT NULL,
    "Value" TEXT NOT NULL,
    "Updated_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_By" INTEGER,

    CONSTRAINT "Site_Content_pkey" PRIMARY KEY ("ID")
);

CREATE UNIQUE INDEX "Site_Content_Key_key" ON "Site_Content"("Key");