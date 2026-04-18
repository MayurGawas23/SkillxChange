import type {Request , Response} from "express";
import { prisma } from "../lib/prisma.js";

export const getSkills = async (req : Request , res : Response) =>{
     try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}

export const updateSkills = async (req : Request, res:Response)=>{
     const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name required' });
  try {
    const skill = await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
}