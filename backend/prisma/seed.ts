import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old data...');
  await prisma.message.deleteMany();
  await prisma.chatMember.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.review.deleteMany();
  await prisma.exchangeRequest.deleteMany();
  await prisma.userSkillWanted.deleteMany();
  await prisma.userSkillOffered.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding skills...');
  const react = await prisma.skill.create({ data: { name: 'React', category: 'Development', icon: 'Atom' } });
  const node = await prisma.skill.create({ data: { name: 'Node.js', category: 'Development', icon: 'Server' } });
  const ui = await prisma.skill.create({ data: { name: 'UI/UX Design', category: 'Design', icon: 'PenTool' } });
  const guitar = await prisma.skill.create({ data: { name: 'Guitar', category: 'Music', icon: 'Music' } });

  console.log('Seeding dummy users...');
  
  const dummyUsersData = [
    {
      clerkId: 'user_dummy1',
      name: 'Alex Rivera',
      bio: 'Fullstack developer passionate about building scalable apps. Lover of music.',
      location: 'San Francisco, CA',
      availability: 'ONLINE' as const,
      rating: 4.8,
    },
    {
      clerkId: 'user_dummy2',
      name: 'Sophia Chen',
      bio: 'Product Designer bridging the gap between aesthetics and functionality.',
      location: 'New York, NY',
      availability: 'BOTH' as const,
      rating: 4.9,
    },
    {
      clerkId: 'user_dummy3',
      name: 'Marcus Johnson',
      bio: 'Musician and audio engineer. Always ready to jam.',
      location: 'Austin, TX',
      availability: 'OFFLINE' as const,
      rating: 4.7,
    }
  ];

  for (const data of dummyUsersData) {
    await prisma.user.create({ data });
  }

  const alex = await prisma.user.findUnique({ where: { clerkId: 'user_dummy1' }});
  const sophia = await prisma.user.findUnique({ where: { clerkId: 'user_dummy2' }});
  const marcus = await prisma.user.findUnique({ where: { clerkId: 'user_dummy3' }});

  console.log('Linking skills...');
  // Alex offers React, Node, wants UI and Guitar
  if (alex) {
    await prisma.userSkillOffered.create({ data: { userId: alex.id, skillId: react.id, yearsOfExperience: 5 }});
    await prisma.userSkillOffered.create({ data: { userId: alex.id, skillId: node.id, yearsOfExperience: 4 }});
    await prisma.userSkillWanted.create({ data: { userId: alex.id, skillId: ui.id }});
    await prisma.userSkillWanted.create({ data: { userId: alex.id, skillId: guitar.id }});
  }

  if (sophia) {
    await prisma.userSkillOffered.create({ data: { userId: sophia.id, skillId: ui.id, yearsOfExperience: 6 }});
    await prisma.userSkillWanted.create({ data: { userId: sophia.id, skillId: react.id }});
  }

  if (marcus) {
    await prisma.userSkillOffered.create({ data: { userId: marcus.id, skillId: guitar.id, yearsOfExperience: 10 }});
    await prisma.userSkillWanted.create({ data: { userId: marcus.id, skillId: node.id }});
  }

  console.log('Database seeded perfectly!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
