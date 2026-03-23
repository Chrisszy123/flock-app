import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── DIRECTORATES ────────────────────────────────────────────────────

  const worshipDirectorate = await prisma.directorate.upsert({
    where: { name: 'Worship Directorate' },
    update: {},
    create: {
      name: 'Worship Directorate',
      description: 'Oversees worship, music, and creative arts ministries',
    },
  });

  const operationsDirectorate = await prisma.directorate.upsert({
    where: { name: 'Operations Directorate' },
    update: {},
    create: {
      name: 'Operations Directorate',
      description: 'Manages media, ushering, protocol, and logistics',
    },
  });

  console.log('✅ Directorates created');

  // ─── UNITS ───────────────────────────────────────────────────────────

  const worshipUnit = await prisma.unit.upsert({
    where: { name_directorateId: { name: 'Worship Team', directorateId: worshipDirectorate.id } },
    update: {},
    create: {
      name: 'Worship Team',
      directorateId: worshipDirectorate.id,
    },
  });

  const choirUnit = await prisma.unit.upsert({
    where: { name_directorateId: { name: 'Choir', directorateId: worshipDirectorate.id } },
    update: {},
    create: {
      name: 'Choir',
      directorateId: worshipDirectorate.id,
    },
  });

  const mediaUnit = await prisma.unit.upsert({
    where: { name_directorateId: { name: 'Media Team', directorateId: operationsDirectorate.id } },
    update: {},
    create: {
      name: 'Media Team',
      directorateId: operationsDirectorate.id,
    },
  });

  console.log('✅ Units created');

  // ─── USERS ───────────────────────────────────────────────────────────

  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gic.church' },
    update: {},
    create: {
      email: 'admin@gic.church',
      passwordHash: adminPasswordHash,
      fullName: 'System Administrator',
      role: 'ADMIN',
      adminSubRole: 'LEAD_PASTOR',
      workerStatus: 'ACTIVE',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Directorate head
  const directoratePasswordHash = await bcrypt.hash('directorate123456', 12);
  const directorateHead = await prisma.user.upsert({
    where: { email: 'directorate@gic.church' },
    update: {},
    create: {
      email: 'directorate@gic.church',
      passwordHash: directoratePasswordHash,
      fullName: 'Sarah Directorate',
      role: 'DIRECTORATE',
      workerStatus: 'ACTIVE',
      directorateId: worshipDirectorate.id,
    },
  });
  console.log('✅ Directorate user created:', directorateHead.email);

  // Leader
  const leaderPasswordHash = await bcrypt.hash('leader123456', 12);
  const leader = await prisma.user.upsert({
    where: { email: 'leader@gic.church' },
    update: {},
    create: {
      email: 'leader@gic.church',
      passwordHash: leaderPasswordHash,
      fullName: 'John Leader',
      role: 'LEADER',
      workerStatus: 'ACTIVE',
      primaryServiceUnit: 'Worship Team',
      directorateId: worshipDirectorate.id,
      unitId: worshipUnit.id,
    },
  });
  console.log('✅ Leader user created:', leader.email);

  // Worker
  const workerPasswordHash = await bcrypt.hash('worker123456', 12);
  const worker = await prisma.user.upsert({
    where: { email: 'worker@gic.church' },
    update: {},
    create: {
      email: 'worker@gic.church',
      passwordHash: workerPasswordHash,
      fullName: 'Jane Worker',
      role: 'WORKER',
      workerStatus: 'ACTIVE',
      primaryServiceUnit: 'Media Team',
      directorateId: operationsDirectorate.id,
      unitId: mediaUnit.id,
    },
  });
  console.log('✅ Worker user created:', worker.email);

  // Member
  const memberPasswordHash = await bcrypt.hash('member123456', 12);
  const member = await prisma.user.upsert({
    where: { email: 'member@gic.church' },
    update: {},
    create: {
      email: 'member@gic.church',
      passwordHash: memberPasswordHash,
      fullName: 'Bob Member',
      role: 'MEMBER',
      workerStatus: 'NONE',
    },
  });
  console.log('✅ Member user created:', member.email);

  // ─── CHURCH LOCATION ─────────────────────────────────────────────────

  const defaultLocation = await prisma.churchLocation.upsert({
    where: { id: 'default-church-location' },
    update: {
      name: 'Gateway International Church',
      address: 'Port Harcourt, Nigeria, 500102',
      latitude: 4.891438,
      longitude: 6.916813,
      radiusMeters: 100,
      isDefault: true,
    },
    create: {
      id: 'default-church-location',
      name: 'Gateway International Church',
      address: 'Port Harcourt, Nigeria, 500102',
      latitude: 4.891438,
      longitude: 6.916813,
      radiusMeters: 100,
      isDefault: true,
    },
  });
  console.log('✅ Default church location created:', defaultLocation.name);

  // ─── TRAINING MODULES ────────────────────────────────────────────────

  const trainingModules = [
    {
      title: 'New Worker Orientation',
      description: 'Introduction to church culture, values, and expectations for new workers.',
      order: 1,
      isMandatory: true,
    },
    {
      title: 'Servant Leadership Fundamentals',
      description: 'Learn the biblical principles of servant leadership.',
      order: 2,
      isMandatory: true,
    },
    {
      title: 'Communication Skills',
      description: 'Effective communication in ministry contexts.',
      order: 3,
      isMandatory: false,
    },
    {
      title: 'Team Collaboration',
      description: 'Working effectively with other service units and teams.',
      order: 4,
      isMandatory: false,
    },
    {
      title: 'Conflict Resolution',
      description: 'Handling disagreements and challenges in ministry.',
      order: 5,
      isMandatory: true,
    },
  ];

  for (const module of trainingModules) {
    await prisma.trainingModule.upsert({
      where: { id: `module-${module.order}` },
      update: module,
      create: {
        id: `module-${module.order}`,
        ...module,
      },
    });
  }
  console.log('✅ Training modules created');

  // ─── SAMPLE EVENT ────────────────────────────────────────────────────

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const eventEndTime = new Date(tomorrow);
  eventEndTime.setHours(12, 0, 0, 0);

  await prisma.event.upsert({
    where: { id: 'sample-sunday-service' },
    update: {},
    create: {
      id: 'sample-sunday-service',
      title: 'Sunday Service',
      description: 'Weekly Sunday worship service',
      date: tomorrow,
      startTime: tomorrow,
      endTime: eventEndTime,
      locationName: 'Main Auditorium',
      latitude: 4.891438,
      longitude: 6.916813,
      radiusMeters: 100,
      createdById: admin.id,
    },
  });
  console.log('✅ Sample event created');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Test accounts:');
  console.log('   Admin:       admin@gic.church / admin123456');
  console.log('   Directorate: directorate@gic.church / directorate123456');
  console.log('   Leader:      leader@gic.church / leader123456');
  console.log('   Worker:      worker@gic.church / worker123456');
  console.log('   Member:      member@gic.church / member123456');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
