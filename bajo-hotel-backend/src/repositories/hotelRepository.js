import prisma from '../config/prisma.js';

export const findAllHotels = async () => {
  return await prisma.hotel.findMany({
    orderBy: { rating: 'desc' }
  });
};

export const findHotelById = async (id) => {
  return await prisma.hotel.findUnique({
    where: { id },
    include: {
      rooms: {
        include: {
          images: true
        }
      }
    }
  });
};

export const findRoomById = async (id) => {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      hotel: true,
      images: true
    }
  });
};
