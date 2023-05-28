import express from "express";
const router = express.Router();

import {
    activityLikedByOther,
    activityTransaction,
    filterTransaction
} from "../controllers/activity_controller.js";

router.post("/activityLikedByOther",activityLikedByOther)
router.post("/activityTransaction",activityTransaction)
router.post("/filterTransaction",filterTransaction)
export default router;
