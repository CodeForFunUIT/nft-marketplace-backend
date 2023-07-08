import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import WalletSchema from "../models/wallet.js";
import { statusNFT, address, durationTrick } from "../utility/enum.js";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";
import { contractMarketPlace } from "../utility/contract.js";
import Auction from "../models/auction.js";
import mongoose from "mongoose";
import SENDMAIL from "../email/transporter.js";
import dotenv from "dotenv";
import HTML_TEMPLATE from "../email/content_email.js";

dotenv.config({ path: "../config/config.env" });

export const addAuctionOrder = async (req, res) => {
  try {
    const { endAuction, walletAddress, minPrice, tokenId } = req.body;
    const userId = req.userId;
    const startDate = utcToZonedTime(new Date(), vietnamTimezone);
    const endDate = utcToZonedTime(new Date(endAuction), vietnamTimezone);
    const now = utcToZonedTime(new Date(), vietnamTimezone);
    const auctionTime = endDate.getTime() - now.getTime();

    if (now.getTime() > endDate.getTime()) {
      return HttpMethodStatus.badRequest(
        res,
        `invalid end date ${endDate} \n now: ${now}`
      );
    }

    const nft = await NFT.findOne({ tokenId: tokenId });

    if (!nft)
      return HttpMethodStatus.badRequest(
        res,
        `nft not exist with tokenId: ${tokenId}`
      );

    // if(nft.status == statusNFT.AUCTION){
    //   return HttpMethodStatus.badRequest(res, `this NFT is on auction`)
    // }

    const sellerWallet = await WalletSchema.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!sellerWallet) {
      return HttpMethodStatus.badRequest(
        res,
        `wallet address not exist with address: ${sellerWallet}`
      );
    }

    const auction = new Auction({
      minPrice: Number(minPrice),
      endAuction: endDate.getTime(),
      sellerAddress: sellerWallet.walletAddress,
      seller: sellerWallet.owner._id,
      nft: nft._id,
    });

    auction.save(async (error, data) => {
      if (error) {
        return HttpMethodStatus.badRequest(res, error.message);
      }
      const nft = await NFT.findOneAndUpdate(
        { tokenId: tokenId },
        {
          $set: {
            price: Number(minPrice),
            status: statusNFT.AUCTION,
            auction: data._id,
          },
        }
      ).exec();
      setTimeout(async () => {
        const auction = await Auction.findById(data._id);
        const sortNFT = auction.listAuction.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );

        const ownerAuction = await User.findById(sellerWallet.owner._id);

        if (!ownerAuction) {
          console.log("user not exist");
        }
        /// nếu không có ai đấu giá
        if (sortNFT.length === 0) {
          const nft = await NFT.findOneAndUpdate(
            { auction: auction._id },
            { price: 0, status: statusNFT.ONSTOCK },
            { new: true }
          );

          SENDMAIL(
            {
              from: process.env.EMAIL_NAME,
              to: ownerAuction.email,
              subject: "End auction",
              text: `Your auction nft with tokenId: ${tokenId} is end`,
              // html: HTML_TEMPLATE(data.uniqueEmailId),
            },
            (info) => {
              console.log("Email sent successfully");
              console.log("MESSAGE ID: ", info.messageId);
            }
          );
        } else {
          const buyer = sortNFT[0].walletAddress;
          const winnerAddress = await WalletSchema.findOne({
            walletAddress: buyer.toLowerCase(),
          });
          await Auction.findByIdAndUpdate(auction._id, {
            winner: winnerAddress._id,
            timeOutAuction: endDate.getTime() + 86400000,
          });
          const userBuy = await User.findById(winnerAddress.owner._id);
          SENDMAIL(
            {
              from: process.env.EMAIL_NAME,
              to: userBuy.email,
              subject: "End auction",
              text: `you have successfully won the auctione NFT item with tokenId ${tokenId}`,
              html: HTML_TEMPLATE(tokenId),
            },
            (info) => {
              console.log("Email sent successfully");
              console.log("MESSAGE ID: ", info.messageId);
            }
          );
          SENDMAIL(
            {
              from: process.env.EMAIL_NAME,
              to: ownerAuction.email,
              subject: "End auction",
              text: `Your auction nft with tokenId: ${tokenId} is end`,
              html: HTML_TEMPLATE(tokenId),
            },
            (info) => {
              console.log("Email sent successfully");
              console.log("MESSAGE ID: ", info.messageId);
            }
          );
        }
      }, auctionTime);
      // schedule.scheduleJob(endDate, async () => {
        // const auction = await Auction.findById(data._id);
        // const sortNFT = auction.listAuction.sort(
        //   (a, b) => Number(b.price) - Number(a.price)
        // );
        // const ownerAuction = await User.findById(sellerWallet.owner._id)
        // if(!ownerAuction){
        //   console.log('user not exist')
        // }
        // /// nếu không có ai đấu giá
        // if (sortNFT.length === 0) {
        //     const nft = await NFT.findOneAndUpdate(
        //       { auction: auction._id },
        //       { price: 0,
        //         status: statusNFT.ONSTOCK,
        //       },{ new : true}
        //     );
        //     SENDMAIL(
        //       {
        //         from: process.env.EMAIL_NAME,
        //         to: ownerAuction.email,
        //         subject: "End auction",
        //         text: `Your auction nft with tokenId: ${tokenId} is end`,
        //         // html: HTML_TEMPLATE(data.uniqueEmailId),
        //       },
        //       (info) => {
        //         return HttpMethodStatus.ok(res, `send email success to ${ownerAuction.email}`)
        //         console.log("Email sent successfully");
        //         console.log("MESSAGE ID: ", info.messageId);
        //       }
        //     );
        // } else {
        //   const buyer = sortNFT[0].walletAddress;
        //   const winnerAddress = await WalletSchema.findOne({
        //     walletAddress: buyer.toLowerCase(),
        //   });
        //   await Auction.findByIdAndUpdate(
        //     auction._id,
        //     { winner: winnerAddress._id, timeOutAuction: endDate.getTime() + 86400000 }
        //   );
        //   const userBuy = await User.findById(winnerAddress.owner._id)
        //   SENDMAIL(
        //     {
        //       from: process.env.EMAIL_NAME,
        //       to: userBuy.email,
        //       subject: "End auction",
        //       text: `you have successfully won the auctione NFT item with tokenId ${tokenId}`,
        //       html: HTML_TEMPLATE(tokenId),
        //     },
        //     (info) => {
        //       console.log("Email sent successfully");
        //       console.log("MESSAGE ID: ", info.messageId);
        //     }
        //   );
        //   SENDMAIL(
        //     {
        //       from: process.env.EMAIL_NAME,
        //       to: ownerAuction.email,
        //       subject: "End auction",
        //       text: `Your auction nft with tokenId: ${tokenId} is end`,
        //       html: HTML_TEMPLATE(tokenId),
        //     },
        //     (info) => {
        //       console.log("Email sent successfully");
        //       console.log("MESSAGE ID: ", info.messageId);
        //     }
        //   );
        // }
      // });
      return HttpMethodStatus.ok(
        res,
        `auction success with tokenId: ${nft.tokenId} with duration: ${auctionTime}`,
        nft
      );
    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

export const getAuction = async (req, res) => {
  try {
    const { tokenId } = req.body;

    const nft = await NFT.findOne({ tokenId: tokenId });

    if (!nft)
      return HttpMethodStatus.badRequest(
        res,
        `tokenId not exist with: ${tokenId}`
      );

    const auction = await Auction.findById(nft.auction._id);
    auction.listAuction.reverse();
    // .populate({
    //   path: "",
    // });

    return HttpMethodStatus.ok(res, `get auction success`, auction);
  } catch (error) {}
};

export const auctionNFT = async (req, res) => {
  try {
    const { tokenId, walletAddress, price } = req.body;

    const priceNumber = Number(price);

    const currentDate = utcToZonedTime(new Date(), vietnamTimezone);
    const timestampNow = currentDate.getTime();

    const nftAuction = await NFT.findOne({ tokenId: tokenId });

    const auction = await Auction.findById(nftAuction.auction._id);

    if (!auction) {
      return HttpMethodStatus.badRequest(res, "auction note exist");
    }

    if (timestampNow >= auction.endAuction) {
      return HttpMethodStatus.badRequest(
        res,
        `auction was ended ${timestampNow} ${auction.endAuction}`
      );
    }

    if (priceNumber < auction.minPrice) {
      return HttpMethodStatus.badRequest(
        res,
        `minimum price is ${auction.minPrice}`
      );
    }
    if (
      auction.listAuction.length !== 0 &&
      priceNumber <= auction.listAuction[auction.listAuction.length - 1].price
    ) {
      return HttpMethodStatus.badRequest(
        res,
        "new price must not small than previous price"
      );
    }

    const wallet = await WalletSchema.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!wallet)
      return HttpMethodStatus.badRequest(
        res,
        `wallet not exist with ${walletAddress}`
      );

    const updateAuction = await Auction.findByIdAndUpdate(
      auction._id,
      {
        $push: {
          listAuction: {
            walletAddress: walletAddress,
            user: wallet.owner,
            price: priceNumber,
            time: timestampNow,
          },
        },
      },
      { new: true }
    );
    //   .populate({
    //     path: "nft",
    //     select: "_id tokenId orderId owner uri name price favorite",
    //   });
    return HttpMethodStatus.ok(
      res,
      `auction success by ${walletAddress}`,
      updateAuction
    );
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
    const { address } = req.body;

    const wallet = await WalletSchema.findOne({
      walletAddress: address.toLowerCase(),
    });
    if (!wallet) {
      return HttpMethodStatus.badRequest(res, "Wallet not exist");
    }
    const auctions = await Auction.find({ winner: wallet._id }).populate({
      path: "nft",
      // select: "_id tokenId orderId owner uri name price favorite",
    });

    return HttpMethodStatus.ok(res, "get list auction success", auctions);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
