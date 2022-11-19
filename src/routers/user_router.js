import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  getAllUser,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)

export default router;