import { Wallet } from "ethers"
import NFT from "../models/nft.js"
import WalletSchema from "../models/wallet.js"
import HttpMethodStatus from "../utility/static.js"
import { address, statusNFT } from "../utility/enum.js"

export const updateSellerOnStock = async(req, res) =>{
    try {
    const seller = await WalletSchema.findById("648fce0ac17d70451ccd6798")

    const nfts = await NFT.updateMany({status: statusNFT.ONSTOCK},
        { $set: 
            {
                seller: seller._id
            }
        },
        { new: true })

    return HttpMethodStatus.ok(res, `update seller success`, nfts)
    } catch (error) {
      return HttpMethodStatus.badRequest(res, `error on updateSellerOnStock: ${error.message}`)  
    }
}

export const updateSellerNFT = async(req, res) =>{
    try {

    const { tokenId, address} = req.body
    const seller = await WalletSchema.findOne({walletAddress: address.toLowerCase()})

    const nfts = await NFT.findOneAndUpdate({tokenId: tokenId},
        { $set: 
            {
                seller: seller._id
            }
        },
        { new: true })

    return HttpMethodStatus.ok(res, `update seller success`, nfts)
    } catch (error) {
      return HttpMethodStatus.badRequest(res, `error on updateSellerOnStock: ${error.message}`)  
    }
}

export const updateOwnerMarketplaceNFT = async (req, res) =>{
    try {
        const {tokenId} = req.body

        const nft = await NFT.findOneAndUpdate(tokenId, {
            $set: {
                walletOwner: address.ADDRESS_MERKETPLACE,
                owner: null,
            }
        },{ new: true })
        return HttpMethodStatus.ok(res, 'update owner marketplace success', nft)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, `error on updateOwnerMarketplaceNFT ${error.message}`)
    }
}