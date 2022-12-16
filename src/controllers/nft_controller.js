import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";

export const addNFT = async (req, res)  => {
    try {
        const data = req.body
        const isNftExist = await NFT.findOne({'nftID': data.nftID})
        if(isNftExist){
            return HttpMethodStatus.badRequest(res, 'nft is exist')
        }

    const newNft = new NFT({
        nftID: data.nftID,
        // orderID: 
        addressOwner: data.addressOwner,
        // uri: {type: String,default: '',},
        nameNFT: data.nameNFT,
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
