import type {Request , Response} from "express";
import { prisma } from "../lib/prisma.js";

type GetUsersParams = {
    teachSkill: string;
    learnSkill: string;
    availability: string;
};
type updateMySkillsParams = {
    clerkId: string;
};

export const getUsers = async (req : Request<GetUsersParams> , res : Response) =>{
 const { teachSkill, learnSkill, availability } = req.params;

  try {
    let whereClause: any = { isOnboarded: true }; // Only show onboarded users!

    if (availability && availability !== 'ALL') {
      whereClause.availability = availability;
    }

    if (teachSkill) {
      whereClause.skillsOffered = {
        some: { skill: { name: { contains: String(teachSkill), mode: 'insensitive' } } }
      };
    }

    if (learnSkill) {
      whereClause.skillsWanted = {
        some: { skill: { name: { contains: String(learnSkill), mode: 'insensitive' } } }
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        skillsOffered: { include: { skill: true } },
        skillsWanted: { include: { skill: true } }
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export const syncUser =  async(req:Request, res:Response )=>{
    console.log("hit")
     const { clerkId, name, avatarUrl } = req.body;
  if (!clerkId) return res.status(400).json({ error: 'Missing clerkId' });

  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { name, avatarUrl },
      create: { 
        clerkId, 
        name: name || 'Anonymous User',
        avatarUrl, 
        bio: '' 
      },
      include: {
        skillsOffered: { include: { skill: true } },
        skillsWanted: { include: { skill: true } }
      }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
}

export const onboardUser =  async(req:Request, res:Response )=>{
  const { clerkId, bio, location, availability, teachSkills, learnSkills } = req.body;
  try {
    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        bio,
        location,
        availability,
        isOnboarded: true
      }
    });

    // Clear existing skills to allow continuous upserts
    await prisma.userSkillOffered.deleteMany({ where: { userId: user.id } });
    await prisma.userSkillWanted.deleteMany({ where: { userId: user.id } });

    // Map skills if provided
    if (teachSkills && Array.isArray(teachSkills)) {
      for (const skillId of teachSkills) {
        await prisma.userSkillOffered.create({
          data: { userId: user.id, skillId }
        });
      }
    }

    if (learnSkills && Array.isArray(learnSkills)) {
      for (const skillId of learnSkills) {
        await prisma.userSkillWanted.create({
          data: { userId: user.id, skillId }
        });
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to onboard' });
  }
}

export const updateMySkills =  async(req:Request<updateMySkillsParams>, res:Response )=>{
      const { teachSkills, learnSkills } = req.body;
      const {clerkId} = req.params
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Clear existing
    await prisma.userSkillOffered.deleteMany({ where: { userId: user.id } });
    await prisma.userSkillWanted.deleteMany({ where: { userId: user.id } });

    // Insert new
    if (teachSkills && Array.isArray(teachSkills)) {
      for (const skillId of teachSkills) {
        await prisma.userSkillOffered.create({
          data: { userId: user.id, skillId }
        });
      }
    }

    if (learnSkills && Array.isArray(learnSkills)) {
      for (const skillId of learnSkills) {
        await prisma.userSkillWanted.create({
          data: { userId: user.id, skillId }
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update skills' });
  }
}