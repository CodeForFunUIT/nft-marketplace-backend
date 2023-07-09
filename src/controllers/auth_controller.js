import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";
import crypto from "crypto";
import { Buffer } from "buffer";
import { ethers } from "ethers";
import ethUtil from "ethereumjs-util";
import WalletSchema from "../models/wallet.js";
let nonce;

// register user
export const loginUser = async (req, res) => {
  try {
    const data = req.body;
    const accessToken = Jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "6000s",
    });

    const refreshToken = Jwt.sign(data, process.env.REFRESH_TOKEN_SECRET);
    // refreshTokens.push(refreshToken)
    // Create a new user

    const user = await User.findOne({
      walletAddress: data.walletAddress.toLowerCase(),
    });

    if (user) {
      return HttpMethodStatus.ok(res, "Login success", {
        user: user,
        accessToken,
        refreshToken,
      });
    }
    return HttpMethodStatus.badRequest(res, "User not exist");
  } catch (error) {
    console.log(error);
    HttpMethodStatus.internalServerError(res, error.message);
  }
};

// register user
export const registerUser = async (req, res) => {
  try {
    const newUser = new User({
      walletAddress: data.walletAddress.toLowerCase(),
    });

    await newUser.save((error, user) => {
      return HttpMethodStatus.created(res, "register success!", {
        user: user,
      });
    });
  } catch (error) {
    console.log(error);
    HttpMethodStatus.internalServerError(res, error.message);
  }
};

// export const signMessage = async (req, res) => {
//   const data = req.body;
//   const user = await User.findOne({
//     walletAddress: data.walletAddress.toLowerCase(),
//   });
  
//   const msg = `Sign message with nonce: ${user.nonce}`;

//   const msgHex = ethUtil.bufferToHex(Buffer.from(msg));
//   const msgBuffer = ethUtil.toBuffer(msgHex);
//   const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
//   const signatureBuffer = ethUtil.bufferToHex(data.signature);
//   const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
//   const publicKey = ethUtil.ecrecover(
//     msgHash,
//     signatureParams.v,
//     signatureParams.r,
//     signatureParams.s
//   );
//   const addressBuffer = ethUtil.publicToAddress(publicKey);
//   const address = ethUtil.bufferToHex(addressBuffer);
//   const isSignatureAddress = address === data.walletAddress;

//   if (isSignatureAddress) {
//     return HttpMethodStatus.ok(res, "Login success", {
//       user: user,
//       accessToken,
//       // refreshToken,
//     });
//   } else {
//     return HttpMethodStatus.badRequest(res, "Signature verification failed");
//   }
// };

export const logOut = (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((refToken) => refToken !== refreshToken);
  res.sendStatus(200);
};

export const refreshToken = (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) res.sendStatus(403);
  Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
    console.log(err, data);
    if (err) res.sendStatus(403);
    const accessToken = Jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30s",
    });
    res.json({ accessToken });
  });
};

export const randomNounce = (req, res) => {
  const len = 5;
  let randStr = "";
  for (let i = 0; i < len; i++) {
    var ch = Math.floor(Math.random() * 10);
    if (ch === 0) {
      ch++;
    }
    randStr += ch;
  }

  nonce = randStr;

  if (randStr.length !== 5) {
    return HttpMethodStatus.badRequest(res, "something Wrong!!");
  }
  return HttpMethodStatus.ok(res, "random nonce", randStr);
};

export const verify = async (req, res) => {
  const data = req.body;

  const userId = req.userId;

  const user = User.findById(userId)

  WalletSchema.findOne({ walletAddress: data.address }).then((wallet) => {
    if (!wallet) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }
    const msg = user.email;

    const msgHex = ethUtil.bufferToHex(Buffer.from(msg));
    const msgBuffer = ethUtil.toBuffer(msgHex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.bufferToHex(data.signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    if (address.toLowerCase() === wallet.walletAddress) {
      return HttpMethodStatus.ok(res, "Signature verification success", true);
    } else {
      return HttpMethodStatus.badRequest(res, "Signature verification failed");
    }
  });
};
