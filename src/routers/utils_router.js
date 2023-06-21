import express from "express";
import {
    updateSellerOnStock,
    updateSellerNFT,
    updateOwnerMarketplaceNFT,
} from "../controllers/util_controller.js"

const router = express.Router();


router.get("/updateSellerOnStock", updateSellerOnStock)
router.post("/updateSellerNFT", updateSellerNFT)
router.post("/updateOwnerMarketplaceNFT", updateOwnerMarketplaceNFT)

export default router