import { Router } from "express";
import { getUsers, onboardUser, syncUser,updateMySkills } from "../controllers/users.controller.js";
const router  =  Router();

router.get("/", getUsers)
router.post("/sync", syncUser)
router.post("/onboard", onboardUser)
router.put("/:clerkId/skills", updateMySkills)


export default router;