-- AlterTable
ALTER TABLE "hotels" ADD COLUMN     "facilities" TEXT[],
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "facilities" TEXT[];
