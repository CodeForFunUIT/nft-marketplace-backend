import express from "express";
import {
    getImage
} from "../controllers/image_controller.js"

const router = express.Router();


router.get("/:id", getImage)


export default router