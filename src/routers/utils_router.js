import express from "express";
import { authToken } from "../middleware/authorization.js";

import {
    updateSellerOnStock,
    updateSellerNFT,
    updateOwnerMarketplaceNFT,
    removeWallet,
    updateIsFinishedKYCNFT,
    updateOwnerNFT,
    addOverviewNFT,
    addOverviewImage,
    updateOverviewAllNFT,
    getNFTAuction,
    removeAuctionFromAllNFT,
    changeNFTToOnstock,
    getOwnerFromBlockchain,
    getAllNFTFromBlockchain,
    updateMissingNFT,
    resetWalletAndPushNFT,
} from "../controllers/util_controller.js"

const router = express.Router();


router.get("/updateSellerOnStock", updateSellerOnStock)
router.post("/updateSellerNFT", updateSellerNFT)
router.post("/updateOwnerMarketplaceNFT", updateOwnerMarketplaceNFT)
router.post("/removeWallet",authToken, removeWallet)
router.post("/updateIsFinishedKYCNFT",authToken ,updateIsFinishedKYCNFT)
router.post("/updateOwnerNFT",updateOwnerNFT)
router.post("/addOverviewNFT",addOverviewNFT)
router.post("/addOverviewImage",addOverviewImage)
router.get("/updateOverviewAllNFT",updateOverviewAllNFT)
router.get("/getNFTAuction",getNFTAuction)
router.get("/removeAuctionFromAllNFT",removeAuctionFromAllNFT)
router.post("/changeNFTToOnstock",changeNFTToOnstock)
router.post("/getOwnerFromBlockchain",getOwnerFromBlockchain)
router.get("/getAllNFTFromBlockchain",getAllNFTFromBlockchain)
router.get("/updateMissingNFT",updateMissingNFT)
router.post("/resetWalletAndPushNFT",resetWalletAndPushNFT)
export default router