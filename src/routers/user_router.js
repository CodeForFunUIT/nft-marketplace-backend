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
  likeNFT,
  dislikeNFT,
  getWishListNFT,
  updateUri,
  login,
  register,
  verify,
  getUser,
  importWallet,
  changePassword,
  resendEmail,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
router.post("/getWishListNFT", getWishListNFT)
router.post("/getUserByAddressOwner",getUserByAddressOwner)
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
router.get("/getUser",authToken ,getUser)
router.post("/importWallet",importWallet)
router.post("/changePassword",changePassword)
router.get("/resendEmail",authToken,resendEmail)
export default router;