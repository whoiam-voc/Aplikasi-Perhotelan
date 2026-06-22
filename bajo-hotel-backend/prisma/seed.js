import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.booking.deleteMany({});
  await prisma.roomImage.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.hotel.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      fullName: 'Budi Santoso',
      email: 'budi@gmail.com',
      passwordHash: adminPasswordHash,
      phone: '081234567890',
    },
  });
  console.log(`Created test user: ${testUser.email}`);

  console.log('Seeding hotels...');
  const hotelsData = [
    {
      name: 'Sylvia Beach Resort',
      description: 'Menawarkan liburan pantai pribadi yang menakjubkan di Labuan Bajo. Dikelilingi oleh perbukitan hijau dan pasir putih yang indah.',
      address: 'Jl. Pantai Waecicu, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.2,
      rooms: [
        {
          roomType: 'Deluxe Beachfront',
          pricePerNight: 1200000,
          capacity: 2,
          totalInventory: 10,
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719508461-905c673771fd']
        },
        {
          roomType: 'Superior Garden View',
          pricePerNight: 950000,
          capacity: 2,
          totalInventory: 15,
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427']
        }
      ]
    },
    {
      name: 'Labuan Bay Hotel',
      description: 'Hotel strategis di pusat kota Labuan Bajo dengan akses mudah ke pelabuhan penyeberangan komodo dan berbagai restoran lokal.',
      address: 'Jl. Soekarno Hatta, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.0,
      rooms: [
        {
          roomType: 'Standard Room',
          pricePerNight: 450000,
          capacity: 2,
          totalInventory: 20,
          images: ['https://images.unsplash.com/photo-1568495248636-6432b97bd949']
        },
        {
          roomType: 'Family Suite',
          pricePerNight: 900000,
          capacity: 4,
          totalInventory: 5,
          images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511']
        }
      ]
    },
    {
      name: 'Bajo Paradise Inn',
      description: 'Penginapan bergaya tropis dengan pemandangan sunset memukau langsung dari balkon kamar Anda.',
      address: 'Jl. Binongko, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.1,
      rooms: [
        {
          roomType: 'Standard Ocean View',
          pricePerNight: 550000,
          capacity: 2,
          totalInventory: 12,
          images: ['https://images.unsplash.com/photo-1611891487122-207579d67d98']
        }
      ]
    },
    {
      name: 'Harbor View Hotel',
      description: 'Terletak tepat di depan pelabuhan utama Labuan Bajo, menyuguhkan pemandangan kapal pinisi yang bersandar dengan latar belakang bukit batu.',
      address: 'Jl. Pelabuhan KPP, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.3,
      rooms: [
        {
          roomType: 'Superior Room',
          pricePerNight: 700000,
          capacity: 2,
          totalInventory: 10,
          images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39']
        },
        {
          roomType: 'Harbor View Suite',
          pricePerNight: 1250000,
          capacity: 2,
          totalInventory: 6,
          images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6']
        }
      ]
    },
    {
      name: 'Meruorah Komodo Labuan Bajo',
      description: 'Resor bintang 5 mewah yang menjadi lokasi utama KTT ASEAN. Desain megah dengan infinity pool menghadap ke pelabuhan marina.',
      address: 'Kawasan Marina Labuan Bajo, Jalan Soekarno Hatta, Labuan Bajo, Nusa Tenggara Timur',
      rating: 4.8,
      rooms: [
        {
          roomType: 'The Signature Hill View',
          pricePerNight: 2400000,
          capacity: 2,
          totalInventory: 30,
          images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39']
        },
        {
          roomType: 'The Signature Ocean View',
          pricePerNight: 3100000,
          capacity: 2,
          totalInventory: 20,
          images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd']
        },
        {
          roomType: 'Meruorah Presidential Suite',
          pricePerNight: 9500000,
          capacity: 4,
          totalInventory: 2,
          images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511']
        }
      ]
    },
    {
      name: 'AYANA Komodo Waecicu Beach',
      description: 'Resor bintang 5 pertama di Pantai Waecicu, Labuan Bajo. Memiliki dermaga pribadi yang menjorok sepanjang 250 meter ke laut lepas.',
      address: 'Pantai Waecicu, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.9,
      rooms: [
        {
          roomType: 'Full Ocean View Room',
          pricePerNight: 4200000,
          capacity: 2,
          totalInventory: 25,
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945']
        },
        {
          roomType: 'Full Ocean View Suite',
          pricePerNight: 7500000,
          capacity: 2,
          totalInventory: 10,
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427']
        }
      ]
    },
    {
      name: "TA'AKTANA, a Luxury Collection Resort & Spa",
      description: 'Resor ultra-mewah dari Marriott International dengan konsep overwater villa terinspirasi dari jaring laba-laba sawah adat Manggarai.',
      address: 'Pantai Wae Cicu, Labuan Bajo, Nusa Tenggara Timur',
      rating: 5.0,
      rooms: [
        {
          roomType: 'Overwater Villa',
          pricePerNight: 1200000,
          capacity: 2,
          totalInventory: 8,
          images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000']
        },
        {
          roomType: 'Sea View Suite',
          pricePerNight: 8500000,
          capacity: 2,
          totalInventory: 12,
          images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6']
        }
      ]
    },
    {
      name: 'Plataran Komodo Resort & Spa',
      description: 'Resor butik mewah yang menggabungkan arsitektur tradisional Jawa (Joglo) dengan alam tropis terpencil di teluk Waecicu.',
      address: 'Pantai Waecicu, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.8,
      rooms: [
        {
          roomType: 'Deluxe Beachfront Villa',
          pricePerNight: 5500000,
          capacity: 2,
          totalInventory: 6,
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4']
        },
        {
          roomType: 'Grand Pool Villa',
          pricePerNight: 8000000,
          capacity: 4,
          totalInventory: 4,
          images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6']
        }
      ]
    },
    {
      name: 'Crowne Plaza Labuan Bajo',
      description: 'Hotel modern bintang 5 dengan fasilitas bisnis dan liburan yang lengkap, sangat cocok bagi para pelancong bisnis dan keluarga.',
      address: 'Jl. Pantai Pede, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.6,
      rooms: [
        {
          roomType: 'Deluxe King Room',
          pricePerNight: 1950000,
          capacity: 2,
          totalInventory: 40,
          images: ['https://images.unsplash.com/photo-1611891487122-207579d67d98']
        },
        {
          roomType: 'Executive Club Ocean',
          pricePerNight: 2800000,
          capacity: 2,
          totalInventory: 15,
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427']
        }
      ]
    },
    {
      name: 'Loccal Collection Hotel',
      description: 'Dikenal sebagai "Santorini-nya Indonesia" dengan arsitektur tebing bertingkat berwarna putih dan biru yang menghadap ke laut.',
      address: 'Jl. Raya Binongko, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.5,
      rooms: [
        {
          roomType: 'Standard Loka',
          pricePerNight: 1300000,
          capacity: 2,
          totalInventory: 18,
          images: ['https://images.unsplash.com/photo-1608198399988-341f712c3711']
        },
        {
          roomType: 'Suite Hempa',
          pricePerNight: 2600000,
          capacity: 2,
          totalInventory: 8,
          images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6']
        },
        {
          roomType: 'Villa Cassa Private Pool',
          pricePerNight: 6500000,
          capacity: 4,
          totalInventory: 3,
          images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6']
        }
      ]
    },
    {
      name: 'The Jayakarta Suites Komodo Flores',
      description: 'Resor bintang 4 yang tenang, terletak di Pantai Pede dengan pepohonan kelapa yang rindang dan kolam renang yang luas.',
      address: 'Jl. Pantai Pede, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.3,
      rooms: [
        {
          roomType: 'Deluxe Room Garden View',
          pricePerNight: 850000,
          capacity: 2,
          totalInventory: 24,
          images: ['https://images.unsplash.com/photo-1568495248636-6432b97bd949']
        },
        {
          roomType: 'Jayakarta Suite',
          pricePerNight: 1800000,
          capacity: 3,
          totalInventory: 8,
          images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511']
        }
      ]
    },
    {
      name: 'Bintang Flores Hotel',
      description: 'Resor pantai bintang 4 populer yang menawarkan akses langsung ke pantai berpasir dan kolam renang anak yang menyenangkan.',
      address: 'Jl. Pantai Pede, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.2,
      rooms: [
        {
          roomType: 'Deluxe Room',
          pricePerNight: 800000,
          capacity: 2,
          totalInventory: 35,
          images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39']
        },
        {
          roomType: 'Family Room',
          pricePerNight: 1400000,
          capacity: 4,
          totalInventory: 10,
          images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511']
        }
      ]
    },
    {
      name: 'Sudamala Resort, Seraya',
      description: 'Terletak di Pulau Seraya Kecil yang terpencil, menawarkan pantai pasir putih pribadi dengan perairan kristal untuk snorkeling terbaik.',
      address: 'Pulau Seraya Kecil, Labuan Bajo, Nusa Tenggara Timur',
      rating: 4.8,
      rooms: [
        {
          roomType: 'Beachfront Bungalow',
          pricePerNight: 4800000,
          capacity: 2,
          totalInventory: 12,
          images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000']
        },
        {
          roomType: 'Two Bedroom Pool Villa',
          pricePerNight: 8500000,
          capacity: 4,
          totalInventory: 3,
          images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6']
        }
      ]
    },
    {
      name: 'Zasgo Hotel',
      description: 'Hotel modern dengan budget terjangkau di Labuan Bajo. Menyediakan penginapan bersih, nyaman, dan ramah di kantong.',
      address: 'Jl. Trans Flores, Labuan Bajo, Kabupaten Manggarai Barat, Nusa Tenggara Timur',
      rating: 4.0,
      rooms: [
        {
          roomType: 'Superior King',
          pricePerNight: 500000,
          capacity: 2,
          totalInventory: 16,
          images: ['https://images.unsplash.com/photo-1568495248636-6432b97bd949']
        },
        {
          roomType: 'Deluxe Twin',
          pricePerNight: 600000,
          capacity: 2,
          totalInventory: 12,
          images: ['https://images.unsplash.com/photo-1611891487122-207579d67d98']
        }
      ]
    },
    {
      name: 'Komodo Resort',
      description: 'Resor eksklusif di Pulau Sebayur Besar, dekat dengan Taman Nasional Komodo. Surga bagi para penyelam dan pecinta alam bawah laut.',
      address: 'Pulau Sebayur Besar, Labuan Bajo, Nusa Tenggara Timur',
      rating: 4.7,
      rooms: [
        {
          roomType: 'Beach Bungalow',
          pricePerNight: 3900000,
          capacity: 2,
          totalInventory: 14,
          images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000']
        },
        {
          roomType: 'Deluxe Ocean Bungalow',
          pricePerNight: 4900000,
          capacity: 2,
          totalInventory: 8,
          images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4']
        }
      ]
    }
  ];

  for (const hotelData of hotelsData) {
    const { rooms, ...hotelFields } = hotelData;
    const hotel = await prisma.hotel.create({
      data: hotelFields,
    });
    console.log(`Created hotel: ${hotel.name}`);

    for (const roomData of rooms) {
      const { images, ...roomFields } = roomData;
      const room = await prisma.room.create({
        data: {
          ...roomFields,
          hotelId: hotel.id,
        },
      });
      console.log(`  Created room type: ${room.roomType}`);

      for (const imageUrl of images) {
        await prisma.roomImage.create({
          data: {
            roomId: room.id,
            imageUrl,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
