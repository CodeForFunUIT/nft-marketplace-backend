import express from "express";
const router = express.Router();

import {
  addNFT,
} from "../controllers/nft_controller.js";

router.post("/addNFT", addNFT)
export default router;