/*
  Warnings:

  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Content";

-- CreateTable
CREATE TABLE "DiarySettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tone" TEXT,
    "textFormat" TEXT,
    "diaryFormat" TEXT,
    "topic" TEXT,
    "emotion" TEXT,
    "me" TEXT,
    "person" TEXT,

    CONSTRAINT "DiarySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiarySettings_userId_key" ON "DiarySettings"("userId");

-- AddForeignKey
ALTER TABLE "DiarySettings" ADD CONSTRAINT "DiarySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
