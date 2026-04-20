import { prisma } from "../src/lib/prisma.js";

export async function seedDummyUsers() {
  try {
    // ✅ Check if dummy users already exist
    const existing = await prisma.user.findFirst({
      where: {
        clerkId: { startsWith: "dummy_" }
      }
    });

    if (existing) {
      console.log("⚠️ Dummy users already exist, skipping...");
      return;
    }

    console.log("🌱 Adding dummy users...");

    // =========================
    // 1. CREATE SKILLS
    // =========================

    const skills = ["React", "Node.js", "Figma", "Python", "UI/UX", "MongoDB"];

    const skillMap: Record<string, string> = {};

    for (const skillName of skills) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName }
      });

      skillMap[skillName] = skill.id;
    }

    // =========================
    // 2. CREATE USERS
    // =========================

    const users = await Promise.all([
      prisma.user.create({
        data: {
          clerkId: "dummy_emma",
          name: "Emma",
          bio: "Frontend developer passionate about React",
          avatarUrl: "https://i.pravatar.cc/150?img=1",
          isOnboarded: true,
          rating: 4.5
        }
      }),
      prisma.user.create({
        data: {
          clerkId: "dummy_james",
          name: "James",
          bio: "Backend engineer who loves Node.js",
          avatarUrl: "https://i.pravatar.cc/150?img=2",
          isOnboarded: true,
          rating: 4.2
        }
      }),
      prisma.user.create({
        data: {
          clerkId: "dummy_linda",
          name: "Linda",
          bio: "Creative UI/UX designer",
          avatarUrl: "https://i.pravatar.cc/150?img=3",
          isOnboarded: true,
          rating: 4.8
        }
      }),
      prisma.user.create({
        data: {
          clerkId: "dummy_michael",
          name: "Michael",
          bio: "Fullstack dev with MongoDB expertise",
          avatarUrl: "https://i.pravatar.cc/150?img=4",
          isOnboarded: true,
          rating: 4.3
        }
      }),
      prisma.user.create({
        data: {
          clerkId: "dummy_sarah",
          name: "Sarah",
          bio: "Python developer & data enthusiast",
          avatarUrl: "https://i.pravatar.cc/150?img=5",
          isOnboarded: true,
          rating: 4.6
        }
      }),
      prisma.user.create({
        data: {
          clerkId: "dummy_david",
          name: "David",
          bio: "Passionate about UI & frontend animations",
          avatarUrl: "https://i.pravatar.cc/150?img=6",
          isOnboarded: true,
          rating: 4.1
        }
      })
    ]);

    const [emma, james, linda, michael, sarah, david] = users;

    // =========================
    // 3. ADD SKILLS (OFFERED)
    // =========================

    const offeredMap = [
      { user: emma, skills: ["React", "Node.js"] },
      { user: james, skills: ["Node.js", "MongoDB"] },
      { user: linda, skills: ["Figma", "UI/UX"] },
      { user: michael, skills: ["MongoDB", "React"] },
      { user: sarah, skills: ["Python"] },
      { user: david, skills: ["UI/UX", "React"] }
    ];

    for (const entry of offeredMap) {
      for (const skillName of entry.skills) {
        await prisma.userSkillOffered.create({
          data: {
            userId: entry.user.id,
            skillId: skillMap[skillName],
            yearsOfExperience: Math.floor(Math.random() * 5) + 1
          }
        });
      }
    }

    // =========================
    // 4. ADD SKILLS (WANTED)
    // =========================

    const wantedMap = [
      { user: emma, skills: ["Figma", "Python"] },
      { user: james, skills: ["React"] },
      { user: linda, skills: ["Node.js"] },
      { user: michael, skills: ["UI/UX"] },
      { user: sarah, skills: ["MongoDB"] },
      { user: david, skills: ["Python"] }
    ];

    for (const entry of wantedMap) {
      for (const skillName of entry.skills) {
        await prisma.userSkillWanted.create({
          data: {
            userId: entry.user.id,
            skillId: skillMap[skillName]
          }
        });
      }
    }

    console.log("✅ Dummy users added successfully!");
  } catch (err) {
    console.error("❌ Error seeding dummy users:", err);
  }
}