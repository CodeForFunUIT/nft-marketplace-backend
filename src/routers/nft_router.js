import express from "express";
const router = express.Router();

import {
  addNFT,
  getNFTs,
  updateOwner,
  updateUri,
  updateStatusToStock,
  filterMinMaxNFT,
  sortNFT
} from "../controllers/nft_controller.js";
import { sortByNFT } from "../utility/enum.js";

router.post("/addNFT", addNFT)
router.get("/getNFTs",getNFTs)
router.post("/updateOwner",updateOwner)
router.post("/updateUri",updateUri)
router.post("/updateStatusToStock",updateStatusToStock)
router.post("/filterMinMaxNFT",filterMinMaxNFT)
router.post("/sortNFT",sortNFT)
export default router;