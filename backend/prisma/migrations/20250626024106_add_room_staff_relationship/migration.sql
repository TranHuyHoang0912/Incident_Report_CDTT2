-- CreateTable
CREATE TABLE "RoomStaff" (
    "roomId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RoomStaff_pkey" PRIMARY KEY ("roomId","userId")
);

-- AddForeignKey
ALTER TABLE "RoomStaff" ADD CONSTRAINT "RoomStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomStaff" ADD CONSTRAINT "RoomStaff_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("roomId") ON DELETE RESTRICT ON UPDATE CASCADE;
