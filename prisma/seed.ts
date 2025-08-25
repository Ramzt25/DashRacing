import { PrismaClient } from '@prisma/client';
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
