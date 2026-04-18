import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Fetching/creating skills...');
  const react = await prisma.skill.upsert({ where: { name: 'React' }, update: {}, create: { name: 'React', category: 'Development', icon: 'Atom' } });
  const node = await prisma.skill.upsert({ where: { name: 'Node.js' }, update: {}, create: { name: 'Node.js', category: 'Development', icon: 'Server' } });
  const ui = await prisma.skill.upsert({ where: { name: 'UI/UX Design' }, update: {}, create: { name: 'UI/UX Design', category: 'Design', icon: 'PenTool' } });
  const guitar = await prisma.skill.upsert({ where: { name: 'Guitar' }, update: {}, create: { name: 'Guitar', category: 'Music', icon: 'Music' } });
  const figma = await prisma.skill.upsert({ where: { name: 'Figma' }, update: {}, create: { name: 'Figma', category: 'Design', icon: 'Figma' } });
  const python = await prisma.skill.upsert({ where: { name: 'Python' }, update: {}, create: { name: 'Python', category: 'Development', icon: 'Code' } });

  console.log('Seeding 6 dummy users...');
  
  const dummyUsersData = [
    {
      clerkId: 'user_demo_1',
      name: 'Emma Stone',
      bio: 'Creative frontend developer who loves bringing designs to life.',
      location: 'London, UK',
      availability: 'ONLINE' as const,
      rating: 4.8,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    {
      clerkId: 'user_demo_2',
      name: 'James Rodriguez',
      bio: 'Backend engineer transitioning into fullstack. Passionate about system design.',
      location: 'Berlin, DE',
      availability: 'BOTH' as const,
      rating: 4.9,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
    },
    {
      clerkId: 'user_demo_3',
      name: 'Linda Kim',
      bio: 'UX specialist aiming to learn more about frontend technologies.',
      location: 'Toronto, CA',
      availability: 'OFFLINE' as const,
      rating: 4.7,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
    },
    {
      clerkId: 'user_demo_4',
      name: 'Michael Davis',
      bio: 'Data scientist picking up web development on the side.',
      location: 'Sydney, AU',
      availability: 'ONLINE' as const,
      rating: 4.5,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026707d',
    },
    {
      clerkId: 'user_demo_5',
      name: 'Sarah Wilson',
      bio: 'Graphic designer exploring motion graphics and UI.',
      location: 'Chicago, IL',
      availability: 'BOTH' as const,
      rating: 5.0,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    },
    {
      clerkId: 'user_demo_6',
      name: 'David Silva',
      bio: 'Musician looking to digitize his workflow and learn to code.',
      location: 'Miami, FL',
      availability: 'OFFLINE' as const,
      rating: 4.6,
      isOnboarded: true,
      avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026709d',
    }
  ];

  const dbUsers = [];
  for (const data of dummyUsersData) {
    const user = await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: data,
      create: data,
    });
    
    // Clear out old skills so we don't have duplicates on rerunning script
    await prisma.userSkillOffered.deleteMany({ where: { userId: user.id } });
    await prisma.userSkillWanted.deleteMany({ where: { userId: user.id } });

    dbUsers.push(user);
    console.log(`Upserted user: ${user.name}`);
  }

  const [emma, james, linda, michael, sarah, david] = dbUsers;

  console.log('Linking skills...');
  // Emma
  await prisma.userSkillOffered.create({
    data: { userId: emma.id, skillId: [react.id , node.id], yearsOfExperience: 3 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: emma.id, skillId: [figma.id, python.id] }
  });

  // James
  await prisma.userSkillOffered.create({
    data: { userId: james.id, skillId: node.id, yearsOfExperience: 5 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: james.id, skillId: react.id }
  });

  // Linda
  await prisma.userSkillOffered.create({
    data: { userId: linda.id, skillId: ui.id, yearsOfExperience: 4 }
  });
  await prisma.userSkillOffered.create({
    data: { userId: linda.id, skillId: figma.id, yearsOfExperience: 3 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: linda.id, skillId: react.id }
  });

  // Michael
  await prisma.userSkillOffered.create({
    data: { userId: michael.id, skillId: python.id, yearsOfExperience: 6 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: michael.id, skillId: node.id }
  });

  // Sarah
  await prisma.userSkillOffered.create({
    data: { userId: sarah.id, skillId: figma.id, yearsOfExperience: 2 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: sarah.id, skillId: ui.id }
  });

  // David
  await prisma.userSkillOffered.create({
    data: { userId: david.id, skillId: guitar.id, yearsOfExperience: 8 }
  });
  await prisma.userSkillWanted.create({
    data: { userId: david.id, skillId: python.id }
  });

  console.log('Dummy users seeded and skills linked perfectly!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
