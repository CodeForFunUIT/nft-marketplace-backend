import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import WalletSchema from "../models/wallet.js";
import { statusNFT, address } from "../utility/enum.js";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";
import { contractMarketPlace } from "../utility/contract.js";
import Auction from "../models/auction.js";
import mongoose from "mongoose";

export const addAuctionOrder = async (req, res) => {
  try {
    const { endAuction, walletAddress, minPrice, tokenId } = req.body;
    const userId = req.userId
    const startDate = utcToZonedTime(new Date(), vietnamTimezone);
    const endDate = utcToZonedTime(new Date(endAuction), vietnamTimezone);
    const now = utcToZonedTime(new Date(), vietnamTimezone);

    if (now.getTime() > endDate.getTime()) {
      return HttpMethodStatus.badRequest(
        res,
        `invalid end date ${endDate} \n now: ${now}`
      );
    }

    const nft = await NFT.findOne({tokenId: tokenId})

    if(nft.auction == statusNFT.AUCTION){
      return HttpMethodStatus.badRequest(res, `this NFT is on auction`)
    }

    const sellerAddress = await WalletSchema.findOne({
      walletAddress: walletAddress,
    });

    if (!sellerAddress) {
      return HttpMethodStatus.badRequest(
        res,
        `wallet address not exist with address: ${sellerAddress}`
      );
    }

    const auction = new Auction({
      minPrice: Number(minPrice),
      endAuction: endAuction,
      sellerAddress: sellerAddress.walletAddress,
      seller: sellerAddress.owner._id,
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
            orderId: 0,
            // walletOwner: address.ADDRESS_MERKETPLACE,
            // owner: null,
            // seller: sellerAddress._id,
            auction: data._id,
          },
        }
      ).exec();

      if (!nft) {
        return HttpMethodStatus.badRequest(res, "nft not exist");
      }
      schedule.scheduleJob(endDate, async () => {
        const auction = await Auction.findById(data._id);
        const sortNFT = auction.listAuction.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        /// nếu không có ai đấu giá
        if (sortNFT.length === 0) {
            const walletOwner = await WalletSchema.findById(nft.seller._id)

            // if(!walletOwner) return HttpMethodStatus.badRequest(res, `wallet not exist ${walletOwner.walletAddress}`)
    
            await NFT.findOneAndUpdate(
              { auction: auction._id },
              { price: 0,
                status: statusNFT.ONSTOCK,
                orderId: 0,
                walletOwner: walletOwner.walletAddress,
                owner: walletOwner.owner,
                seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
              }
            );
          // return HttpMethodStatus.ok(
          //   res,
          //   "Auction end NFT no one auction",
          //   seller
          // );
        } else {
          const buyer = sortNFT[0].walletAddress;
          const userBuy = await WalletSchema.findOne({
            walletAddress: buyer.toLowerCase(),
          });
          await Auction.findByIdAndUpdate(
            auction._id,
            { winner: userBuy._id, timeOutAuction: endDate.getTime() + 86400000 }
          );
        }
      });
      return HttpMethodStatus.ok(res, `auction success with tokenId: ${nft.tokenId}`,nft)
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

    const auction = await Auction.findById(nft.auction._id)
    // .populate({
    //   path: "",
    // });

    return HttpMethodStatus.ok(res, `get auction success`, auction);
  } catch (error) {}
};

export const auctionNFT = async (req, res) => {
  try {
    const {  tokenId, walletAddress, price} = req.body;

    const priceNumber = Number(price)

    const currentDate = utcToZonedTime(new Date(), vietnamTimezone);
    const timestampNow = currentDate.getTime();

    const nftAuction = await NFT.findOne({ tokenId: tokenId });

    const auction = await Auction.findById(nftAuction.auction._id);

    if (!auction) {
      return HttpMethodStatus.badRequest(res, "auction note exist");
    }

    if (timestampNow >= auction.endAuction) {
      return HttpMethodStatus.badRequest(res, "auction was ended");
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

    const wallet = await WalletSchema.findOne({ walletAddress: walletAddress.toLowerCase() });

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
    )
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

    const wallet = await WalletSchema.findOne({ walletAddress: address.toLowerCase() });
    if (!wallet) {
      return HttpMethodStatus.badRequest(res, "Wallet not exist");
    }
    const auctions = await Auction.find({ winner: wallet._id })
    .populate({
      path: "nft",
      // select: "_id tokenId orderId owner uri name price favorite",
    });

    return HttpMethodStatus.ok(res, "get list auction success", auctions);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
