import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  mintNFT,
  getNFTs,
  updateOwner,
  updateUri,
  updateStatusToStock,
  filterMinMaxNFT,
  sortNFT,
  auctionNFT,
  uploadImageNFT,
  getNFTByTokenId,
  filterNFT,
} from "../controllers/nft_controller.js";
import { sortByNFT } from "../utility/enum.js";
import upload from "../middleware/upload_image.js";

router.post("/mintNFT",authToken, mintNFT)
router.get("/getNFTs",getNFTs)
router.post("/updateOwner",updateOwner)
router.post("/updateUri",updateUri)
router.post("/updateStatusToStock",updateStatusToStock)
router.post("/filterMinMaxNFT",filterMinMaxNFT)
router.post("/sortNFT",sortNFT)
router.post("/auctionNFT",auctionNFT)
router.get("/getNFTByTokenId/:tokenId",getNFTByTokenId)
router.post("/uploadImageNFT", uploadImageNFT)
router.post("/filterNFT",filterNFT)
export default router;