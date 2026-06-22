/*
  Warnings:

  - Added the required column `hotel_id` to the `emergency_staffs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hotel_id` to the `tour_guides` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emergency_staffs" ADD COLUMN     "hotel_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tour_guides" ADD COLUMN     "hotel_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tour_guides" ADD CONSTRAINT "tour_guides_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_staffs" ADD CONSTRAINT "emergency_staffs_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
