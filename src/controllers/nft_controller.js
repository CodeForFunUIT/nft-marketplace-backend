import HttpMethodStatus from "../utility/static.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import {sortByNFT, statusNFT} from "../utility/enum.js";

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

export const updateStatusToStock = async (req, res) => {

    const data = req.body

    try {
        
        const nft = await NFT.findOneAndUpdate({tokenId: data.tokenId}, {status: statusNFT.ONSTOCK}, {new: true});

        if(!nft){
            return HttpMethodStatus.badRequest(res, 'nft not exist')
        }

        return HttpMethodStatus.ok(res, 'update status NFT to onStock success' ,nft)   
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

export const filterMinMaxNFT = async(req,res) => {
    try {
        const {minPrice, maxPrice} = req.body
    
        const nfts = await NFT.find({});
        const filterNFTs = nfts.filter((e) => {
            if(e.price <= Number(maxPrice) && e.price >= Number(minPrice)){
                return true;
            }
            return false;
        });
        return HttpMethodStatus.ok(res, 'get list min max NFT' ,filterNFTs);
    } catch (error) {
        return HttpMethodStatus.badRequest(res,error.message);
    }
}

export const sortNFT = async(req, res) => {
    try {
        const {sortBy} = req.body
        const nfts = await NFT.find({});
        let filterNFTs = [];
        switch(sortBy){
            case sortByNFT.HIGHEST_PRICE:{
                filterNFTs =  nfts.sort((a, b) => b.price - a.price);
                break;
            }
            case sortByNFT.LOWEST_PRICE:{
                filterNFTs =  nfts.sort((a, b) => a.price - b.price);
                break;
            }
            case sortByNFT.RECENTLY_SOLD:{
                
            }
            case sortByNFT.MOST_LIKED:{
                
            }
            case sortByNFT.OLDEST:{
                filterNFTs = nfts.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                break;
            }
        }
        return HttpMethodStatus.ok(res, `get sort NFT by ${sortBy}` ,filterNFTs);
    } catch (error) {
        return HttpMethodStatus.badRequest(res,error.message);
    }
}

