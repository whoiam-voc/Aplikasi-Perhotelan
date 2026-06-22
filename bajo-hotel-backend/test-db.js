import 'dotenv/config';
import prisma from './src/config/prisma.js';

async function main() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        room: {
          include: {
            hotel: true
          }
        }
      }
    });

    console.log(`Total bookings found: ${bookings.length}`);
    const ids = bookings.map(b => b.id);
    const uniqueIds = new Set(ids);
    console.log(`Unique booking IDs count: ${uniqueIds.size}`);

    if (ids.length !== uniqueIds.size) {
      console.log("WARNING: There are duplicates!");
      const countMap = {};
      for (const id of ids) {
        countMap[id] = (countMap[id] || 0) + 1;
      }
      for (const id in countMap) {
        if (countMap[id] > 1) {
          console.log(`Booking ID ${id} appears ${countMap[id]} times!`);
        }
      }
    } else {
      console.log("No duplicate IDs in database table.");
    }

    console.log("Bookings list:");
    bookings.forEach((b, idx) => {
      console.log(`${idx + 1}. ID: ${b.id}, User ID: ${b.userId}, Status: ${b.status}, Hotel: ${b.room?.hotel?.name}`);
    });
  } catch (error) {
    console.error("Error connecting or querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
