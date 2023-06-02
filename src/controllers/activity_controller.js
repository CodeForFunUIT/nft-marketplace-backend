import Activity from "../models/activity.js";
import NFT from "../models/nft.js";
import User from "../models/user.js";
import { activityType } from "../utility/enum.js";
import HttpMethodStatus from "../utility/static.js";
import { ethers } from "ethers";
import { contractMarketPlace } from "../utility/contract.js"
import dotenv from "dotenv";
import axios from "axios";
import Transaction from "../models/transaction.js";

dotenv.config({ path: '../../config/config.env' })

const etherscanProvider = new ethers.providers.EtherscanProvider('goerli');
const provider = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${process.env.INFURA_ID}`
);
export const activityLikedByOther = async (req, res) => {
  try {
    const { walletAddress } = req.body

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })

    if (!user) {
      return HttpMethodStatus.badRequest(res, 'user not exist')
    }

    // const nfts = await NFT.find({seller: user._id})

    const activity = await Activity.find({ user: user._id, type: activityType.LIKE_NFT })
      .populate({ path: 'interactiveUser', select: "_id name walletAddress" })
      .populate({ path: 'nft', select: "_id tokenId orderId walletOwner name uri" })
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


export const filterTransaction = async (req, res) => {
  const { walletAddress, filters } = req.body
  const history = await etherscanProvider.getHistory(walletAddress);
  let promises = [];
  for (const tx of history) {
    promises.push(new Promise(
      (resolve, reject) => {
        axios.get(`https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/${tx['data'].substring(2, 10)}`).then(
          (res) => {
            if (res.status === 200) {

              const transaction = new Transaction({
                value: ethers.utils.formatEther(tx.value),
                from: tx.from,
                to: tx.to,
                data: tx.data,
                timestamp: tx.timestamp,
                method: res.data.split('(')[0],
                blockNumber: tx.blockNumber,
                hash: tx.hash,
              })
              resolve(transaction)

            }
          }
        ).catch(error => {
          const transaction = new Transaction({
            hash: tx.hash,
            value: ethers.utils.formatEther(tx.value),
            from: tx.from,
            to: tx.to,
            data: tx.data,
            timestamp: tx.timestamp,
            method: "transfer",
            blockNumber: tx.blockNumber
          })
          resolve(transaction)

        });
      }
    ))
  }
  const transactions = await Promise.all(promises)

  let filterTransactions = [];
  let promisesFilter = []
  // let transactions = []

  if(filters.length === 0){
    return HttpMethodStatus.ok(res, 'filter transaction success', transactions)  
  }

  for (var filter of filters) {
    promisesFilter.push(new Promise(async (resolve, reject) => {
      for (var tx of transactions) {
        if (tx.method === filter) {
          filterTransactions.push(tx)
        }
      }
    }))
  }

  await Promise.all(promises)

  return HttpMethodStatus.ok(res, 'filter transaction success', filterTransactions)
}