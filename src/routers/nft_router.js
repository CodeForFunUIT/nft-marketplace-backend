import express from "express";
const router = express.Router();

import {
  addNFT,
  getNFTs,
  updateOwner,
  updateUri,
  updateStatusToStock
} from "../controllers/nft_controller.js";

router.post("/addNFT", addNFT)
router.get("/getNFTs",getNFTs)
router.post("/updateOwner",updateOwner)
router.post("/updateUri",updateUri)
router.post("/updateStatusToStock",updateStatusToStock)
export default router;