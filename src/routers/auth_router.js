import express from "express";
const router = express.Router();

import {
  loginUser,
  logOut,
  refreshToken,
} from "../controllers/auth_controller.js";

router.post("/login", loginUser);
router.post("/register",refreshToken)
router.post("/logout",logOut)

export default router;