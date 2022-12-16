import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  getAllUser,
  getNFTUserFromMongo,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
export default router;