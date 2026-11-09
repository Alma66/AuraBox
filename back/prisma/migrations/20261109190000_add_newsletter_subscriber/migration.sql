CREATE TABLE "Newsletter_Subscriber" (
    "ID" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Is_Active" BOOLEAN NOT NULL DEFAULT true,
    "Unsubscribe_Token" TEXT NOT NULL,
    "Created_At" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Unsubscribed_At" TIMESTAMP(3),

    CONSTRAINT "Newsletter_Subscriber_pkey" PRIMARY KEY ("ID")
);

CREATE UNIQUE INDEX "Newsletter_Subscriber_Email_key" ON "Newsletter_Subscriber"("Email");

CREATE UNIQUE INDEX "Newsletter_Subscriber_Unsubscribe_Token_key" ON "Newsletter_Subscriber"("Unsubscribe_Token");