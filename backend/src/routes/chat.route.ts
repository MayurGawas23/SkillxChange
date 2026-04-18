import { Router } from "express";
import { getChats, getMessages } from "../controllers/chat.controller.js";
const router  =  Router();

router.get("/:clerkId", getChats)
router.get("/:chatId/messages", getMessages)



export default router;