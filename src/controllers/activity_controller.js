import Activity from "../models/activity.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import { activityType } from "../utility/enum.js";
import HttpMethodStatus from "../utility/static.js";

export const activityLikedByOther = async (req, res) => {
  try {
    const {walletAddress} = req.body

    const user = await User.findOne({walletAddress: walletAddress.toLowerCase()})

    if(!user){
        return HttpMethodStatus.badRequest(res, 'user not exist')
    }

    // const nfts = await NFT.find({seller: user._id})

    const activity = await Activity.find({ user:user._id ,type: activityType.LIKE_NFT })
    .populate({path: 'interactiveUser', select: "_id name walletAddress"})
    .populate({path: 'nft', select: "_id tokenId orderId walletOwner name uri"})
    // let newActivity = []
    // activity.forEach((e) => {
    //     nfts.forEach((nft) => {
    //         if(nft._id.equals(e.nft._id)){
    //             newActivity.push(e)
    //         }
    //     })
    //     // console.log(e.nft._id)
    // })

    return HttpMethodStatus.ok(res, "get activity like NFT success", activity);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `${error}`);
  }
};
