import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";

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
        // uri: {type: String,default: '',},
        name: data.name,
        // status: {type: Number,},
        // chain: ,
        price: data.price,
    });

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

    const data = req.body

    const nft = await NFT.findOneAndUpdate({tokenId: data.tokenId}, {addressOwner: data.addressOwner}, {new: true});

    if(!nft){
        return HttpMethodStatus.badRequest(res, 'nft not exist')
    }

    return HttpMethodStatus.ok(res, 'update NFT success' ,nft)
}


