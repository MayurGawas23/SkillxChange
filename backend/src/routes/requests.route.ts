import { Router } from "express";
import { createRequest, getRequest, updateRequest } from "../controllers/request.controller.js";
const router  =  Router();

router.post("/", createRequest)
router.get("/:clerkId", getRequest)
router.patch("/:id", updateRequest)



export default router;