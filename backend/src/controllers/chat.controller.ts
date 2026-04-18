import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";



type GetChatsParams = {
    clerkId: string;
};

type GetMessagesParams = {
    chatId: string;
};

export const getChats = async (
    req: Request<GetChatsParams>,
    res: Response
) => {
    try {
        const { clerkId } = req.params;

        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const chats = await prisma.chat.findMany({
            where: {
                members: {
                    some: { userId: user.id },
                },
            },
            include: {
                members: {
                    include: { user: true },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chats" });
    }
};

export const getMessages = async (req: Request<GetMessagesParams>, res: Response) => {
    try {
        const { chatId } = req.params;
        const messages = await prisma.message.findMany({
            where: { chatId },
            include: { sender: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}