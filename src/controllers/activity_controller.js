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

export const activityTransaction = async (req, res) => {
  try {
    const { walletAddress } = req.body
    const transactions = await Transaction.find({});

    if (transactions && transactions.length > 0) {
      return HttpMethodStatus.ok(res, `already have transactions`, transactions)
    }
    const history = await etherscanProvider.getHistory(walletAddress);
    let promises = [];
    for (const tx of history) {
      promises.push(new Promise(
        (resolve, reject) => {
          axios.get(`https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/${tx['data'].substring(2, 10)}`).then(
            (res) => {
              if (res.status === 200) {
                // console.log(tx.blockNumber)
                // console.log(res.data)
                const transaction = new Transaction({
                  value: ethers.utils.formatEther(tx.value),
                  from: tx.from,
                  to: tx.to,
                  data: tx.data,
                  timestamp: tx.timestamp,
                  method: res.data.split('(')[0],
                  blockNumber: tx.blockNumber
                })
                transaction.save((error, data) => {
                  if (error) {
                    return HttpMethodStatus.badRequest(res, `error on save transaction ${error.message}`)
                  } if (data) {
                    resolve(data)
                  }
                })
              }
            }
          ).catch(error => {
            // console.log(tx.blockNumber)
            // console.log('error');
            const transaction = new Transaction({
              value: ethers.utils.formatEther(tx.value),
              from: tx.from,
              to: tx.to,
              data: tx.data,
              timestamp: tx.timestamp,
              method: "transfer",
              blockNumber: tx.blockNumber
            })
            transaction.save((error, data) => {
              if (error) {
                return HttpMethodStatus.badRequest(res, `error on save transaction ${error.message}`)
              } if (data) {
                resolve(data)
              }
            })

          });
        }
      ))
    }
    await Promise.all(promises)

    const saveTransactions = await Transaction.find({});

    if (saveTransactions) {
      return HttpMethodStatus.ok(res, `save transactions success`, saveTransactions)
    }

  } catch (e) {
    return HttpMethodStatus.badRequest(res, `error on activity transfer ${e.message}`)
  }
}

export const filterTransaction = async(req, res) => {
  try {
    const { filters } = req.body
    let filterTransactions = [];
    let promises = []
    for(var filter of filters){
      promises.push(new Promise(async (resolve, reject) => {
      const transactions = await Transaction.find({method: filter})
      filterTransactions = filterTransactions.concat(transactions)
      resolve(transactions)

      }))
    }

    await Promise.all(promises)

    return HttpMethodStatus.ok(res, 'filter transaction success', filterTransactions)
  
  } catch (error) {
    return HttpMethodStatus.badRequest(res, `error on filterTransaction ${error.message}`)
  }
}