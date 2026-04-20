import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// ✅ correct imports (NO src/)
import { seedDummyUsers } from "./lib/add-dummies.js";
import { seedSkills } from './lib/seedSkills.js';
import { initSocket } from './lib/socket.io.js';

// ✅ FIXED ROUTES
import userRoutes from './routes/user.route.js';
import skillRoutes from './routes/skills.route.js';
import chatRoutes from './routes/chat.route.js';
import requestRoutes from './routes/requests.route.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/requests', requestRoutes);

// socket init

// DB (optional if already handled elsewhere)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
initSocket(io, prisma);

// server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // ✅ seed dummy users
    await seedDummyUsers();

    // ✅ optional skill seed
    await seedSkills();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
}

startServer();