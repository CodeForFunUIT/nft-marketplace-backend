import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  getAllUser,
  getNFTUserFromMongo,
  isUserExist,
  addTokenId,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
router.post("/isUserExist",isUserExist)
router.post('/addTokenId', addTokenId)

export default router;