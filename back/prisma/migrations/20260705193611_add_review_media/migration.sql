-- CreateTable
CREATE TABLE "Review_Media" (
    "ID" SERIAL NOT NULL,
    "ID_Review" INTEGER NOT NULL,
    "Media_URL" TEXT NOT NULL,
    "Media_Type" "ContentType" NOT NULL,
    "Order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Review_Media_pkey" PRIMARY KEY ("ID")
);

-- AddForeignKey
ALTER TABLE "Review_Media" ADD CONSTRAINT "Review_Media_ID_Review_fkey" FOREIGN KEY ("ID_Review") REFERENCES "Reviews"("ID") ON DELETE CASCADE ON UPDATE CASCADE;
