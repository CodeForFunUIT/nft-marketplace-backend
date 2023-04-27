import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import { sortByNFT, statusNFT } from "../utility/enum.js";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";
import { utcToZonedTime } from "date-fns-tz";
import Auction from "../models/auction.js";
import Image from "../models/image.js";
import Sharp from "sharp";
import formidable from "formidable";
import fs from "fs";

export const addNFT = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files)  => {
      if (err) {
        return HttpMethodStatus.badRequest(res, err.message);
      }
      const tokenId = fields.tokenId;
      const orderId = fields.orderId;
      const seller = fields.seller.toLowerCase()
      const walletOwner = fields.walletOwner.toLowerCase()
      const name = fields.name;
      const status = fields.status;
      const price = fields.price;
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
        
        const isNftExist = await NFT.findOne({ tokenId: tokenId });
        if (isNftExist) {
          return HttpMethodStatus.badRequest(res, "nft is exist");
        }
    
        const user = await User.findOne({walletAddress: seller})
    
        if(!user){
          return HttpMethodStatus.badRequest(res, "user not exist");
        }
    
        const newNft = new NFT({
          tokenId: tokenId,
          orderId: orderId,
          seller: user._id,
          status: status,
          walletOwner: walletOwner,
          uri: `https://nft-marketplace-backend-z4eu.vercel.app/image/${image._id}` ,
          name: name,
          status: status,
          price: price,
        });
        ///Save nft
        newNft.save((error, nft) => {
          return HttpMethodStatus.created(res, "create new NFT success!", nft);
        });
      })
    });

    // const user = await User.findOneAndUpdate(
    //   { walletAddress: data.addressOwner.toLowerCase() },
    //   { $addToSet: { listNFT: data.tokenId } }
    // );

    // if (!user) {
    //   return HttpMethodStatus.badRequest(res, "user not exist");
    // }

  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

export const addNFTtest = async (req, res) => {
  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files)  => {
      if (err) {
        return HttpMethodStatus.badRequest(res, err.message);
      }
      const tokenId = fields.tokenId;
      const orderId = fields.orderId;
      const seller = fields.seller.toLowerCase()
      const walletOwner = fields.walletOwner.toLowerCase()
      const name = fields.name;
      const status = fields.status;
      const price = fields.price;
      // const oldPath = files.images.filepath;

      const isNftExist = await NFT.findOne({ tokenId: tokenId });
      if (isNftExist) {
        return HttpMethodStatus.badRequest(res, "nft is exist");
      }
  
      const user = await User.findOne({walletAddress: seller})
  
      if(!user){
        return HttpMethodStatus.badRequest(res, "user not exist");
      }
  
      const newNft = new NFT({
        tokenId: tokenId,
        orderId: orderId,
        seller: user._id,
        status: status,
        walletOwner: walletOwner,
        name: name,
        status: status,
        price: price,
      });
      ///Save nft
      newNft.save((error, nft) => {
        return HttpMethodStatus.created(res, "create new NFT success!", nft);
      });

    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};


export const getNFTs = async (req, res) => {
  const nfts = await NFT.find({}).populate({
    path: "seller",
    select: "_id name walletAddress",
  });

  HttpMethodStatus.ok(res, "get NFT success", nfts);
};

