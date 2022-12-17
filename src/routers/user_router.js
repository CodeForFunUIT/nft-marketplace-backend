import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  getAllUser,
  getNFTUserFromMongo,
  isUserExist,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
router.post("/isUserExist",isUserExist)
export default router;