# Implementation Plan: Stages 2, 3, & 4 Prisma Schema Updates

This plan details the addition of enums, models, and relations in [schema.prisma](file:///c:/bajo%20hotel%20backend/prisma/schema.prisma) to support vehicle rentals, shuttle services, tour guides, and emergency maintenance tickets.

## Proposed Schema Changes

We will modify [schema.prisma](file:///c:/bajo%20hotel%20backend/prisma/schema.prisma) to add enums, new models, and update the existing `Hotel` and `Booking` models.

### 1. Updated Models

#### [schema.prisma](file:///c:/bajo%20hotel%20backend/prisma/schema.prisma)

##### Model `Hotel`
* Add relation to `HotelVehicleStock` (`hotelVehicleStocks`)
* Add relation to `ShuttleService` (`shuttleServices`)

##### Model `Booking`
* Add optional `shuttleServiceId` and `shuttleService` relation
* Add relation to `VehicleBooking[]` (`vehicleBookings`)
* Add relation to `TourBooking[]` (`tourBookings`)
* Add relation to `EmergencyTicket[]` (`emergencyTickets`)

---

### 2. New Enums and Models

#### Enums
1. **`VehicleType`**: `MOTOR`, `MOBIL`
2. **`ShuttleType`**: `AIRPORT_PICKUP`, `HARBOR_DROP`
3. **`TicketStatus`**: `PENDING`, `ON_PROGRESS`, `RESOLVED`

#### Models
1. **`Vehicle`**: Stores vehicle templates (brand, type, flat daily price).
2. **`HotelVehicleStock`**: Manages unique stock levels of specific vehicles at each hotel.
3. **`VehicleBooking`**: Records rental reservations within a guest booking transaction.
4. **`ShuttleService`**: Manages dynamic prices for airport/harbor pickups per hotel.
5. **`TourGuide`**: Stores tour guides and their flat hourly rates.
6. **`TourBooking`**: Records tour reservations within a guest booking transaction.
7. **`EmergencyStaff`**: Stores maintenance crew details and availability.
8. **`EmergencyTicket`**: Records reported issues and assigned maintenance staff.

---

## Complete Proposed Code for [schema.prisma](file:///c:/bajo%20hotel%20backend/prisma/schema.prisma)

Here is the complete target file structure. We will overwrite the entire file to ensure all relations are fully mapped.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// EXISTING UPDATED MODELS
// ==========================================

model Hotel {
  id          String   @id @default(uuid())
  name        String
  description String   @db.Text
  address     String   @db.Text
  rating      Float
  latitude    Float?
  longitude   Float?
  facilities  String[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  rooms              Room[]
  hotelVehicleStocks HotelVehicleStock[]
  shuttleServices    ShuttleService[]

  @@map("hotels")
}

model Room {
  id             String   @id @default(uuid())
  hotelId        String   @map("hotel_id")
  roomType       String   @map("room_type")
  pricePerNight  Float    @map("price_per_night")
  capacity       Int
  totalInventory Int      @map("total_inventory")
  facilities     String[]
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  hotel    Hotel       @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  images   RoomImage[]
  bookings Booking[]

  @@map("rooms")
}

model RoomImage {
  id        String   @id @default(uuid())
  roomId    String   @map("room_id")
  imageUrl  String   @map("image_url") @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@map("room_images")
}

model User {
  id           String    @id @default(uuid())
  fullName     String    @map("full_name")
  email        String    @unique
  passwordHash String    @map("password_hash")
  phone        String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  // Relations
  bookings Booking[]

  @@map("users")
}

model Booking {
  id               String   @id @default(uuid())
  userId           String   @map("user_id")
  roomId           String   @map("room_id")
  shuttleServiceId String?  @map("shuttle_service_id")
  checkInDate      DateTime @map("check_in_date")
  checkOutDate     DateTime @map("check_out_date")
  totalPrice       Float    @map("total_price")
  status           String   @default("PENDING") // PENDING, PAID, CANCELLED
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relations
  user             User              @relation(fields: [userId], references: [id], onDelete: Restrict)
  room             Room              @relation(fields: [roomId], references: [id], onDelete: Restrict)
  shuttleService   ShuttleService?   @relation(fields: [shuttleServiceId], references: [id], onDelete: SetNull)
  vehicleBookings  VehicleBooking[]
  tourBookings     TourBooking[]
  emergencyTickets EmergencyTicket[]

  @@map("bookings")
}

// ==========================================
// TAHAP 2: RENTAL KENDARAAN & STOK PER HOTEL
// ==========================================

enum VehicleType {
  MOTOR
  MOBIL
}

model Vehicle {
  id          String   @id @default(uuid())
  brand       String
  type        VehicleType
  pricePerDay Decimal  @map("price_per_day") @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  stocks   HotelVehicleStock[]
  bookings VehicleBooking[]

  @@map("vehicles")
}

model HotelVehicleStock {
  id        String   @id @default(uuid())
  hotelId   String   @map("hotel_id")
  vehicleId String   @map("vehicle_id")
  stock     Int
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  hotel   Hotel   @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  vehicle Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@unique([hotelId, vehicleId])
  @@map("hotel_vehicle_stocks")
}

model VehicleBooking {
  id          String   @id @default(uuid())
  bookingId   String   @map("booking_id")
  vehicleId   String   @map("vehicle_id")
  totalDays   Int      @map("total_days")
  totalPrice  Decimal  @map("total_price") @db.Decimal(10, 2)
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  vehicle Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@map("vehicle_bookings")
}

// ==========================================
// TAHAP 3: SHUTTLE ANTAR-JEMPUT & TOUR GUIDE
// ==========================================

enum ShuttleType {
  AIRPORT_PICKUP
  HARBOR_DROP
}

model ShuttleService {
  id        String      @id @default(uuid())
  hotelId   String      @map("hotel_id")
  type      ShuttleType
  price     Decimal     @db.Decimal(10, 2)
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  // Relations
  hotel    Hotel     @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  bookings Booking[]

  @@map("shuttle_services")
}

model TourGuide {
  id           String   @id @default(uuid())
  name         String
  phone        String
  pricePerHour Decimal  @map("price_per_hour") @db.Decimal(10, 2)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  bookings TourBooking[]

  @@map("tour_guides")
}

model TourBooking {
  id           String   @id @default(uuid())
  bookingId    String   @map("booking_id")
  tourGuideId  String   @map("tour_guide_id")
  totalHours   Int      @map("total_hours")
  totalPrice   Decimal  @map("total_price") @db.Decimal(10, 2)
  note         String   @default("Exclude kapal & tip")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  booking   Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  tourGuide TourGuide @relation(fields: [tourGuideId], references: [id], onDelete: Cascade)

  @@map("tour_bookings")
}

// ==========================================
// TAHAP 4: MANAJEMEN DARURAT HOTEL
// ==========================================

enum TicketStatus {
  PENDING
  ON_PROGRESS
  RESOLVED
}

model EmergencyStaff {
  id          String   @id @default(uuid())
  name        String
  role        String
  phone       String
  isAvailable Boolean  @default(true) @map("is_available")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  tickets EmergencyTicket[]

  @@map("emergency_staffs")
}

model EmergencyTicket {
  id        String       @id @default(uuid())
  bookingId String       @map("booking_id")
  staffId   String?      @map("staff_id")
  issue     String
  status    TicketStatus @default(PENDING)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  // Relations
  booking Booking         @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  staff   EmergencyStaff? @relation(fields: [staffId], references: [id], onDelete: SetNull)

  @@map("emergency_tickets")
}
```

---

## Verification Plan

1. Overwrite [schema.prisma](file:///c:/bajo%20hotel%20backend/prisma/schema.prisma) with the proposed schema.
2. Run `npx prisma validate` to check for compile-time syntax errors or missing relation indices.
3. Run `npx prisma migrate dev --name init_stages_2_3_4` to apply the database changes to PostgreSQL.
4. Verify the database tables are created in DBeaver.
