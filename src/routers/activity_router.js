import express from "express";
const router = express.Router();

import {
    activityLikedByOther,
    activityTransaction,
} from "../controllers/activity_controller.js";

router.post("/activityLikedByOther",activityLikedByOther)
router.post("/activityTransaction",activityTransaction)
export default router;
