import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

export const initSocket = (io: Server, prisma: PrismaClient) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User joined chat_${chatId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        const sender = await prisma.user.findUnique({
          where: { clerkId: data.senderId },
        });

        if (!sender) return;

        const message = await prisma.message.create({
          data: {
            chatId: data.chatId,
            senderId: sender.id,
            content: data.content,
          },
          include: { sender: true },
        });

        io.to(`chat_${data.chatId}`).emit("new_message", message);
      } catch (err) {
        console.error("Socket message error", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};