import { Wallet } from "ethers";
import NFT from "../models/nft.js";
import WalletSchema from "../models/wallet.js";
import HttpMethodStatus from "../utility/static.js";
import { address, statusNFT } from "../utility/enum.js";
import User from "../models/user.js";
import Image from "../models/image.js";
import Auction from "../models/auction.js";
import mongoose from "mongoose";
import { contractNFT, contractNNGToken } from "../utility/contract.js";
import { openLootBox } from "../utility/open_loot_box.js";

export const updateSellerOnStock = async (req, res) => {
  try {
    const seller = await WalletSchema.findById("648fce0ac17d70451ccd6798");

    const nfts = await NFT.updateMany(
      { status: statusNFT.ONSTOCK },
      {
        $set: {
          seller: seller._id,
        },
      },
      { new: true }
    );

    return HttpMethodStatus.ok(res, `update seller success`, nfts);
  } catch (error) {
    return HttpMethodStatus.badRequest(
      res,
      `error on updateSellerOnStock: ${error.message}`
    );
  }
};

export const updateSellerNFT = async (req, res) => {
  try {
    const { tokenId, address } = req.body;
    const seller = await WalletSchema.findOne({
      walletAddress: address.toLowerCase(),
    });

    const nfts = await NFT.findOneAndUpdate(
      { tokenId: tokenId },
      {
        $set: {
          seller: seller._id,
        },
      },
      { new: true }
    );

    return HttpMethodStatus.ok(res, `update seller success`, nfts);
  } catch (error) {
    return HttpMethodStatus.badRequest(
      res,
      `error on updateSellerOnStock: ${error.message}`
    );
  }
};

export const updateOwnerMarketplaceNFT = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const nft = await NFT.findOneAndUpdate(
      { tokenId: tokenId },
      {
        $set: {
          walletOwner: address.ADDRESS_MERKETPLACE,
          owner: null,
        },
      },
      { new: true }
    );
    return HttpMethodStatus.ok(res, "update owner marketplace success", nft);
  } catch (error) {
    return HttpMethodStatus.badRequest(
      res,
      `error on updateOwnerMarketplaceNFT ${error.message}`
    );
  }
};

export const updateOwnerNFT = async (req, res) => {
  try {
    const { tokenId, walletAddress } = req.body;

    const wallet = await WalletSchema.findOne({ walletAddress, walletAddress });

    const nft = await NFT.findOneAndUpdate(
      { tokenId: tokenId },
      {
        walletOwner: wallet.walletAddress,
        owner: wallet.owner,
      },
      { new: true }
    );

    wallet.listNFT.push(nft)
    await wallet.save()
    return HttpMethodStatus.ok(
      res,
      `update owner NFT with address: ${walletAddress}`,
      nft
    );
  } catch (error) {}
};

export const removeWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          walletList: walletId,
        },
      },
      { new: true }
    );
    await WalletSchema.findByIdAndDelete(walletId);
    return HttpMethodStatus.ok(res, "update wallet list success", user);
  } catch (error) {
    return HttpMethodStatus.badRequest(
      res,
      `error on removeWallet ${error.message}`
    );
  }
};

export const updateIsFinishedKYCNFT = async (req, res) => {
  try {
    const userId = req.userId;
    const { isFinishedKYC } = req.body;
    const user = await User.findByIdAndUpdate(userId, {
      $set: {
        isFinishedKYC: isFinishedKYC,
      },
    });

    return HttpMethodStatus.ok(res, `update success`, user);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error on updateIsFinishedKYCNFT`);
  }
};

export const addOverviewNFT = async (req, res) => {
  try {
    const { tokenId, overviewBase64 } = req.body;

    let buff = new Buffer.from(overviewBase64, "base64");
    let rawOverview = buff.toString("ascii");

    const overview = rawOverview.replace(/[\n\t]/g, "");

    const nft = await NFT.findOneAndUpdate(
      { tokenId: tokenId },
      {
        overview: overview,
      },
      { new: true }
    );

    return HttpMethodStatus.ok(res, `update overview success`, nft);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `eror ${error.message}`);
  }
};

export const addOverviewImage = async (req, res) => {
  try {
    const { id, overviewBase64 } = req.body;

    let buff = new Buffer.from(overviewBase64, "base64");
    let rawOverview = buff.toString("ascii");

    const overview = rawOverview.replace(/[\n\t]/g, "");

    const img = await Image.findById(id);

    if (typeof img.overview !== "undefined")
      return HttpMethodStatus.badRequest(
        res,
        `this image already have overview `
      );

    const image = await Image.findByIdAndUpdate(
      id,
      {
        overview: overview,
      },
      { new: true }
    );

    if (!image)
      return HttpMethodStatus.badRequest(res, `image not exist with id: ${id}`);

    return HttpMethodStatus.ok(res, `update success`, image);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error on ${error.message}`);
  }
};

export const updateOverviewAllNFT = async (req, res) => {
  const listNFT = await NFT.find();

  listNFT.forEach(async (nft) => {
    const image = await Image.findById(nft.image._id).select("overview");
    nft.overview = image.overview;
    nft.save();
  });
};

export const getNFTAuction = async (req, res) => {
  const listNFT = await NFT.find();

  let auctionsNFT = [];

  listNFT.forEach((nft) => {
    if (nft.auction) {
      auctionsNFT.push(nft);
    }
  });
  return HttpMethodStatus.ok(res, `list auction NFT`, auctionsNFT);
};

export const removeAuctionFromAllNFT = async (req, res) => {
  const listNFT = await NFT.find();

  listNFT.forEach(async (nft) => {
    if (nft.auction) {
      await Auction.findByIdAndDelete(nft.auction);
      nft.auction = null;
      nft.status = statusNFT.ONSTOCK;
      await nft.save();
    }
  });

  const nfts = await NFT.find();

  return HttpMethodStatus.ok(res, `list after delete auction NFT`, nfts);
};

export const changeNFTToOnstock = async (req, res) => {
  const { tokenId, walletOwner } = req.body;

  const wallet = await WalletSchema.findOne({ walletAddress: walletOwner });

  const nft = await NFT.findOneAndUpdate(
    { tokenId: tokenId },
    {
      status: statusNFT.ONSTOCK,
      price: 0,
      orderId: 0,
      owner: wallet.owner._id,
      walletOwner: walletOwner,
      seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
    },
    { new: true }
  );

  return HttpMethodStatus.ok(res, `update success`, nft);
};

export const getOwnerFromBlockchain = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const address = await contractNFT.ownerOf(tokenId);
    // const address = await contractNNGToken.owner();
    return HttpMethodStatus.ok(res, `success`, address);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error ${error.message}`);
  }
};

export const getAllNFTFromBlockchain = async (req, res) => {
  let listNFT = [];

  try {
    for (let index = 1; index < 100; index++) {
      const address = await contractNFT.ownerOf(index);
      listNFT.push({ address: address, tokenId: index });
    }
    // const address = await contractNNGToken.owner();
    // return HttpMethodStatus.ok(res, `success`, address)
  } catch (error) {
    return HttpMethodStatus.ok(res, `error ${error.message}`, listNFT);
  }
};

export const updateMissingNFT = async (req, res) => {
  let listNFT = [];

  try {
    for (let index = 1; index < 100; index++) {
      const address = await contractNFT.ownerOf(index);
      listNFT.push({ address: address.toLowerCase(), tokenId: index });
    }
    // const address = await contractNNGToken.owner();
    // return HttpMethodStatus.ok(res, `success`, address)
  } catch (error) {
    listNFT.forEach(async (nft) => {
      const findNFT = await NFT.findOne({ tokenId: nft.tokenId });

      const wallet = await WalletSchema.findOne({ walletAddress: nft.address });

      if (!findNFT && wallet) {
        const catalyst = openLootBox();

        const randomImage = await Image.aggregate([
          { $match: { isUse: false, catalyst: catalyst } },
          { $sample: { size: 1 } },
        ]);

        if (randomImage.length > 0) {
          const selectedImage = randomImage[0];

          const image = await Image.findById(selectedImage._id);

          const saveNft = new NFT({
            tokenId: nft.tokenId,
            orderId: 0,
            walletOwner: wallet.walletAddress.toLowerCase(),
            owner: wallet.owner._id,
            seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
            image: image._id,
            uri: image.url,
            name: image.name,
            status: statusNFT.ONSTOCK,
            tagNFT: image.tagNFT,
            subTagNFT: image.subTagNFT,
            catalyst: image.catalyst,
            overview: image.overview,
          });

          await saveNft.save(async (err, data) => {
            if (err)
              return HttpMethodStatus.badRequest(
                res,
                `error on save nft ${err.message} tokenId: ${nft.tokenId}`
              );
            if (data) {
              wallet.listNFT.push(data._id);
              await wallet.save();
            }
          });
        }
      }
    });

    return HttpMethodStatus.ok(res, `error ${error.message}`, listNFT);
  }
};

export const resetWalletAndPushNFT = async (req, res) =>{
    try {
        const {address, listToken} = req.body
        let listPushNFT = []
        let promises = []
        
        listToken.forEach((tokenId) => {
            promises.push(new Promise(async (resolve, reject) => {
                const nft = await NFT.findOne({tokenId: Number(tokenId)})
                listPushNFT.push(nft)
                resolve(nft)
            }))
        })

        await Promise.all(promises)
        const wallet = await WalletSchema.findOneAndUpdate({walletAddress: address.toLowerCase()},
            {
                listNFT: listPushNFT
            },
            { new: true}
        )
        return HttpMethodStatus.ok(res, `update success`, wallet)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, `error ${error.message}`)
    }
}
