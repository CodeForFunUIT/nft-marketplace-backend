import express from "express";
const router = express.Router();

import {
  addNFT,
  getNFTs,
} from "../controllers/nft_controller.js";

router.post("/addNFT", addNFT)
router.get("/getNFTs",getNFTs)
export default router;