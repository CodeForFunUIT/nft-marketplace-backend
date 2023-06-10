import express from "express";
const router = express.Router();

import {
  addNFT,
  getNFTs,
  updateOwner,
  updateUri,
  updateStatusToStock,
  filterMinMaxNFT,
  sortNFT,
  auctionNFT,
  uploadImageNFT,
  getNFTByTokenId,
} from "../controllers/nft_controller.js";
import { sortByNFT } from "../utility/enum.js";
import upload from "../middleware/upload_image.js";

router.post("/addNFT", addNFT)
router.get("/getNFTs",getNFTs)
router.post("/updateOwner",updateOwner)
router.post("/updateUri",updateUri)
router.post("/updateStatusToStock",updateStatusToStock)
router.post("/filterMinMaxNFT",filterMinMaxNFT)
router.post("/sortNFT",sortNFT)
router.post("/auctionNFT",auctionNFT)
router.get("/getNFTByTokenId/:tokenId",getNFTByTokenId)
router.post("/uploadImageNFT", uploadImageNFT)
export default router;