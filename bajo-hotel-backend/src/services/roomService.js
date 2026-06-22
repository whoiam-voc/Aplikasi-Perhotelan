import prisma from '../config/prisma.js';

export const getAvailableRooms = async (checkInStr, checkOutStr, search, guests) => {
  if (!checkInStr || !checkOutStr) {
    throw new Error('Tanggal check-in dan check-out wajib diisi');
  }

  const checkInDate = new Date(checkInStr);
  const checkOutDate = new Date(checkOutStr);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    throw new Error('Format tanggal check-in atau check-out tidak valid');
  }

  // Standardize times to avoid timezone discrepancies
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

  // Apply database filtering for capacity and keyword search
  const capacityFilter = guests ? (parseInt(guests) >= 3 ? 2 : parseInt(guests)) : undefined;

  // 1. Fetch rooms including hotel and images with filters
  const rooms = await prisma.room.findMany({
    where: {
      ...(capacityFilter ? { capacity: { gte: capacityFilter } } : {}),
      ...(search ? {
        OR: [
          { roomType: { contains: search, mode: 'insensitive' } },
          { hotel: { name: { contains: search, mode: 'insensitive' } } },
          { hotel: { address: { contains: search, mode: 'insensitive' } } },
          { hotel: { description: { contains: search, mode: 'insensitive' } } },
        ]
      } : {})
    },
    include: {
      hotel: true,
      images: true
    }
  });

  // 2. Count active overlapping bookings per room using group by
  const overlappingBookings = await prisma.booking.groupBy({
    by: ['roomId'],
    where: {
      status: { in: ['PENDING', 'PAID'] },
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate }
    },
    _count: {
      id: true
    }
  });

  // Create a map for quick lookup: roomId -> count
  const bookingsMap = {};
  overlappingBookings.forEach((b) => {
    bookingsMap[b.roomId] = b._count.id;
  });

  // 3. Compute available inventory and filter rooms
  const availableRooms = rooms.map((room) => {
    const bookedCount = bookingsMap[room.id] || 0;
    const availableInventory = room.totalInventory - bookedCount;
    return {
      ...room,
      availableInventory: availableInventory >= 0 ? availableInventory : 0
    };
  }).filter((room) => room.availableInventory > 0);

  return availableRooms;
};