export const getNFTByTokenId = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const nft = await NFT.findOne({ tokenId: tokenId }).populate({
      path: "seller",
      select: "_id name walletAddress",
    });
    if (!nft) {
      return HttpMethodStatus.badRequest(res, `NFT not exist with ${tokenId}`);
    }
    return HttpMethodStatus.ok(res, `get NFT with ${tokenId}`, nft);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const updateOwner = async (req, res) => {
  try {
    const data = req.body;

    const user = await User.findById(data.id);

    if (!user) {
      return HttpMethodStatus.badRequest(res, "user not exist");
    }

    const nft = await NFT.findOneAndUpdate(
      { tokenId: data.tokenId },
      // { addressOwner: data.addressOwner.toLowerCase() },
      { owner: user._id },
      { new: true }
    ).populate({ path: "owner", select: "_id name walletAddress" });

    if (!nft) {
      return HttpMethodStatus.badRequest(res, "nft not exist");
    }

    return HttpMethodStatus.ok(res, "update NFT success", nft);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const updateUri = async (req, res) => {
  const data = req.body;

  try {
    const nft = await NFT.findOneAndUpdate(
      { tokenId: data.tokenId },
      { uri: data.uri },
      { new: true }
    );

    if (!nft) {
      return HttpMethodStatus.badRequest(res, "nft not exist");
    }

    return HttpMethodStatus.ok(res, "update NFT success", nft);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const updateStatusToStock = async (req, res) => {
  const data = req.body;

  try {
    const nft = await NFT.findOneAndUpdate(
      { tokenId: data.tokenId },
      { status: statusNFT.ONSTOCK },
      { new: true }
    );

    if (!nft) {
      return HttpMethodStatus.badRequest(res, "nft not exist");
    }

    return HttpMethodStatus.ok(
      res,
      "update status NFT to onStock success",
      nft
    );
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const filterMinMaxNFT = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.body;

    const nfts = await NFT.find({}).populate({
      path: "owner",
      select: "_id name walletAddress",
    });
    const filterNFTs = nfts.filter((e) => {
      if (e.price <= Number(maxPrice) && e.price >= Number(minPrice)) {
        return true;
      }
      return false;
    });
    return HttpMethodStatus.ok(res, "get list min max NFT", filterNFTs);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const sortNFT = async (req, res) => {
  try {
    const { sortBy } = req.body;
    const nfts = await NFT.find({}).populate({
      path: "owner",
      select: "_id name walletAddress",
    });
    let filterNFTs = [];
    switch (sortBy) {
      case sortByNFT.HIGHEST_PRICE: {
        filterNFTs = nfts.sort((a, b) => b.price - a.price);
        break;
      }
      case sortByNFT.LOWEST_PRICE: {
        filterNFTs = nfts.sort((a, b) => a.price - b.price);
        break;
      }
      case sortByNFT.RECENTLY_SOLD: {
      }
      case sortByNFT.MOST_LIKED: {
      }
      case sortByNFT.OLDEST: {
        filterNFTs = nfts.sort(
          (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );
        break;
      }
    }
    return HttpMethodStatus.ok(res, `get sort NFT by ${sortBy}`, filterNFTs);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const auctionNFT = async (req, res) => {
  try {
    const data = req.body;
    const walletAddress = data.walletAddress.toLowerCase();
    const currentDate = utcToZonedTime(new Date(), vietnamTimezone);
    const timestampNow = currentDate.getTime();

    const nftAuction = await NFT.findOne({ tokenId: data.tokenId });

    const auction = await Auction.findOne({ nft: nftAuction._id });

    if (!auction) {
      return HttpMethodStatus.badRequest(res, "auction note exist");
    }

    if (timestampNow >= auction.endAuction) {
      return HttpMethodStatus.badRequest(res, "auction was ended");
    }

    if (data.price < auction.minPrice) {
      return HttpMethodStatus.badRequest(
        res,
        `minimum price is ${auction.minPrice}`
      );
    }
    if (
      auction.listAuction.length !== 0 &&
      data.price < auction.listAuction[auction.listAuction.length - 1]
    ) {
      return HttpMethodStatus.badRequest(
        res,
        "new price must not small than previous price"
      );
    }
    const updateAuction = await Auction.findByIdAndUpdate(
      auction._id,
      {
        $push: {
          listAuction: {
            walletAddress: walletAddress,
            price: data.price,
            time: timestampNow,
          },
        },
      },
      { new: true }
    )
      .exec()
      .populate({
        path: "nft",
        select: "_id tokenId orderId owner uri name price favorite",
      });
    return HttpMethodStatus.ok(
      res,
      `auction success by ${walletAddress}`,
      updateAuction
    );
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};

export const uploadImageNFT = async (req, res) => {
  // const {price, name, introduction, category, tag} = req.body
  let images = [];
  try {
    if (req.files) {
      const list = images.concat(
        await Promise.all(
          req.files.map(async (e) => {
            const buffer = await Sharp(e.buffer).toBuffer();
            const image = await new Image({ data: buffer }).save();
            return `https://nft-marketplace-backend-z4eu.vercel.app/image/${image._id}`;
          })
        )
      );
      images = [...list];
    } else {
      return res.status(400).send({ msg: "please upload image" });
    }

    return HttpMethodStatus.ok(res, "upload image success", images);
  } catch (e) {
    return HttpMethodStatus.badRequest(res, e.message);
  }
};
export const uploadGifNFT = async (req, res) => {
  try {
  } catch (error) {}
};
