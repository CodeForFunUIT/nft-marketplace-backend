import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import { statusNFT } from "../utility/enum.js";
import { contractMarketPlace} from "../utility/contract.js";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { vietnamTimezone } from "../utility/vietnam_timezone.js";

/// add order và lưu vào db
export const addOrder = async (req, res) => {
  try {
    const eventMarketPlace = await contractMarketPlace.queryFilter(
      "OrderAdded"
    );
    const newIndex = eventMarketPlace.length - 1;

    const isContractExist = await EventOrderAdd.findOne({
      orderId: eventMarketPlace[newIndex].args[0],
    });

    if (isContractExist) {
      return HttpMethodStatus.badRequest(res, "orderId exist");
    }
    // const nft = await NFT.findOneAndUpdate({'nftID': eventMarketPlace[newIndex].args[2]},
    // {"$set": {price: 250000000000000000000, status: "onStock", addressOwner: eventMarketPlace[newIndex].args[1].toLowerCase()}}).exec();
    const nft = await NFT.findOneAndUpdate(
      { tokenId: eventMarketPlace[newIndex].args[2] },
      {
        $set: {
          price: eventMarketPlace[newIndex].args[4],
          status: statusNFT.SELLING,
          orderId: eventMarketPlace[newIndex].args[0],
        },
      }
    ).exec();

    const newEventOrderAdd = new EventOrderAdd({
      transactionHash: eventMarketPlace[newIndex].transactionHash,
      orderId: eventMarketPlace[newIndex].args[0],
      seller: eventMarketPlace[newIndex].args[1].toLowerCase(),
      // buyer :eventMarketPlace[newIndex].args[2],
      tokenId: eventMarketPlace[newIndex].args[2],
      paymentToken: eventMarketPlace[newIndex].args[3],
      price: eventMarketPlace[newIndex].args[4],
      status: statusNFT.SELLING,
      name: nft.name,
      uri: nft.uri,
    });

    ///Save event
    await newEventOrderAdd.save((error, data) => {
      if (error) {
        return HttpMethodStatus.badRequest(res, error.message);
      }
      HttpMethodStatus.created(res, "add order success!", data);
    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

/// add order và lưu vào db
export const addOrderManual = async (req, res) => {
  try {
    const data = req.body;

    const isContractExist = await EventOrderAdd.findOne({
      orderId: data.orderId,
    });

    if (isContractExist) {
      return HttpMethodStatus.badRequest(res, "orderId exist");
    }
    const nft = await NFT.findOneAndUpdate(
      { tokenId: data.tokenId },
      {
        $set: {
          price: data.price,
          status: statusNFT.SELLING,
          orderId: data.orderId,
        },
      }
    ).exec();

    const newEventOrderAdd = new EventOrderAdd({
      transactionHash: data.transactionHash,
      orderId: data.orderId,
      seller: data.seller.toLowerCase(),
      // buyer :eventMarketPlace[newIndex].args[2],
      tokenId: data.tokenId,
      paymentToken: data.paymentToken,
      price: data.price,
      status: statusNFT.SELLING,
      name: nft.name,
      uri: nft.uri,
    });

    ///Save event
    newEventOrderAdd.save((error, data) => {
      if (error) {
        return HttpMethodStatus.badRequest(res, error.message);
      }
      HttpMethodStatus.created(res, "add order success!", data);
    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

export const hackOrder = async (req, res) => {
  try {
    const {
      transactionHash,
      orderId,
      seller,
      tokenId,
      paymentToken,
      price,
      name,
    } = req.body;

    const newEventOrderAdd = new EventOrderAdd({
      transactionHash: transactionHash,
      orderId: orderId,
      seller: seller.toLowerCase(),
      // buyer :eventMarketPlace[newIndex].args[2],
      tokenId: tokenId,
      paymentToken: paymentToken,
      price: price,
      status: statusNFT.SELLING,
      name: name,
    });

    ///Save event
    await newEventOrderAdd.save((error, data) => {
      if (error) {
        return HttpMethodStatus.badRequest(res, error.message);
      }
      HttpMethodStatus.created(res, "add order success!", data);
    });
  } catch (error) {
    return HttpMethodStatus.internalServerError(res, error.message);
  }
};

/// lấy order từ blochain
export const getOrdersFromBlochain = async (req, res) => {
  const orderAdds = await contractMarketPlace.queryFilter("OrderAdded");
  const orderMatchs = await contractMarketPlace.queryFilter("OrderMatched");
  const orderCancel = await contractMarketPlace.queryFilter("OrderCancelled");

  let listOrderAdd = orderAdds.map((e) => {
    return {
      orderId: Number(e.args[0]._hex),
      tokenId: Number(e.args[2]._hex),
    };
  });
  let listOrderMatch = orderMatchs.map((e) => {
    return {
      orderId: Number(e.args[0]._hex),
      tokenId: Number(e.args[2]._hex),
    };
  });
  let listOrderCancel = orderCancel.map((e) => {
    return {
      orderId: Number(e.args[0]._hex),
    };
  });
  listOrderCancel.forEach((cancel) => removeItemOnce(listOrderAdd, cancel));
  listOrderMatch.forEach((match) => removeItemOnce(listOrderAdd, match));

  function removeItemOnce(arr, value) {
    let index = 0;
    arr.forEach((a) => {
      if (a["orderId"] === value["orderId"]) {
        arr.splice(index, 1);
        return;
      } else index++;
    });
  }

  return HttpMethodStatus.ok(res, "list order from blochain", listOrderAdd);
};

/// lấy order từ mongodb
export const getOrdersFromMongo = async (req, res) => {
  const orders = await EventOrderAdd.find({});
  return HttpMethodStatus.ok(res, "list order from mongodb", orders);
};

/// lấy tất cả event OrderAdded từ blochain
export const getEventAddOrders = async (req, res) => {
  try {
    const eventMarketPlace = await contractMarketPlace.queryFilter(
      "OrderAdded"
    );
    const convertList = eventMarketPlace.map((e) => {
      return {
        transactionHash: e.transactionHash,
        orderId: Number(e.args[0]._hex),
        seller: e.args[1],
        // buyer :e.args[2],
        tokenId: Number(e.args[2]._hex),
        paymentToken: e.args[3],
        price: Number(e.args[4]._hex),
      };
    });
    return HttpMethodStatus.ok(
      res,
      "get all event add orders in block chain",
      convertList
    );
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
/// lấy tất cả event OrderMatched
export const getEventOrderMatch = async (req, res) => {
  try {
    const eventMarketPlace = await contractMarketPlace.queryFilter(
      "OrderMatched"
    );
    const convertList = eventMarketPlace.map((e) => {
      return {
        transactionHash: e.transactionHash,
        orderId: Number(e.args[0]._hex),
        seller: e.args[1],
        buyer: e.args[2],
        tokenId: Number(e.args[3]._hex),
        paymentToken: e.args[4],
        price: Number(e.args[5]._hex),
        // / Math.pow(10, 17),
      };
    });
    HttpMethodStatus.ok(
      res,
      "get all event buy orders in bloc chain",
      convertList
    );
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
// export const executeOrder = async (req, res) => {
//     try {

//         const { seller, buyer, orderId } = req.body

//         const order = await EventOrderAdd.findOne({ "orderId": orderId })
//         if (!order) {
//             return HttpMethodStatus.badRequest(res, 'order not exist')
//         }

//         const orderExecute = await EventOrderAdd.findOneAndDelete({ "orderId": orderId })

//         const isBuyerExist = await User.findOneAndUpdate({ "walletAddress": buyer.toLowerCase() }, { "$push": { "listNFT": orderExecute.tokenId }, })

//         const isSellerExist = await User.findOneAndUpdate({ "walletAddress": seller.toLowerCase() }, { "$pull": { "listNFT": orderExecute.tokenId } })

//         await NFT.findOneAndUpdate({ "tokenId": orderExecute.tokenId }, { "$set": { "addressOwner": buyer, "status": statusNFT.ONSTOCK } })

//         if (!isBuyerExist) {
//             return HttpMethodStatus.badRequest(res, 'buyer not exist!!')
//         }

//         const userBuy = await User.findOne({ "walletAddress": buyer.toLowerCase() })

//         if (!isSellerExist) {
//             return HttpMethodStatus.badRequest(res, 'seller not exist!!')
//         }

//         return HttpMethodStatus.ok(res, 'execute success!', userBuy)

//     } catch (error) {
//         return HttpMethodStatus.badRequest(res, error.message)
//     }
// }
/// mua order thì user mua sẽ tăng order

export const executeOrder = async (req, res) => {
  try {
    const { seller, buyer, orderId } = req.body;

    const order = await EventOrderAdd.findOne({ orderId: orderId });
    if (!order) {
      return HttpMethodStatus.badRequest(res, "order not exist");
    }

    const orderExecute = await EventOrderAdd.findOneAndDelete({
      orderId: orderId,
    });

    const isBuyerExist = await User.findOne({
      walletAddress: buyer.toLowerCase(),
    });

    if (!isBuyerExist) {
      return HttpMethodStatus.badRequest(res, "buyer not exist!!");
    }

    const isSellerExist = await User.findOne({
      walletAddress: seller.toLowerCase(),
    });

    if (!isSellerExist) {
      return HttpMethodStatus.badRequest(res, "seller not exist!!");
    }
    await NFT.findOneAndUpdate(
      { tokenId: orderExecute.tokenId },
      { owner: isBuyerExist._id, status: statusNFT.ONSTOCK }
    );

    const userBuy = await User.findOne({ walletAddress: buyer.toLowerCase() });
    const listNFT = await NFT.find({ owner: userBuy._id }).select(
      "_id tokenId orderId uri name price"
    );

    userBuy.listNFT = listNFT;
    return HttpMethodStatus.ok(res, "execute success!", userBuy);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
///
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await EventOrderAdd.findOne({ orderId: orderId });
    if (!order) {
      return HttpMethodStatus.badRequest(res, "order not exist");
    }

    await EventOrderAdd.findOneAndDelete({ orderId: orderId });

    const nft = await NFT.findOneAndUpdate(
      { tokenId: order.tokenId },
      { status: statusNFT.ONSTOCK}
    );

    const user = await User.findById(nft.seller._id);
    if(!user){
      return HttpMethodStatus.badRequest(res, "user not exist")
    }
    await NFT.findOneAndUpdate(
      { tokenId: order.tokenId },
      { status: statusNFT.ONSTOCK,
        walletOwner:  user.walletAddress}
    );

    const orders = await EventOrderAdd.find({});

    return HttpMethodStatus.ok(res, "cancel success!", orders);
  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
