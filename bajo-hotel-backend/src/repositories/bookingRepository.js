import prisma from '../config/prisma.js';

export const createBooking = async (bookingData, tx = prisma) => {
  return await tx.booking.create({
    data: bookingData,
    include: {
      room: {
        include: {
          hotel: true
        }
      },
      shuttleService: true,
      vehicleBookings: {
        include: {
          vehicle: true
        }
      },
      tourBookings: {
        include: {
          tourGuide: true
        }
      }
    }
  });
};

export const findBookingsByUserId = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          hotel: true
        }
      },
      shuttleService: true,
      vehicleBookings: {
        include: {
          vehicle: true
        }
      },
      tourBookings: {
        include: {
          tourGuide: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const findBookingById = async (id) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          hotel: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true
        }
      },
      shuttleService: true,
      vehicleBookings: {
        include: {
          vehicle: true
        }
      },
      tourBookings: {
        include: {
          tourGuide: true
        }
      }
    }
  });
};

export const countOverlappingBookings = async (roomId, checkInDate, checkOutDate, tx = prisma) => {
  // Menghitung booking aktif (PAID atau PENDING) yang tumpang tindih
  // Overlap condition: eci < CO AND eco > CI
  return await tx.booking.count({
    where: {
      roomId,
      status: { in: ['PENDING', 'PAID'] },
      checkInDate: { lt: new Date(checkOutDate) },
      checkOutDate: { gt: new Date(checkInDate) }
    }
  });
};

export const updateBookingStatus = async (id, status) => {
  return await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      room: {
        include: {
          hotel: true
        }
      },
      shuttleService: true,
      vehicleBookings: {
        include: {
          vehicle: true
        }
      },
      tourBookings: {
        include: {
          tourGuide: true
        }
      }
    }
  });
};

