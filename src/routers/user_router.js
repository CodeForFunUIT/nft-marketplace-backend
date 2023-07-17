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
  getFavoriteNFT,
  updateUri,
  login,
  register,
  verify,
  getUser,
  importWallet,
  changePassword,
  resendEmail,
  forgetPassword,
} from "../controllers/user_controller.js";

router.get("/getUsers",getAllUser)
router.post("/getNFTUserFromMongo",getNFTUserFromMongo)
router.get("/getFavoriteNFT",authToken, getFavoriteNFT)
router.post("/getUserByAddressOwner",getUserByAddressOwner)
router.post("/isUserExist",isUserExist)
router.post('/addTokenId', addTokenId)
router.post("/removeTokenId",removeTokenId)
router.post("/changeName",changeName)
router.post("/likeNFT",authToken ,likeNFT)
router.post("/dislikeNFT",authToken ,dislikeNFT)
router.post("/updateUri", updateUri)
router.post("/login",login)
router.post("/register",register)
router.get("/verify/:uniqueEmailId", verify)
router.get("/getUser",authToken ,getUser)
router.post("/importWallet",authToken,importWallet)
router.post("/changePassword",authToken, changePassword)
router.get("/resendEmail",authToken,resendEmail)
router.post("/forgetPassword",forgetPassword)
export default router;