import * as roomService from '../services/roomService.js';

export const getRoomsAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut, search, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Parameter checkIn (YYYY-MM-DD) dan checkOut (YYYY-MM-DD) wajib diisi'
      });
    }

    const availableRooms = await roomService.getAvailableRooms(checkIn, checkOut, search, guests);

    return res.status(200).json({
      success: true,
      data: availableRooms
    });
  } catch (error) {
    const isClientError = error.message.includes('wajib diisi') || 
                          error.message.includes('tidak valid') || 
                          error.message.includes('harus setelah') || 
                          error.message.includes('masa lampau');
    const statusCode = isClientError ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};
