import * as bookingService from '../services/bookingService.js';

export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Kamar (roomId), tanggal check-in, dan check-out wajib diisi'
      });
    }

    const booking = await bookingService.createBooking(userId, roomId, checkInDate, checkOutDate);
    
    return res.status(201).json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: booking
    });
  } catch (error) {
    let statusCode = 500;
    if (
      error.message === 'Kamar penuh pada tanggal tersebut' ||
      error.message.includes('tidak boleh di masa lampau') ||
      error.message.includes('harus setelah tanggal check-in') ||
      error.message.includes('Format tanggal')
    ) {
      statusCode = 400;
    } else if (error.message === 'Kamar tidak ditemukan') {
      statusCode = 404;
    }

    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getUserBookings(userId);
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await bookingService.getBookingDetails(id, userId);
    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === 'Booking tidak ditemukan') {
      statusCode = 404;
    } else if (error.message.includes('tidak memiliki otorisasi')) {
      statusCode = 403;
    }
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status booking wajib dikirimkan'
      });
    }

    const updatedBooking = await bookingService.updateStatus(id, status);
    
    return res.status(200).json({
      success: true,
      message: `Status booking berhasil diubah menjadi ${status}`,
      data: updatedBooking
    });
  } catch (error) {
    const statusCode = error.message === 'Status tidak valid' ? 400 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server'
    });
  }
};
