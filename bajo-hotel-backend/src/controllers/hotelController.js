import * as hotelService from '../services/hotelService.js';

export const getHotels = async (req, res) => {
  try {
    const hotels = await hotelService.getHotels();
    return res.status(200).json({
      success: true,
      data: hotels
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await hotelService.getHotelDetails(id);
    return res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    const statusCode = error.message === 'Hotel tidak ditemukan' ? 404 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
