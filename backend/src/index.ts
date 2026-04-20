import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedDummyUsers } from "./lib/add-dummies.js";
import userRoutes from '../src/routes/user.route.js'
import skillRoutes from '../src/routes/skills.route.js'
import chatRoutes from '../src/routes/chat.route.js'
import requestRoutes from '../src/routes/requests.route.js'
import { seedSkills } from './lib/seedSkills.js';
import { initSocket } from './lib/socket.io.js';

// Prisma Client Initialization with adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

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

// async function seedSkills() {
//   for (const skillName of PUBLIC_SKILLS) {
//     await prisma.skill.upsert({
//       where: { name: skillName },
//       update: {},
//       create: { name: skillName }
//     });
//   }
//   console.log("Seeded default skills!");
// }

// Run seed on boot
await seedSkills();

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillxChange API is running' });
});



app.use("/api/users", userRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/requests", requestRoutes)


initSocket(io, prisma);
// app.get('/api/skills', async (req, res) => {
//   try {
//     const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
//     res.json(skills);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch skills' });
//   }
// });

// app.post('/api/skills', async (req, res) => {
//   const { name } = req.body;
//   if (!name) return res.status(400).json({ error: 'Skill name required' });
//   try {
//     const skill = await prisma.skill.upsert({
//       where: { name },
//       update: {},
//       create: { name }
//     });
//     res.json(skill);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create skill' });
//   }
// });

// // Get all explore users with advanced filtering
// app.get('/api/users', async (req, res) => {
//   const { teachSkill, learnSkill, availability } = req.query;

//   try {
//     let whereClause: any = { isOnboarded: true }; // Only show onboarded users!

//     if (availability && availability !== 'ALL') {
//       whereClause.availability = availability;
//     }

//     if (teachSkill) {
//       whereClause.skillsOffered = {
//         some: { skill: { name: { contains: String(teachSkill), mode: 'insensitive' } } }
//       };
//     }

//     if (learnSkill) {
//       whereClause.skillsWanted = {
//         some: { skill: { name: { contains: String(learnSkill), mode: 'insensitive' } } }
//       };
//     }

//     const users = await prisma.user.findMany({
//       where: whereClause,
//       include: {
//         skillsOffered: { include: { skill: true } },
//         skillsWanted: { include: { skill: true } }
//       }
//     });
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch users' });
//   }
// });

// // Sync user from Clerk
// app.post('/api/users/sync', async (req, res) => {
//   const { clerkId, name, avatarUrl } = req.body;
//   if (!clerkId) return res.status(400).json({ error: 'Missing clerkId' });

//   try {
//     const user = await prisma.user.upsert({
//       where: { clerkId },
//       update: { name, avatarUrl },
//       create: { 
//         clerkId, 
//         name: name || 'Anonymous User',
//         avatarUrl, 
//         bio: '' 
//       },
//       include: {
//         skillsOffered: { include: { skill: true } },
//         skillsWanted: { include: { skill: true } }
//       }
//     });
//     res.json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to sync user' });
//   }
// });

// // Finalize onboarding
// app.post('/api/users/onboard', async (req, res) => {
//   const { clerkId, bio, location, availability, teachSkills, learnSkills } = req.body;
//   try {
//     const user = await prisma.user.update({
//       where: { clerkId },
//       data: {
//         bio,
//         location,
//         availability,
//         isOnboarded: true
//       }
//     });

//     // Clear existing skills to allow continuous upserts
//     await prisma.userSkillOffered.deleteMany({ where: { userId: user.id } });
//     await prisma.userSkillWanted.deleteMany({ where: { userId: user.id } });

//     // Map skills if provided
//     if (teachSkills && Array.isArray(teachSkills)) {
//       for (const skillId of teachSkills) {
//         await prisma.userSkillOffered.create({
//           data: { userId: user.id, skillId }
//         });
//       }
//     }

//     if (learnSkills && Array.isArray(learnSkills)) {
//       for (const skillId of learnSkills) {
//         await prisma.userSkillWanted.create({
//           data: { userId: user.id, skillId }
//         });
//       }
//     }

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to onboard' });
//   }
// });

// // Update skills explicitly (For Profile Edit)
// app.put('/api/users/:clerkId/skills', async (req, res) => {
//   const { teachSkills, learnSkills } = req.body;
  
//   try {
//     const user = await prisma.user.findUnique({ where: { clerkId: req.params.clerkId } });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     // Clear existing
//     await prisma.userSkillOffered.deleteMany({ where: { userId: user.id } });
//     await prisma.userSkillWanted.deleteMany({ where: { userId: user.id } });

//     // Insert new
//     if (teachSkills && Array.isArray(teachSkills)) {
//       for (const skillId of teachSkills) {
//         await prisma.userSkillOffered.create({
//           data: { userId: user.id, skillId }
//         });
//       }
//     }

//     if (learnSkills && Array.isArray(learnSkills)) {
//       for (const skillId of learnSkills) {
//         await prisma.userSkillWanted.create({
//           data: { userId: user.id, skillId }
//         });
//       }
//     }

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update skills' });
//   }
// });

// Socket.io for Real-time chat & notifications
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Join a specific chat room
//   socket.on('join_chat', (chatId) => {
//     socket.join(`chat_${chatId}`);
//     console.log(`User joined chat_${chatId}`);
//   });

//   socket.on('send_message', async (data) => {
//     // data: { chatId, senderId, content }
//     try {
//       const sender = await prisma.user.findUnique({ where: { clerkId: data.senderId } });
//       if (!sender) return;

//       const message = await prisma.message.create({
//         data: {
//           chatId: data.chatId,
//           senderId: sender.id,
//           content: data.content
//         },
//         include: { sender: true }
//       });
//       // Broadcast to everyone in the room
//       io.to(`chat_${data.chatId}`).emit('new_message', message);
//     } catch (err) {
//       console.error('Socket message error', err);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// // Chat APIs
// app.get('/api/chats/:clerkId', async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({ where: { clerkId: req.params.clerkId }});
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const chats = await prisma.chat.findMany({
//       where: {
//         members: {
//           some: { userId: user.id }
//         }
//       },
//       include: {
//         members: {
//           include: { user: true } // to get names of folks in chat
//         },
//         messages: {
//           orderBy: { createdAt: 'desc' },
//           take: 1
//         }
//       },
//       orderBy: { updatedAt: 'desc' }
//     });
//     res.json(chats);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch chats' });
//   }
// });

// app.get('/api/chats/:chatId/messages', async (req, res) => {
//   try {
//     const messages = await prisma.message.findMany({
//       where: { chatId: req.params.chatId },
//       include: { sender: true },
//       orderBy: { createdAt: 'asc' }
//     });
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });

// // Exchange Requests APIs
// app.post('/api/requests', async (req, res) => {
//   const { senderClerkId, receiverId, message } = req.body;
//   try {
//     const sender = await prisma.user.findUnique({ where: { clerkId: senderClerkId }});
//     if (!sender) return res.status(404).json({ error: 'Sender not found' });
    
//     // Prevent any duplicate requests across users (they can only have one interaction state)
//     const existing = await prisma.exchangeRequest.findFirst({
//       where: {
//         OR: [
//           { senderId: sender.id, receiverId },
//           { senderId: receiverId, receiverId: sender.id }
//         ]
//       }
//     });
//     if (existing) return res.status(400).json({ error: 'Interaction already exists' });

//     const request = await prisma.exchangeRequest.create({
//       data: { senderId: sender.id, receiverId, message }
//     });
//     // TODO: emit socket notification here if needed
//     res.json(request);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create request' });
//   }
// });

// app.get('/api/requests/:clerkId', async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({ where: { clerkId: req.params.clerkId }});
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const requests = await prisma.exchangeRequest.findMany({
//       where: {
//         OR: [
//           { senderId: user.id },
//           { receiverId: user.id }
//         ]
//       },
//       include: {
//         sender: true,
//         receiver: true
//       },
//       orderBy: { createdAt: 'desc' }
//     });
//     res.json(requests);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch requests' });
//   }
// });

// app.patch('/api/requests/:id', async (req, res) => {
//   const { status } = req.body; // ACCEPTED or REJECTED
//   try {
//     const request = await prisma.exchangeRequest.update({
//       where: { id: req.params.id },
//       data: { status }
//     });
    
//     if (status === 'ACCEPTED') {
//       // Create a Chat conversation between them if it doesn't already exist
//       const chat = await prisma.chat.create({
//         data: {
//           members: {
//             create: [
//               { userId: request.senderId },
//               { userId: request.receiverId }
//             ]
//           }
//         }
//       });
//       // Emit chat creation over socket (ideally)
//     }

//     res.json(request);
//   } catch (error) {
  //     res.status(500).json({ error: 'Failed to update request' });
  //   }
  // });
  async function startServer() {
  try {
    // ✅ Seed dummy users first
    await seedDummyUsers();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
}

startServer();
  
  
  const PORT = process.env.PORT || 4000;
  
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  console.log("DATABASE_URL:", process.env.DATABASE_URL);