import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import Auction from "../models/auction.js";
import Activity from "../models/activity.js";
import { activityType } from "../utility/enum.js";
import formidable from "formidable";
import fs from "fs";
import Image from "../models/image.js";
import SENDMAIL from "../email/transporter.js";
import HTML_TEMPLATE from "../email/content_email.js";
import dotenv from "dotenv";
dotenv.config({ path: "../config/config.env" });
export const getAllUser = async (req, res) => {
  const users = await User.find({}).populate("listNFT");

  HttpMethodStatus.ok(res, "get Users success", users);
};

export const getUserByAddressOwner = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    const nfts = await NFT.find({ owner: user._id }).select(
      "_id tokenId orderId uri name price"
    );

    user.listNFT = nfts;
    return HttpMethodStatus.ok(res, "get user success", user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
export const getNFTUserFromMongo = async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      return HttpMethodStatus.badRequest(res, "User not exist");
    }
    const listNFT = await NFT.find({ seller: user._id })
      .select("_id tokenId orderId addressOwner uri name status price seller")
      .populate({ path: "seller", select: "_id walletAddress name" });

    user.listNFT = listNFT;
    return HttpMethodStatus.ok(res, "execute success!", user.listNFT);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const isUserExist = async (req, res) => {
  try {
    const { address } = req.body;

    const users = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!users) {
      return HttpMethodStatus.badRequest(res, "User not exist");
    }

    return HttpMethodStatus.ok(res, "userExist", true);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const changeName = async (req, res) => {
  try {
    const { address, name } = req.body;

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { name: name },
      { new: true }
    );
    if (!user) {
      return HttpMethodStatus.badRequest(res, "User not exist");
    }

    return HttpMethodStatus.ok(res, "update user' name success", user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

/// lấy danh sách NFT mà tôi đang rao bán đấu giá
export const getMyAuction = async (req, res) => {
  try {
    const { address } = req.data;

    const auctions = await Auction.find({ seller: address })
      .populate({
        nft: "nft",
        select: "_id tokenId orderId owner uri name price favorite",
      })
      .populate({ path: "winner", select: "_id walletAddress name" });

    return HttpMethodStatus.ok(res, "get list auction success", auctions);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

/// lấy danh sách NFT mà tôi đấu giá thành công
export const getWinnerAuction = async (req, res) => {
  try {
    const { address } = req.data;

    const user = await User.findOne({ walletAddress: address.toLowerCase() });
    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }
    const auctions = await Auction.find({ winner: user._id }).populate({
      nft: "nft",
      select: "_id tokenId orderId owner uri name price favorite",
    });

    return HttpMethodStatus.ok(res, "get list auction success", auctions);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

/// TODO not use
export const addTokenId = async (req, res) => {
  try {
    const { address, tokenId } = req.body;

    const nft = await NFT.findOne({ tokenId: tokenId });
    if (!nft) {
      return HttpMethodStatus.badRequest(
        res,
        `token id not exist: ${tokenId} `
      );
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { $addToSet: { listNFT: nft._id } },
      { new: true }
    ).exec();

    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    return HttpMethodStatus.ok(res, "add tokenId success!!!", user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

/// TODO not use
export const removeTokenId = async (req, res) => {
  try {
    const { address, tokenId } = req.body;

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { $pull: { listNFT: tokenId } },
      { new: true }
    ).exec();

    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    return HttpMethodStatus.ok(res, "remove tokenId success!!!", user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const likeNFT = async (req, res) => {
  try {
    const { tokenId, walletAddress } = req.body;
    const nft = await NFT.findOne({ tokenId: tokenId });
    if (!nft) {
      return HttpMethodStatus.badRequest(res, "nft not exist");
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $addToSet: { wishList: nft._id } },
      { new: true }
    ).populate({
      path: "wishList",
      select: "_id tokenId orderId addressOwner uri name status price",
    });
    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    const activity = new Activity({
      nft: nft._id,
      interactiveUser: user._id,
      user: nft.seller,
      type: activityType.LIKE_NFT,
    });

    await activity.save((err, activity) => {
      if (err) {
        return HttpMethodStatus.badRequest(res, `error on save activity`);
      }
    });

    return HttpMethodStatus.ok(res, `like nft with tokenId: ${tokenId}`, user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const dislikeNFT = async (req, res) => {
  try {
    const { tokenId, walletAddress } = req.body;
    const nft = await NFT.findOne({ tokenId: tokenId });
    if (!nft) {
      return HttpMethodStatus.badRequest(res, "nft not exist");
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $pull: { wishList: nft._id } },
      { new: true }
    ).populate({
      path: "wishList",
      select: "_id tokenId orderId addressOwner uri name status price",
    });
    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    return HttpMethodStatus.ok(
      res,
      `dislike nft with tokenId: ${tokenId}`,
      user
    );
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const getWishListNFT = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    })
      .populate({ path: "wishList" })
      .exec((err, user) => {
        if (err) {
          return HttpMethodStatus.badRequest(res, err.message);
        }
        if (!user) {
          return HttpMethodStatus.badRequest(res, "user not exist");
        }

        NFT.populate(
          user.wishList,
          { path: "seller", select: "_id name walletAddress" },
          function (err, wishList) {
            if (err) {
              console.log(err);
            } else {
              return HttpMethodStatus.ok(
                res,
                `get wish list NFT's ${walletAddress} success`,
                wishList
              );
            }
          }
        );
      });
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const updateUri = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return HttpMethodStatus.badRequest(res, err.message);
      }

      const walletAddress = fields.walletAddress.toLowerCase();
      const oldPath = files.images.filepath;

      fs.readFile(oldPath, async (err, data) => {
        if (err) {
          return HttpMethodStatus.badRequest(res, err.message);
        }

        const image = new Image({ data });
        await image.save(async (err, result) => {
          if (err) {
            return HttpMethodStatus.badRequest(res, err.message);
          }
        });

        const user = await User.findOneAndUpdate(
          { walletAddress: walletAddress },
          {
            $set: {
              uri: `https://nft-marketplace-backend-z4eu.vercel.app/image/${image._id}`,
            },
          }
        );

        if (!user) {
          return HttpMethodStatus.badRequest(res, "user not exist");
        }

        return HttpMethodStatus.ok(res, "update uri user success", user);
      });
    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

export const register = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (password.length < 8) {
      return HttpMethodStatus.badRequest(
        res,
        `${password} must larger than 8 !!!`
      );
    }

    const user = await User.findOne({ email });

    if (user) {
      return HttpMethodStatus.badRequest(res, `${email} is exist !!!`);
    }

    const saveUser = new User({
      email,
      password,
      firstName,
      lastName,
      uniqueEmailId: Math.floor(Math.random() * 10) * Date.now(),
    });

    saveUser.save((err, data) => {
      if (err)
        return HttpMethodStatus.badRequest(
          res,
          `error on save user ${err.message}`
        );
      if (data) {
        console.log(data.uniqueEmailId);
        console.log(data.firstName);
        SENDMAIL(
          {
            from: process.env.EMAIL_NAME,
            to: email,
            subject: "Welcome to NNG Marketplace",
            text: "Verify email to access our marketplace",
            html: HTML_TEMPLATE(data.uniqueEmailId),
          },
          (info) => {
            console.log("Email sent successfully");
            console.log("MESSAGE ID: ", info.messageId);
          }
        );
        return HttpMethodStatus.ok(res, `save user success`, data);
      }
    });
  } catch (error) {
    return HttpMethodStatus.badRequest(
      res,
      `error on register ${error.message}`
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (password.length < 8) {
      return HttpMethodStatus.badRequest(
        res,
        `${password} must smaller than 8 !!!`
      );
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return HttpMethodStatus.badRequest(res, `user not found `);
    }

    // if(!user.isVerified){
    //   return HttpMethodStatus.badRequest(res, `your email haven't verified`);
    // }

    user.comparePassword(password, (err, isMatch) => {
      if (isMatch) return res.status(200).send({
        success: true,
        message: "login success", 
        data: {
          "payload": user,
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDA5NTZlZmUxNThhMzljMjE2NzU5ODAiLCJlbWFpbCI6ImFuaG5oYW5sZTE5MDVAZ21haWwuY29tIiwicm9sZSI6IkdVRVNUIiwiaWF0IjoxNjg2MTg4ODIxLCJleHAiOjE2ODY0NDgwMjF9.mskW7j1ngz2nvDpfm8hRTOJrOGJ79p4O9P_zCHfNjXI"
        }
      })
      else if(!isMatch) return HttpMethodStatus.badRequest(res, "wrong password, login failed!!!");;
      if (err)
        return HttpMethodStatus.badRequest(
          res,
          `error on compare password ${err.message}`
        ); 
    });
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error on login ${error.message}`);
  }
};
export const verify = async (req, res) => {
  const { uniqueEmailId } = req.params;

  const user = await User.findOneAndUpdate(
    { uniqueEmailId },
    { isVerified: true },
    { new: true },
  );
  if (user) {
    return HttpMethodStatus.ok(res, "verify success", user);
  } else {
    return HttpMethodStatus.badRequest(res, "user not found!!");
  }
};

export const addWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body
    const { userId } = req.params

    const user = User.findByIdAndUpdate(userId, {
      $push:{
        walletList: walletAddress,
      },
    },{ new: true} )

  } catch (error) {
    
  }
}