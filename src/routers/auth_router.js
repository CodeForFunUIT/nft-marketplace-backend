import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  loginUser,
  logOut,
  refreshToken,
  randomNounce,
  verify,
} from "../controllers/auth_controller.js";

router.post("/login", loginUser);
router.post("/register",refreshToken)
router.post("/logout",logOut)
router.get("/nonce",randomNounce)
router.post("/verify",verify)
export default router;