import express from "express";
const router = express.Router();

import {
    activityLikedByOther,
} from "../controllers/activity_controller.js";

router.post("/activityLikedByOther",activityLikedByOther)
export default router;
