import express from "express";
const router = express.Router();

import {
    activityLikedByOther,
    filterTransaction
} from "../controllers/activity_controller.js";

router.post("/activityLikedByOther",activityLikedByOther)
router.post("/filterTransaction",filterTransaction)
export default router;
