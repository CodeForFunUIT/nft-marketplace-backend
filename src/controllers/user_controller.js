import HttpMethodStatus from "../utility/static.js";
import User from "../models/user.js";

export const getAllUser = async (req, res) => {
    const users = await User.find({});

    HttpMethodStatus.ok(res, 'get Users success' ,users)
}

export const getNFTUserFromMongo = async (req, res) => {
    try {
        const {address} = req.body

        const users = await User.findOne({"walletAddress": address})
        if(!users){
            return HttpMethodStatus.badRequest(res, 'User not exist')
        }

        return HttpMethodStatus.ok(res, 'list NFT', users.listNFT)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}

export const isUserExist = async (req, res) => {
    try {
        const {address} = req.body

        const users = await User.findOne({"walletAddress": address})
        if(!users){
            return HttpMethodStatus.badRequest(res, 'User not exist')
        }

        return HttpMethodStatus.ok(res, 'userExist', true)

    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}


