import prisma from './config/prisma.js';

async function main() {
  try {
    const vehicles = await prisma.vehicle.findMany();
    console.log("VEHICLES IN DATABASE:", vehicles.length);

    const stocks = await prisma.hotelVehicleStock.findMany({ include: { hotel: true, vehicle: true } });
    console.log("VEHICLE STOCKS:", stocks.slice(0, 5).map(s => ({ hotel: s.hotel.name, vehicle: s.vehicle.brand, stock: s.stock })));

    const shuttles = await prisma.shuttleService.findMany({ include: { hotel: true } });
    console.log("SHUTTLE SERVICES:", shuttles.slice(0, 5).map(s => ({ hotel: s.hotel.name, type: s.type, price: s.price })));

    const guides = await prisma.tourGuide.findMany({ include: { hotel: true } });
    console.log("TOUR GUIDES:", guides.slice(0, 5).map(g => ({ hotel: g.hotel?.name, name: g.name, price: g.pricePerHour })));

    const hotels = await prisma.hotel.findMany();
    console.log("HOTELS IN DATABASE:", hotels.map(h => ({ id: h.id, name: h.name })));
  } catch (error) {
    console.error("ERROR QUERYING DATABASE:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

