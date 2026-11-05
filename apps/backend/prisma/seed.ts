import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Organization
  const organization = await prisma.organizations.upsert({
    where: { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
      name: 'Transcendence Real Estate',
      status: 'active',
    },
  });

  // 2. Create User / Agent
  const agent = await prisma.users.upsert({
    where: { id: '987e6543-e21b-12d3-a456-426614174000' },
    update: {},
    create: {
      id: '987e6543-e21b-12d3-a456-426614174000',
      organization_id: organization.id,
      first_name: 'Mohammed',
      last_name: 'El Baddi',
      email: 'agent@transcendence.com',
      password_hash: '$2b$10$hashedpasswordexample',
      role: 'owner',
    },
  });

  // 3. Create Property
  const property = await prisma.properties.upsert({
    where: { id: '123e4567-e89b-12d3-a456-426614174000' },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      organization_id: organization.id,
      title: 'Modern Luxury Apartment',
      property_type: 'apartment',
      listing_type: 'sale',
      price: 250000.0,
      country: 'Morocco',
      city: 'Casablanca',
    },
  });

  // 4. Create Visitor / Contact
  const visitor = await prisma.visitors.upsert({
    where: { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
      organization_id: organization.id,
      name: 'Youssef Contact',
      email: 'youssef@example.com',
      phone: '+212600000000',
    },
  });

  // 5. Create Lead
  const lead = await prisma.leads.upsert({
    where: { id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' },
    update: {},
    create: {
      id: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
      organization_id: organization.id,
      visitor_id: visitor.id,
      property_id: property.id,
      status: 'new',
    },
  });

  // 6. Create Agent Availability Slots
  const slots = [
    {
      id: 'c1234567-e89b-12d3-a456-426614174001',
      startTime: new Date('2026-10-29T09:00:00.000Z'),
      endTime: new Date('2026-10-29T09:30:00.000Z'),
    },
    {
      id: 'c1234567-e89b-12d3-a456-426614174002',
      startTime: new Date('2026-10-29T10:00:00.000Z'),
      endTime: new Date('2026-10-29T10:30:00.000Z'),
    },
    {
      id: 'c1234567-e89b-12d3-a456-426614174003',
      startTime: new Date('2026-10-29T11:00:00.000Z'),
      endTime: new Date('2026-10-29T11:30:00.000Z'),
    },
  ];

  for (const slot of slots) {
    await prisma.agentAvailability.upsert({
      where: { id: slot.id },
      update: {},
      create: {
        id: slot.id,
        userId: agent.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });