import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import Auction from "../models/auction.js";

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
/// TODO not use
export const getNFTUserFromMongo = async (req, res) => {
    try {
        const { address } = req.body;

        var listNFt = [];

        const users = await User.findOne({ walletAddress: address.toLowerCase() });

        if (!users) {
            return HttpMethodStatus.badRequest(res, "User not exist");
        }

        for (let id of users.listNFT) {
            const nft = await NFT.findOne({ tokenId: id });

            listNFt.push(nft);
        }

        return HttpMethodStatus.ok(res, "list NFT", listNFt);
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
        const { address,name } = req.body;

        const user = await User.findOneAndUpdate({walletAddress: address},{ name: name },{new: true});
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
        const {address} = req.data

        const auctions = await Auction.find({seller: address})
            .populate({nft: 'nft', select: '_id tokenId orderId owner uri name price favorite'})
            .populate({path: 'winner', select: '_id walletAddress name'})

        return HttpMethodStatus.ok(res,"get list auction success", auctions)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

/// lấy danh sách NFT mà tôi đấu giá thành công
export const getWinnerAuction = async (req, res) => {
    try {
        const {address} = req.data

        const user = await User.findOne({walletAddress: address.toLowerCase()})
        if(!user){
            return HttpMethodStatus.badRequest(res, "user not exist")
        }
        const auctions = await Auction.find({winner: user._id})
        .populate({nft: 'nft', select: '_id tokenId orderId owner uri name price favorite'})

        return HttpMethodStatus.ok(res,"get list auction success", auctions)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

/// TODO not use
export const addTokenId = async (req, res) => {
    try {
        const { address, tokenId } = req.body;

        const user = await User.findOneAndUpdate(
            { walletAddress: address.toLowerCase() },
            { $addToSet: { listNFT: tokenId } },
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


export const likeNFT = async (req, res) =>{
    try {
      const {tokenId, walletAddress} = req.body
      const nft = await NFT.findOne({tokenId: tokenId})
      if(!nft){
        return HttpMethodStatus.badRequest(res,"nft not exist");
      }
  
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase()}, 
        { $addToSet: { wishList: nft._id }},
        {new: true}).populate({path: "wishList", select: "_id tokenId orderId addressOwner uri name status price"});
      if(!user){
        return HttpMethodStatus.badRequest(res, "user not exist")
      }
      
      return HttpMethodStatus.ok(res, `like nft with tokenId: ${tokenId}`, user)
    } catch (error) {
      return HttpMethodStatus.badRequest(res, error.message)
    }
  }

  export const dislikeNFT = async (req, res) =>{
    try {
      const {tokenId, walletAddress} = req.body
      const nft = await NFT.findOne({tokenId: tokenId})
      if(!nft){
        return HttpMethodStatus.badRequest(res,"nft not exist");
      }
      
      const user = await User.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase()}, 
        { $pull: { wishList: nft._id }},
        { new: true}).populate({path: "wishList", select: "_id tokenId orderId addressOwner uri name status price"});
      if(!user){
        return HttpMethodStatus.badRequest(res, "user not exist")
      }
      
      return HttpMethodStatus.ok(res, `dislike nft with tokenId: ${tokenId}`, user)
    } catch (error) {
      return HttpMethodStatus.badRequest(res, error.message)
    }
  }

export const getWishListNFT = async (req, res) => {
    try {
        const {walletAddress} = req.body

        const user = await User.findOne({walletAddress: walletAddress})
        .populate({path: "wishList", select: "_id tokenId orderId addressOwner uri name status price"});
      
        if(!user){
            return HttpMethodStatus.badRequest(res, "user not exist")
        }

        return HttpMethodStatus.ok(res, `get wish list NFT's ${walletAddress} success`, user)        

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)       
    }
}