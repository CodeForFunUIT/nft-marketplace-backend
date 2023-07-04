import express from "express";
import { authToken } from "../middleware/authorization.js";

import {
    addAuctionOrder,
    getMyAuction,
    getWinnerAuction,
    auctionNFT,
    getAuction,
} from "../controllers/auction_controller.js"

const router = express.Router();


router.post("/addAuctionOrder",authToken ,addAuctionOrder)
router.post("/getMyAuction", getMyAuction)
router.post("/getWinnerAuction", getWinnerAuction)
router.post("/auctionNFT",auctionNFT)
router.post("/getAuction",getAuction)


export default router