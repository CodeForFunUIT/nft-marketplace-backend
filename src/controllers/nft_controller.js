import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import { tagsNFT, subTagsNFT, catalystType, sortByNFT, statusNFT } from "../utility/enum.js";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";
import { utcToZonedTime } from "date-fns-tz";
import Auction from "../models/auction.js";
import Image from "../models/image.js";
import formidable from "formidable";
import fs from "fs";
import { openLootBox } from "../utility/open_loot_box.js";
import { Wallet } from "ethers";
import WalletSchema from "../models/wallet.js";

export const mintNFT = async (req, res) => {
  try {
    const { tokenId, walletAddress, isPaid } = req.body
    const  userId = req.userId
    const catalyst = openLootBox();

    const randomImage = await Image.aggregate([
      { $match: { isUse: false, catalyst: catalyst } },
      { $sample: { size: 1 } }
    ]);

    if (randomImage.length > 0) {

      const selectedImage = randomImage[0];

      /// TODO đang suy nghĩ nên cho lặp ảnh hay không
      ///      nếu có thì set isUse: true
      const image = await Image.findById(selectedImage._id)

      const findNFT = await NFT.findOne({tokenId: tokenId})
      if(findNFT) return HttpMethodStatus.badRequest(res, `this nft is exist with tokenId: ${tokenId}`)


      if(!isPaid){
        const currentDate = new Date();
        const vietnamTimeOffset = 7 * 60 * 60 * 1000; 
        const vietnamTime = new Date(currentDate.getTime() + vietnamTimeOffset);
        const nextFreeMint = new Date(currentDate.getTime() + vietnamTimeOffset)
        nextFreeMint.setDate(currentDate.getDate() + 1); // Thêm một ngày
        nextFreeMint.setHours(14, 0, 0, 0); // Đặt giờ thành 7:00:00 AM
        
        await User.findByIdAndUpdate(userId, {
          lastFreeMint: vietnamTime.toJSON(),
          nextFreeMint: nextFreeMint.toJSON()
        })
      }
      const user = await User.findById(userId)

      if (!user) return HttpMethodStatus.badRequest(res, `not exist user with id: ${userId}`)

      const wallet = await WalletSchema.findOne({ walletAddress: walletAddress.toLowerCase() })
      if (!wallet) return HttpMethodStatus.badRequest(res, `not exist wallet with address: ${walletAddress}`)

      const nft = new NFT({
        tokenId: tokenId,
        orderId: 0,
        walletOwner: walletAddress.toLowerCase(),
        owner: user._id,
        seller: wallet._id,
        image: image._id,
        uri: image.url,
        name: image.name,
        status: statusNFT.ONSTOCK,
        tagNFT: image.tagNFT,
        subTagNFT: image.subTagNFT,
        catalyst: image.catalyst,
      })

        nft.save( async (err, data) => {
          if(err) return HttpMethodStatus.badRequest(res, `error on save nft ${err.message}`)
          if(data){
            wallet.listNFT.push(data._id)
            await wallet.save()
            const newNFT = await NFT.findById(data._id)
            // .populate({path: 'image' })
            .populate({path: 'seller' , select: "_id walletAddress"})
            .populate({path: 'owner' ,select: "email firstName lastName" })

            // console.log(tmpNFT)
            return HttpMethodStatus.ok(res, 'add nft success', newNFT);
          }
        }) 


      
    } else {
      return HttpMethodStatus.badRequest(res, "Empty image")
    }


  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};


export const getNFTs = async (req, res) => {
  const nfts = await NFT.find({}).populate({
    path: "seller",
    select: "_id walletAddress ",
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

export const filterNFT = async (req, res) => {
  const { filters } = req.body
  let catalysts = []
  let tagNFTs = []
  let subTagNFTs = []
  try {

    for(var filter of filters){
      if(Object.values(catalystType).includes(filter)){
        catalysts.push(filter)
      }else if(Object.values(tagsNFT).includes(filter)){
        tagNFTs.push(filter)
      }else if(Object.values(subTagsNFT).includes(filter)){
        subTagNFTs.push(filter)
      }else{
        return HttpMethodStatus.badRequest(res, 
          `not exist catalyst ${filter} in catalyst filter: ${Object.values(catalystType)}, in tagsNFT filter: ${Object.values(tagsNFT)},in subTagsNFT filter: ${Object.values(subTagsNFT)} `)
      }
    }  
    const nfts = await NFT.find({
      tagNFT: tagNFTs.length > 0 ? { $in: tagNFTs } : { $exists: true },
      catalyst: catalysts.length > 0 ? { $in: catalysts } : { $exists: true },
      subTagNFT: subTagNFTs.length > 0 ? { $in: subTagNFTs } : { $exists: true },
    }).populate({path: "seller", select: "_id walletAddress"})

    return HttpMethodStatus.ok(res, `filter success with: ${filters}`, nfts)

  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error on filter NFT: ${error.message}`)
  }
}

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

  try {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return HttpMethodStatus.badRequest(res, err.message);
      }

      const tagNFT = fields.tagNFT;
      const subTagNFT = fields.subTagNFT
      const catalyst = fields.catalyst
      const name = fields.name
      const path = files.images.filepath;


      const catalystExist = Object.values(catalystType).includes(catalyst);
      const tagNFTExist = Object.values(tagsNFT).includes(tagNFT);
      const subTagNFTExist = Object.values(subTagsNFT).includes(subTagNFT);

      if (!catalystExist) return HttpMethodStatus.badRequest(res, `not exist catalyst ${catalyst} in catalystType: ${Object.values(catalystType)}`)
      if (!tagNFTExist) return HttpMethodStatus.badRequest(res, `not exist tagNFT ${tagNFT} in tagsNFT: ${Object.values(tagsNFT)}`)
      if (!subTagNFTExist) return HttpMethodStatus.badRequest(res, `not exist subTagNFT ${subTagNFT} subTagNFT: ${Object.values(subTagsNFT)}`)

      fs.readFile(path, async (err, data) => {
        if (err) {
          return HttpMethodStatus.badRequest(res, err.message);
        }
        const image = new Image({
          data,
          name,
          tagNFT,
          subTagNFT,
          catalyst,
          isUse: false,
          url: "url" /// do not delete
        });
        image.save(async (err, resutl) => {
          if (err) return HttpMethodStatus.badRequest(res, `error on save Image ${err.message}`)
          if (resutl) return HttpMethodStatus.ok(res, 'save image success', resutl)
        })
      });

    });
  } catch (err) {
    return HttpMethodStatus.badRequest(res, `error on uploadImageNFT ${err.message}`)
  }
};
export const uploadGifNFT = async (req, res) => {
  try {
  } catch (error) { }
};
