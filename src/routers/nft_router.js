import express from "express";
const router = express.Router();

import {
  addNFT,
  getNFTs,
  updateOwner,
  updateUri,
} from "../controllers/nft_controller.js";

router.post("/addNFT", addNFT)
router.get("/getNFTs",getNFTs)
router.post("/updateOwner",updateOwner)
router.post("/updateUri",updateUri)
export default router;