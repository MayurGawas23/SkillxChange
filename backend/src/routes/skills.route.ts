import { Router } from "express";
import { getSkills, updateSkills } from "../controllers/skills.controller.js";
const router  =  Router();

router.get("/", getSkills)
router.post("/", updateSkills)


export default router;