import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";
import NFT from "../models/nft.js";

export const getAllUser = async (req, res) => {
    const users = await User.find({});

    HttpMethodStatus.ok(res, 'get Users success' ,users)
}

export const getNFTUserFromMongo = async (req, res) => {
    try {
        const {address} = req.body

        var listNFt = [];

        const users = await User.findOne({"walletAddress": address.toLowerCase()})

        if(!users){
            return HttpMethodStatus.badRequest(res, 'User not exist')
        }

        for (let id of users.listNFT){
            const nft = await NFT.findOne({'tokenId': id})

            listNFt.push(nft)
        }

        return HttpMethodStatus.ok(res, 'list NFT', listNFt)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

export const isUserExist = async (req, res) => {
    try {
        const {address} = req.body

        const users = await User.findOne({"walletAddress": address.toLowerCase()})
        if(!users){
            return HttpMethodStatus.badRequest(res, 'User not exist')
        }

        return HttpMethodStatus.ok(res, 'userExist', true)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}


export const addTokenId = async (req, res) => {
    try {
        const {address, tokenId} = req.body

        const user = await User.findOneAndUpdate(
            {"walletAddress": address.toLowerCase()},      
            {$addToSet: {'listNFT': tokenId}},
            {new: true}).exec()     

        if(!user){
            return HttpMethodStatus.badRequest(res, 'user not exist')
        }
    
        return HttpMethodStatus.ok(res,'add tokenId success!!!',user)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

export const removeTokenId = async (req, res) => {
    try {
        const {address, tokenId} = req.body

        const user = await User.findOneAndUpdate(
            {"walletAddress": address.toLowerCase()},      
            {$pull: {'listNFT': tokenId}},
            {new: true}).exec()     

        if(!user){
            return HttpMethodStatus.badRequest(res, 'user not exist')
        }
    
        return HttpMethodStatus.ok(res,'remove tokenId success!!!',user)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}


