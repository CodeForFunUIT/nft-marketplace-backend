import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";

export const addNFT = async (req, res)  => {
    try {
        const data = req.body
        const isNftExist = await NFT.findOne({'tokenId': data.tokenId})
        if(isNftExist){
            return HttpMethodStatus.badRequest(res, 'nft is exist')
        }
    
        const newNft = new NFT({
            tokenId: data.tokenId,
            // orderID: 
            addressOwner: data.addressOwner.toLowerCase(),
            uri: data.uri,
            name: data.name,
            status: data.status,
            // chain: ,
            price: data.price,
        });

        const user = await User.findOneAndUpdate(
            {"walletAddress": data.addressOwner.toLowerCase()},      
            {$addToSet: {'listNFT': data.tokenId}})     

        if(!user){
            return HttpMethodStatus.badRequest(res, 'user not exist')
        }

        ///Save nft
        newNft.save((error, nft) => {
            HttpMethodStatus.created(res, 'create new NFT success!', nft);
        });

    } catch (error) {
      console.log(error);
      HttpMethodStatus.internalServerError(res, error.message)
    }
}

export const getNFTs = async (req, res) => {
    const nfts = await NFT.find({});

    HttpMethodStatus.ok(res, 'get NFT success' ,nfts)
}

export const updateOwner = async (req, res) => {
    try {     
        const data = req.body

        const nft = await NFT.findOneAndUpdate({tokenId: data.tokenId}, {addressOwner: data.addressOwner.toLowerCase()}, {new: true});

        if(!nft){
            return HttpMethodStatus.badRequest(res, 'nft not exist')
        }

        return HttpMethodStatus.ok(res, 'update NFT success' ,nft)   
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

export const updateUri = async (req, res) => {

    const data = req.body

    try {
        
        const nft = await NFT.findOneAndUpdate({tokenId: data.tokenId}, {uri: data.uri}, {new: true});

        if(!nft){
            return HttpMethodStatus.badRequest(res, 'nft not exist')
        }

        return HttpMethodStatus.ok(res, 'update NFT success' ,nft)   
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}


