import * as hotelRepository from '../repositories/hotelRepository.js';

export const getHotels = async () => {
  return await hotelRepository.findAllHotels();
};

export const getHotelDetails = async (id) => {
  const hotel = await hotelRepository.findHotelById(id);
  if (!hotel) {
    throw new Error('Hotel tidak ditemukan');
  }
  return hotel;
};

export const getRoomDetails = async (id) => {
  const room = await hotelRepository.findRoomById(id);
  if (!room) {
    throw new Error('Kamar tidak ditemukan');
  }
  return room;
};
