import express from "express";
import { authToken } from "../middleware/authorization.js";
const router = express.Router();

import {
  getAllUser,
  getNFTUserFromMongo,
  isUserExist,
  addTokenId,
  removeTokenId,
  changeName,
  getUserByAddressOwner,
  getMyAuction,
  getWinnerAuction,
  likeNFT,
  dislikeNFT,
  getWishListNFT,
  updateUri,
  login,
  register,
  verify,
  getUser,
  importWallet,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
router.post("/getWishListNFT", getWishListNFT)
router.post("/getUserByAddressOwner",getUserByAddressOwner)
router.post("/getMyAuction",getMyAuction)
router.post("/getWinnerAuction",getWinnerAuction)
router.post("/isUserExist",isUserExist)
router.post('/addTokenId', addTokenId)
router.post("/removeTokenId",removeTokenId)
router.post("/changeName",changeName)
router.post("/likeNFT", likeNFT)
router.post("/dislikeNFT", dislikeNFT)
router.post("/updateUri", updateUri)
router.post("/login",login)
router.post("/register",register)
router.get("/verify/:uniqueEmailId", verify)
router.get("/getUser",getUser)
router.post("/importWallet",importWallet)
export default router;