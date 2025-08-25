import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';
const prisma = new PrismaClient();

// Two sample venues (simple square-ish polygons)
const venues = [
  {
    name: 'Wild Creek Raceway',
    type: 'DragStrip',
    city: 'Cedar Hill',
    region: 'TX',
    polygonJson: {
      type: 'Polygon',
      coordinates: [[
        [-96.9560, 32.5600],
        [-96.9560, 32.5640],
        [-96.9505, 32.5640],
        [-96.9505, 32.5600],
        [-96.9560, 32.5600],
      ]]
    },
    websiteUrl: 'https://example.com/wildcreek'
  },
  {
    name: 'Sunset Motorsports Park',
    type: 'Circuit',
    city: 'Austin',
    region: 'TX',
    polygonJson: {
      type: 'Polygon',
      coordinates: [[
        [-97.6800, 30.1300],
        [-97.6800, 30.1380],
        [-97.6700, 30.1380],
        [-97.6700, 30.1300],
        [-97.6800, 30.1300],
      ]]
    },
    websiteUrl: 'https://example.com/sunset'
  }
];

async function main() {
  // Create test users for development
  const testUsers = [
    {
      email: 'admin@gridghost.com',
      password: 'Admin123!',
      handle: 'admin',
      displayName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isPro: true
    },
    {
      email: 'pro@gridghost.com',
      password: 'Pro123!',
      handle: 'proracer',
      displayName: 'Pro Racer',
      firstName: 'Pro',
      lastName: 'Racer',
      role: 'USER',
      isPro: true
    },
    {
      email: 'user@gridghost.com',
      password: 'User123!',
      handle: 'freeuser',
      displayName: 'Free User',
      firstName: 'Free',
      lastName: 'User',
      role: 'USER',
      isPro: false
    }
  ];

  for (const userData of testUsers) {
    const passwordHash = await hash(userData.password);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash,
        handle: userData.handle,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role as any,
        isPro: userData.isPro,
        isActive: true
      }
    });
  }

  console.log('✅ Test users created:');
  console.log('- admin@gridghost.com / Admin123! (Admin & Pro)');
  console.log('- pro@gridghost.com / Pro123! (Pro User)');
  console.log('- user@gridghost.com / User123! (Free User)');

  for (const v of venues) {
    await prisma.venue.upsert({
      where: { name: v.name },
      update: {},
      create: v as any
    });
  }
  const event = await prisma.event.create({
    data: {
      name: 'Friday Test & Tune',
      type: 'DragStrip',
      startAt: new Date(Date.now() + 24*3600*1000),
      endAt: new Date(Date.now() + 26*3600*1000),
      status: 'Scheduled',
      venue: { connect: { name: 'Wild Creek Raceway' } }
    }
  });
  console.log('Seeded venues and event:', event.id);
}

main().finally(()=>prisma.$disconnect());
