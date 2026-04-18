import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PUBLIC_SKILLS = [
  "Frontend Development", "Backend Development", "Full Stack", "React", "Next.js",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Java", "Spring Boot",
  "Ruby on Rails", "PHP", "Laravel", "Go", "Rust", "C++", "C#", ".NET",
  "UI/UX Design", "Graphic Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "Mobile App Development", "React Native", "Flutter", "Swift", "Kotlin",
  "DevOps", "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "CI/CD",
  "Data Science", "Machine Learning", "Artificial Intelligence", "Data Analysis",
  "SQL", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs", "Cybersecurity",
  "Digital Marketing", "SEO", "Content Writing", "Copywriting", "Video Editing",
  "3D Modeling", "Blender", "Unity", "Unreal Engine", "Game Development"
];

export async function seedSkills() {
  for (const skillName of PUBLIC_SKILLS) {
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName }
    });
  }
  console.log("Seeded default skills!");
}

