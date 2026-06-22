import prisma from '../config/prisma.js';

// Get all vehicles templates
export const getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { brand: 'asc' }
    });
    return res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengambil data kendaraan'
    });
  }
};

// Get all tour guides
export const getTourGuides = async (req, res) => {
  try {
    const tourGuides = await prisma.tourGuide.findMany({
      include: {
        hotel: true
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({
      success: true,
      data: tourGuides
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengambil data pemandu wisata'
    });
  }
};

// Get all shuttle services
export const getShuttleServices = async (req, res) => {
  try {
    const shuttleServices = await prisma.shuttleService.findMany({
      include: {
        hotel: true
      },
      orderBy: { price: 'asc' }
    });
    return res.status(200).json({
      success: true,
      data: shuttleServices
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat mengambil data antar-jemput'
    });
  }
};

// Book a vehicle for an existing booking
export const bookVehicle = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { vehicleId, totalDays, startDate, endDate } = req.body;

    if (!vehicleId || !totalDays || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Data sewa kendaraan (vehicleId, totalDays, startDate, endDate) wajib diisi'
      });
    }

    // Verify booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Pemesanan kamar hotel tidak ditemukan'
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki otorisasi untuk memodifikasi pemesanan ini'
      });
    }

    // Fetch vehicle price
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    const itemPrice = Number(vehicle.pricePerDay) * parseInt(totalDays);

    // Save and update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const vBooking = await tx.vehicleBooking.create({
        data: {
          bookingId,
          vehicleId,
          totalDays: parseInt(totalDays),
          totalPrice: itemPrice,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        include: {
          vehicle: true
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          totalPrice: booking.totalPrice + itemPrice
        }
      });

      return vBooking;
    });

    return res.status(201).json({
      success: true,
      message: 'Sewa kendaraan berhasil ditambahkan ke pemesanan',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat memesan kendaraan'
    });
  }
};

// Book a tour guide for an existing booking
export const bookTourGuide = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { tourGuideId, totalHours, note } = req.body;

    if (!tourGuideId || !totalHours) {
      return res.status(400).json({
        success: false,
        message: 'Data tour guide (tourGuideId, totalHours) wajib diisi'
      });
    }

    // Verify booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Pemesanan kamar hotel tidak ditemukan'
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki otorisasi untuk memodifikasi pemesanan ini'
      });
    }

    // Fetch guide details
    const tourGuide = await prisma.tourGuide.findUnique({
      where: { id: tourGuideId }
    });

    if (!tourGuide) {
      return res.status(404).json({
        success: false,
        message: 'Pemandu wisata tidak ditemukan'
      });
    }

    const itemPrice = Number(tourGuide.pricePerHour) * parseInt(totalHours);

    // Save and update in transaction
    const result = await prisma.$transaction(async (tx) => {
      const tBooking = await tx.tourBooking.create({
        data: {
          bookingId,
          tourGuideId,
          totalHours: parseInt(totalHours),
          totalPrice: itemPrice,
          note: note || 'Exclude kapal & tip'
        },
        include: {
          tourGuide: true
        }
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          totalPrice: booking.totalPrice + itemPrice
        }
      });

      return tBooking;
    });

    return res.status(201).json({
      success: true,
      message: 'Pemandu wisata berhasil ditambahkan ke pemesanan',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat memesan pemandu wisata'
    });
  }
};

// Book airport pick-up / shuttle for an existing booking
export const bookShuttle = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { shuttleServiceId } = req.body;

    if (!shuttleServiceId) {
      return res.status(400).json({
        success: false,
        message: 'ID layanan antar-jemput (shuttleServiceId) wajib diisi'
      });
    }

    // Verify booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Pemesanan kamar hotel tidak ditemukan'
      });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki otorisasi untuk memodifikasi pemesanan ini'
      });
    }

    // Fetch shuttle price
    const shuttle = await prisma.shuttleService.findUnique({
      where: { id: shuttleServiceId }
    });

    if (!shuttle) {
      return res.status(404).json({
        success: false,
        message: 'Layanan antar-jemput tidak ditemukan'
      });
    }

    const itemPrice = Number(shuttle.price);

    // Save and update in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          shuttleServiceId,
          totalPrice: booking.totalPrice + itemPrice
        },
        include: {
          shuttleService: true
        }
      });
      return updated;
    });

    return res.status(200).json({
      success: true,
      message: 'Penjemputan bandara berhasil ditambahkan ke pemesanan',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan saat memesan antar-jemput'
    });
  }
};
