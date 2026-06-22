-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTOR', 'MOBIL');

-- CreateEnum
CREATE TYPE "ShuttleType" AS ENUM ('AIRPORT_PICKUP', 'HARBOR_DROP');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'ON_PROGRESS', 'RESOLVED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "shuttle_service_id" TEXT;

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "price_per_day" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_vehicle_stocks" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_vehicle_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_bookings" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "total_days" INTEGER NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shuttle_services" (
    "id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "type" "ShuttleType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shuttle_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_guides" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "price_per_hour" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_bookings" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "tour_guide_id" TEXT NOT NULL,
    "total_hours" INTEGER NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "note" TEXT NOT NULL DEFAULT 'Exclude kapal & tip',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_staffs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_tickets" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "issue" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_vehicle_stocks_hotel_id_vehicle_id_key" ON "hotel_vehicle_stocks"("hotel_id", "vehicle_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_shuttle_service_id_fkey" FOREIGN KEY ("shuttle_service_id") REFERENCES "shuttle_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_vehicle_stocks" ADD CONSTRAINT "hotel_vehicle_stocks_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_vehicle_stocks" ADD CONSTRAINT "hotel_vehicle_stocks_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shuttle_services" ADD CONSTRAINT "shuttle_services_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_bookings" ADD CONSTRAINT "tour_bookings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_bookings" ADD CONSTRAINT "tour_bookings_tour_guide_id_fkey" FOREIGN KEY ("tour_guide_id") REFERENCES "tour_guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_tickets" ADD CONSTRAINT "emergency_tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_tickets" ADD CONSTRAINT "emergency_tickets_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "emergency_staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
