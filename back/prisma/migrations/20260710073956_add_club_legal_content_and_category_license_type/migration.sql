-- CreateTable
CREATE TABLE "Club_Legal_Content" (
    "ID" SERIAL NOT NULL,
    "ID_Club" INTEGER NOT NULL,
    "Terms_And_Conditions" JSONB,
    "Privacy_And_Security_Policy" JSONB,
    "Updated_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_Legal_Content_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Category_License_Type" (
    "ID" SERIAL NOT NULL,
    "ID_Categories" INTEGER NOT NULL,
    "ID_License_Types" INTEGER NOT NULL,

    CONSTRAINT "Category_License_Type_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Club_Legal_Content_ID_Club_key" ON "Club_Legal_Content"("ID_Club");

-- CreateIndex
CREATE UNIQUE INDEX "Category_License_Type_ID_Categories_ID_License_Types_key" ON "Category_License_Type"("ID_Categories", "ID_License_Types");
