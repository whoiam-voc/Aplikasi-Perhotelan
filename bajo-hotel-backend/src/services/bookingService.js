import prisma from '../config/prisma.js';
import * as bookingRepository from '../repositories/bookingRepository.js';

export const createBooking = async (userId, roomId, checkInStr, checkOutStr) => {
  const checkInDate = new Date(checkInStr);
  const checkOutDate = new Date(checkOutStr);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Format tanggal check-in atau check-out tidak valid');
  }

  // Set time to midday (12:00) to avoid timezone discrepancies
  checkInDate.setUTCHours(14, 0, 0, 0); // standard check-in time 14:00 UTC
  checkOutDate.setUTCHours(12, 0, 0, 0); // standard check-out time 12:00 UTC

  if (checkInDate >= checkOutDate) {
    throw new Error('Tanggal check-out harus setelah tanggal check-in');
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkInDate < today) {
    throw new Error('Tanggal check-in tidak boleh di masa lampau');
  }

  // Interactive transaction for strict anti-double booking concurrency check
  return await prisma.$transaction(async (tx) => {
    // 1. Lock the room row to prevent race conditions during concurrent availability checks
    // We use a raw select query with FOR UPDATE lock on the rooms table.
    // In schema.prisma, Room model has @@map("rooms")
    const rooms = await tx.$queryRaw`
      SELECT id, "price_per_night" AS price_per_night, "total_inventory" AS total_inventory 
      FROM "rooms" 
      WHERE id = ${roomId} 
      FOR UPDATE
    `;

    if (!rooms || rooms.length === 0) {
      throw new Error('Kamar tidak ditemukan');
    }

    const room = rooms[0];

    // 2. Count current active bookings (PENDING or PAID) overlapping the target dates
    const activeBookingsCount = await bookingRepository.countOverlappingBookings(
      roomId,
      checkInDate,
      checkOutDate,
      tx
    );

    // 3. Check availability
    const availableInventory = room.total_inventory - activeBookingsCount;
    if (availableInventory <= 0) {
      throw new Error('Kamar penuh pada tanggal tersebut');
    }

    // 4. Calculate total price (number of nights * price_per_night)
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / oneDayInMs);
    const totalPrice = room.price_per_night * diffDays;

    // 5. Save the booking
    const booking = await bookingRepository.createBooking({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      totalPrice,
      status: 'PENDING'
    }, tx);

    return booking;
  });
};

export const getUserBookings = async (userId) => {
  return await bookingRepository.findBookingsByUserId(userId);
};

export const getBookingDetails = async (id, userId) => {
  const booking = await bookingRepository.findBookingById(id);
  if (!booking) {
    throw new Error('Booking tidak ditemukan');
  }
  
  if (booking.userId !== userId) {
    throw new Error('Anda tidak memiliki otorisasi untuk melihat booking ini');
  }
  
  return booking;
};

export const updateStatus = async (id, status) => {
  if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
    throw new Error('Status tidak valid');
  }
  return await bookingRepository.updateBookingStatus(id, status);
};
