import Jwt  from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import statusNFT from "../utility/enum.js";

const INFURA_ID = '615672c98038474aa00db41473c787f8'
const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${INFURA_ID}`)
const ERC20_ABI_marketPlace = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeDecimal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeRate","type":"uint256"}],"name":"FeeRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderMatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"},{"internalType":"address","name":"paymentToken_","type":"address"},{"internalType":"uint256","name":"price_","type":"uint256"}],"name":"addOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"addPaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"executeOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeDecimal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"isPaymentTokenSupported","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"},{"internalType":"address","name":"seller_","type":"address"}],"name":"isSeller","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nftContract","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"feeDecimal_","type":"uint256"},{"internalType":"uint256","name":"feeRate_","type":"uint256"}],"name":"updateFeeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeRecipient_","type":"address"}],"name":"updateFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"}
]
const ERC20_ABI_NNGToken = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}
]
const ERC20_ABI_NFT = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to_","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"baseTokenURI_","type":"string"}],"name":"updateBaseTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"}
]
const addressMarketPlace = '0x9b8CE88feAc9CA68AB3F5C393177D83134b6C00c'
const addressNNGToken = '0xFf24e9Ce8D1c32f01B24bE7b1C9BED386D43c22F'
const addressNFT = '0x4FB41e38E38Fb7Ba36AE9Aee9D9B9419ffAD7A5A' 

const contractMarketPlace = new ethers.Contract(addressMarketPlace, ERC20_ABI_marketPlace, provider)
const contractNNGToken = new ethers.Contract(addressNNGToken, ERC20_ABI_NNGToken, provider)
const contractNFT = new ethers.Contract(addressNFT, ERC20_ABI_NFT, provider)

/// add order và lưu vào db
export const addOrder = async (req, res) => {
    try {
        const eventMarketPlace = await contractMarketPlace.queryFilter('OrderAdded')
        const newIndex = eventMarketPlace.length - 1

        const isContractExist = await EventOrderAdd.findOne({'orderId': eventMarketPlace[newIndex].args[0]}) 

        if(isContractExist){
           return HttpMethodStatus.badRequest(res, 'orderId exist')
        }
        // const nft = await NFT.findOneAndUpdate({'nftID': eventMarketPlace[newIndex].args[2]}, 
        // {"$set": {price: 250000000000000000000, status: "onStock", addressOwner: eventMarketPlace[newIndex].args[1].toLowerCase()}}).exec();
        const nft = await NFT.findOneAndUpdate(
            {'tokenId': eventMarketPlace[newIndex].args[2]},
            {"$set": {price: eventMarketPlace[newIndex].args[4], 
                status: statusNFT.SELLING,
                orderId: eventMarketPlace[newIndex].args[0],}
            }).exec();
        
        const newEventOrderAdd = new EventOrderAdd({
            transactionHash: eventMarketPlace[newIndex].transactionHash,
            orderId: eventMarketPlace[newIndex].args[0],
            seller : eventMarketPlace[newIndex].args[1].toLowerCase(),
            // buyer :eventMarketPlace[newIndex].args[2],
            tokenId :eventMarketPlace[newIndex].args[2],
            paymentToken :eventMarketPlace[newIndex].args[3],
            price :eventMarketPlace[newIndex].args[4],
            status: statusNFT.SELLING,
            name: nft.name
        });

        ///Save event
        await newEventOrderAdd.save((error, data) => {
            if(error){
                return HttpMethodStatus.badRequest(res, error.message)
            }
            HttpMethodStatus.created(res, 'add order success!', data );
        });
      
    } catch (error) {
      return HttpMethodStatus.internalServerError(res, error.message)
    }
};

/// add order và lưu vào db
export const addOrderManual = async (req, res) => {
    try {
        const data = req.body

        const isContractExist = await EventOrderAdd.findOne({'orderId': data.orderId}) 

        if(isContractExist){
           return HttpMethodStatus.badRequest(res, 'orderId exist')
        }
      const nft = await NFT.findOneAndUpdate(
            {'tokenId': data.tokenId},
            {"$set": {price: data.price, 
                status: statusNFT.SELLING,
                orderId: data.orderId,}
            }).exec();
        
        const newEventOrderAdd = new EventOrderAdd({
            transactionHash: data.transactionHash,
            orderId: data.orderId,
            seller : data.seller.toLowerCase(),
            // buyer :eventMarketPlace[newIndex].args[2],
            tokenId :data.tokenId,
            paymentToken : data.paymentToken,
            price :data.price,
            status: statusNFT.SELLING,
            name: nft.name
        });

        ///Save event
        newEventOrderAdd.save((error, data) => {
            if(error){
                return HttpMethodStatus.badRequest(res, error.message)
            }
            HttpMethodStatus.created(res, 'add order success!', data );
        });
      
    } catch (error) {
      return HttpMethodStatus.internalServerError(res, error.message)
    }
};

export const hackOrder = async (req, res) => {
    try {
        const {transactionHash, orderId, seller,tokenId,paymentToken, price, name} = req.body

        const newEventOrderAdd = new EventOrderAdd({
            transactionHash: transactionHash,
            orderId: orderId,
            seller : seller.toLowerCase(),
            // buyer :eventMarketPlace[newIndex].args[2],
            tokenId :tokenId,
            paymentToken :paymentToken,
            price :price,
            status: statusNFT.SELLING,
            name: name,
        });

        ///Save event
        await newEventOrderAdd.save((error, data) => {
            if(error){
                return HttpMethodStatus.badRequest(res, error.message)
            }
            HttpMethodStatus.created(res, 'add order success!', data );
        });
      
    } catch (error) {
      return HttpMethodStatus.internalServerError(res, error.message)
    }
};

/// lấy order từ blochain
export const getOrdersFromBlochain = async (req, res) => {
    const orderAdds = await contractMarketPlace.queryFilter('OrderAdded')
    const orderMatchs = await contractMarketPlace.queryFilter('OrderMatched')
    const orderCancel = await contractMarketPlace.queryFilter('OrderCancelled')

    let listOrderAdd = orderAdds.map(e => {
        return {
            "orderId": Number(e.args[0]._hex),
            "tokenId" :Number(e.args[2]._hex),
        }
    })
    let listOrderMatch = orderMatchs.map(e => {
        return {
            "orderId": Number(e.args[0]._hex),
            "tokenId" :Number(e.args[2]._hex),
        }
    })
    let listOrderCancel = orderCancel.map(e => {
        return {
            "orderId": Number(e.args[0]._hex),
        }
    })
    listOrderCancel.forEach(cancel =>  removeItemOnce(listOrderAdd,cancel))
    listOrderMatch.forEach(match =>  removeItemOnce(listOrderAdd,match))
    
    function removeItemOnce(arr, value) {
        let index = 0;
        arr.forEach(a => {
            if(a["orderId"] === value["orderId"]){
                arr.splice(index, 1);
                return;
            }else index++;
        })
    }

    return HttpMethodStatus.ok(res, 'list order from blochain',listOrderAdd)   
}


/// lấy order từ mongodb
export const getOrdersFromMongo = async(req, res) => {
    const orders = await EventOrderAdd.find({})
    return HttpMethodStatus.ok(res, 'list order from mongodb', orders)
}

/// lấy tất cả event OrderAdded từ blochain
export const getEventAddOrders = async (req, res) => {
    try {
        const eventMarketPlace = await contractMarketPlace.queryFilter('OrderAdded')
        const convertList = eventMarketPlace.map(e => {
            return {
                "transactionHash": e.transactionHash,
                "orderId": Number(e.args[0]._hex),
                "seller" : e.args[1],
                // buyer :e.args[2],
                "tokenId" :Number(e.args[2]._hex),
                "paymentToken" :e.args[3],
                "price" :  Number(e.args[4]._hex) / Math.pow(10, 17),
            }
        })
        return HttpMethodStatus.ok(res, 'get all event add orders in bloc chain', convertList)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}
/// lấy tất cả event OrderMatched
export const getEventOrderMatch = async (req, res) => {
    try {
        const eventMarketPlace = await contractMarketPlace.queryFilter('OrderMatched')
        const convertList = eventMarketPlace.map(e => {
            return {
                "transactionHash": e.transactionHash,
                "orderId": Number(e.args[0]._hex),
                "seller" : e.args[1],
                "buyer" :e.args[2],
                "tokenId" :Number(e.args[3]._hex),
                "paymentToken" :e.args[4],
                "price" :  Number(e.args[5]._hex) 
                // / Math.pow(10, 17),
            }
        })
        HttpMethodStatus.ok(res, 'get all event buy orders in bloc chain', convertList)
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}
/// mua order thì user mua sẽ tăng order
export const executeOrder = async (req, res) => {
    try {

        const {seller, buyer, orderId} = req.body

        const order = await EventOrderAdd.findOne({"orderId": orderId})
        if(!order){
            return HttpMethodStatus.badRequest(res, 'order not exist')
        }

        const orderExecute = await EventOrderAdd.findOneAndDelete({"orderId": orderId})

        const isBuyerExist = await User.findOneAndUpdate({"walletAddress": buyer.toLowerCase()}, {"$push": {"listNFT": orderExecute.tokenId}, }) 

        const isSellerExist = await User.findOneAndUpdate({"walletAddress": seller.toLowerCase()}, {"$pull": {"listNFT": orderExecute.tokenId}}) 

        await NFT.findOneAndUpdate({"tokenId": orderExecute.tokenId}, {"$set":{"addressOwner": buyer, "status": statusNFT.ONSTOCK}})


        if(!isBuyerExist){
            return HttpMethodStatus.badRequest(res, 'buyer not exist!!')
        }

        const userBuy = await User.findOne({"walletAddress": buyer.toLowerCase()})

        if(!isSellerExist){
            return HttpMethodStatus.badRequest(res, 'seller not exist!!')
        }

        return HttpMethodStatus.ok(res, 'execute success!', userBuy)
        
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}


///
export const cancelOrder = async(req, res) => {
    try {

        const { orderId } = req.body

        const order = await EventOrderAdd.findOne({"orderId": orderId})
        if(!order){
            return HttpMethodStatus.badRequest(res, 'order not exist')
        }
        
        await EventOrderAdd.findOneAndDelete({"orderId": orderId})

        await NFT.findOneAndUpdate({tokenId: order.tokenId}, {status: statusNFT.ONSTOCK});
        
        const orders = await EventOrderAdd.find({})

        return HttpMethodStatus.ok(res, 'cancel success!', orders)
        
    } catch (error) {
        return HttpMethodStatus.badRequest(res, error.message)
    }
}






