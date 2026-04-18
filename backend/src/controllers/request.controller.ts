import type {Request , Response} from "express";
import { prisma } from "../lib/prisma.js";

type getRequestParams = {
    clerkId: string;
};

type updateRequestParams = {
    id: string;
};

export const createRequest = async (req : Request , res : Response) =>{
const { senderClerkId, receiverId, message } = req.body;
  try {
    const sender = await prisma.user.findUnique({ where: { clerkId: senderClerkId }});
    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    
    // Prevent any duplicate requests across users (they can only have one interaction state)
    const existing = await prisma.exchangeRequest.findFirst({
      where: {
        OR: [
          { senderId: sender.id, receiverId },
          { senderId: receiverId, receiverId: sender.id }
        ]
      }
    });
    if (existing) return res.status(400).json({ error: 'Interaction already exists' });

    const request = await prisma.exchangeRequest.create({
      data: { senderId: sender.id, receiverId, message }
    });
    // TODO: emit socket notification here if needed
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create request' });
  }
}

export const getRequest = async (req : Request<getRequestParams> , res : Response) =>{
  try {
    const {clerkId} = req.params
    const user = await prisma.user.findUnique({ where: { clerkId }});
    if (!user) return res.status(404).json({ error: 'User not found' });

    const requests = await prisma.exchangeRequest.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

export const updateRequest = async (req : Request<updateRequestParams> , res : Response) =>{
     const { status } = req.body; // ACCEPTED or REJECTED
  try {
    const request = await prisma.exchangeRequest.update({
      where: { id: req.params.id },
      data: { status }
    });
    
    if (status === 'ACCEPTED') {
      // Create a Chat conversation between them if it doesn't already exist
      const chat = await prisma.chat.create({
        data: {
          members: {
            create: [
              { userId: request.senderId },
              { userId: request.receiverId }
            ]
          }
        }
      });
      // Emit chat creation over socket (ideally)
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
}

