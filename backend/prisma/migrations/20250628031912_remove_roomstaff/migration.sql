/*
  Warnings:

  - You are about to drop the `RoomStaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RoomStaff" DROP CONSTRAINT "RoomStaff_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomStaff" DROP CONSTRAINT "RoomStaff_userId_fkey";

-- DropTable
DROP TABLE "RoomStaff";
