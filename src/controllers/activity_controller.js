import Activity from "../models/activity.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import { activityType } from "../utility/enum.js";
import HttpMethodStatus from "../utility/static.js";
import { ethers } from "ethers";
import {contractMarketPlace} from "../utility/contract.js"
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({path: '../../config/config.env'})

const etherscanProvider = new ethers.providers.EtherscanProvider('goerli');
const provider = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
);
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


export const activityTransaction = async (req, res) => {
  try {
    const {walletAddress} = req.body
    const history = await etherscanProvider.getHistory(walletAddress);
    let newHistory = [];
    for(const tx of history){
      
      // console.log(tx['data'].substring(2,10))
      // axios.get(`https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/${tx['data'].substring(2,10)}`).then(
      //   (res) => {
      //     if(res.status === 200){
      //       console.log(tx.blockNumber)
      //        console.log(res.data)
      //        method = res.data
      //       }
          
      //   }
      // ).catch(error => {
      //   console.log(tx.blockNumber)
      //   console.log('error');
      //   method = "Tranfer"
      // });
      newHistory.push({
        'value': ethers.utils.formatEther(tx.value),
        'from': tx.from,
        'to': tx.to,
        'timestamp': tx.timestamp,
        'method': tx.data.substring(2,10),
        'blockNumber': tx.blockNumber,
      })
    }


    return HttpMethodStatus.ok(res, `get transfer success`, newHistory)
  
  } catch (e) {
    return HttpMethodStatus.badRequest(res, `error on activity transfer ${e.message}`)
  }
}