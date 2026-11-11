CREATE TABLE "Notification" (
    "ID" SERIAL NOT NULL,
    "ID_User" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "Message" TEXT NOT NULL,
    "Link" TEXT,
    "Dedupe_Key" TEXT,
    "Read_At" TIMESTAMP(3),
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("ID")
);

CREATE UNIQUE INDEX "Notification_Dedupe_Key_key" ON "Notification"("Dedupe_Key");

CREATE INDEX "Notification_ID_User_Read_At_idx" ON "Notification"("ID_User", "Read_At");