import Jwt from "jsonwebtoken";
import HttpMethodStatus from "../utility/static.js";
import EventOrderAdd from "../models/event_order_add.js";
import ethers from "ethers";
import User from "../models/user.js";
import NFT from "../models/nft.js";
import { statusNFT,address,durationTrick } from "../utility/enum.js";
import { contractMarketPlace } from "../utility/contract.js";
import WalletSchema from "../models/wallet.js"
import mongoose from "mongoose";
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

    // const sellerAddress = await WalletSchema.findOne({ walletAddress: eventMarketPlace[newIndex].args[1].toLowerCase() })

    // if (!sellerAddress) {
    //   return HttpMethodStatus.badRequest(res, `wallet address not exist with address: ${sellerAddress}`)
    // }

    // const nft = await NFT.findOneAndUpdate(
    //   { tokenId: eventMarketPlace[newIndex].args[2] },
    //   {
    //     $set: {
    //       price: eventMarketPlace[newIndex].args[4],
    //       status: statusNFT.SELLING,
    //       orderId: eventMarketPlace[newIndex].args[0],
    //       walletOwner: address.ADDRESS_MERKETPLACE,
    //       owner: null,
    //       seller: sellerAddress._id,
    //     },
    //   },
    //   { new : true }
    // );


    setTimeout(async () => {
    const nft = await NFT.findOne(
      { tokenId: eventMarketPlace[newIndex].args[2] },
      // {
      //   $set: {
      //     price: eventMarketPlace[newIndex].args[4],
      //     status: statusNFT.SELLING,
      //     orderId: eventMarketPlace[newIndex].args[0],
      //     walletOwner: address.ADDRESS_MERKETPLACE,
      //     owner: null,
      //     seller: sellerAddress._id,
      //   },
      // },
      // { new : true }
      
    );
    return HttpMethodStatus.created(res, "add order success!", nft);

    }, durationTrick);



    // const newEventOrderAdd = new EventOrderAdd({
    //   transactionHash: eventMarketPlace[newIndex].transactionHash,
    //   orderId: eventMarketPlace[newIndex].args[0],
    //   nft: nft._id,
    //   seller: eventMarketPlace[newIndex].args[1].toLowerCase(),
    //   // buyer :eventMarketPlace[newIndex].args[2],
    //   tokenId: eventMarketPlace[newIndex].args[2],
    //   paymentToken: eventMarketPlace[newIndex].args[3],
    //   price: eventMarketPlace[newIndex].args[4],
    //   status: statusNFT.SELLING,
    //   name: nft.name,
    //   uri: nft.uri,
    // });

    ///Save event
    // await newEventOrderAdd.save((error, data) => {
    //   if (error) {
    //     return HttpMethodStatus.badRequest(res, error.message);
    //   }
    // });
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
      nft: nft._id,
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
      seller: e.args[1].toLowerCase(),
      tokenId: Number(e.args[2]._hex),
      price: Number(e.args[4]._hex)
    };
  });
  let listOrderMatch = orderMatchs.map((e) => {
    return {
      orderId: Number(e.args[0]._hex),
      seller: e.args[1].toLowerCase(),
      tokenId: Number(e.args[2]._hex),
      price: Number(e.args[4]._hex)
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

/// lấy order từ blochain
export const addOrdersFromBlochainToMongo = async (req, res) => {
  const orderAdds = await contractMarketPlace.queryFilter("OrderAdded");
  const orderMatchs = await contractMarketPlace.queryFilter("OrderMatched");
  const orderCancel = await contractMarketPlace.queryFilter("OrderCancelled");
  let listOrderAdd = orderAdds.map((e) => {
    return {
      transactionHash: e.transactionHash,
      orderId: Number(e.args[0]._hex),
      seller: e.args[1].toLowerCase(),
      tokenId: Number(e.args[2]._hex),
      paymentToken: e.args[3],
      price: Number(e.args[4]._hex)
    };
  });
  let listOrderMatch = orderMatchs.map((e) => {
    return {
      transactionHash: e.transactionHash,
      orderId: Number(e.args[0]._hex),
      seller: e.args[1].toLowerCase(),
      tokenId: Number(e.args[2]._hex),
      paymentToken: e.args[3],
      price: Number(e.args[4]._hex)
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

  let promises = listOrderAdd.map(async (order) => {
    // const nft = await NFT.findOne({tokenId: order.tokenId})
    // if(!nft){
    //   throw(`nft not exist with tokenId: ${nft.tokenId}`);
    // }

    const orderAdd = await EventOrderAdd.findOne({ orderId: order.orderId })
    console.log(`tokenId ${order.tokenId}`);
    console.log(`orderAdd: ${orderAdd}`)

    if (!orderAdd) {
      const seller = await WalletSchema.findOne({ walletAddress: order.seller })
      if (!seller) return HttpMethodStatus.badRequest(res, `not exist wallet with address: ${order.seller}`)

      const nft = await NFT.findOneAndUpdate(
        { tokenId: order.tokenId },
        {
          status: statusNFT.SELLING,
          price: order.price,
          orderId: order.orderId,
          walletOwner: address.ADDRESS_MERKETPLACE.toLowerCase(),
          owner: null,
          seller: seller._id,
        })

      const newEventOrderAdd = new EventOrderAdd({
        transactionHash: order.transactionHash,
        orderId: order.orderId,
        seller: order.seller.toLowerCase(),
        // buyer :eventMarketPlace[newIndex].args[2],
        nft: nft._id,
        tokenId: order.tokenId,
        paymentToken: order.paymentToken,
        price: order.price,
        status: statusNFT.SELLING,
        name: nft.name,
        uri: nft.uri,
      });
      ///Save event
      await newEventOrderAdd.save((error, data) => {
        if (error) {
          return HttpMethodStatus.badRequest(res, error.message);
        }
      });
      return newEventOrderAdd;
    }
    return orderAdd;
  });

  Promise.all(promises).then(function (results) {
    console.log('forEach đã hoàn thành');
    console.log(results);
  });
};

/// lấy order từ mongodb
export const getOrdersFromMongo = async (req, res) => {
  const orders = await EventOrderAdd.find({})
    .populate({
      path: 'nft',
      select: '_id tokenId name uri walletOwner seller',
      populate: {
        path: 'seller',
        select: '_id name walletAddress'
      }
    })
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
    const { buyer, orderId } = req.body;

    // const wallet = await WalletSchema.findOne({
    //   walletAddress: buyer.toLowerCase(),
    // });

    // if (!wallet) {
    //   return HttpMethodStatus.badRequest(res, `address buyer not exist with address: ${buyer}`);
    // }

    // const nft = await NFT.findOneAndUpdate(
    //   { orderId: orderId },
    //   {
    //     owner: wallet.owner._id,
    //     status: statusNFT.ONSTOCK,
    //     price: 0,
    //     walletOwner: wallet.walletAddress.toLowerCase(),
    //     orderId: 0,
    //     seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
    //   }
    // );

    // if(!nft) return HttpMethodStatus.badRequest(res, `orderId not exist: ${orderId}`)

    // const listNFT = await NFT.find({ walletOwner: wallet.walletAddress }).select(
    //   "_id tokenId orderId uri name price"
    // );

    // wallet.listNFT = listNFT;
    // await WalletSchema.findOneAndUpdate(
    //   { walletAddress: buyer.toLowerCase() },
    //   { listNFT: listNFT },
    //   { new: true }
    // );

    // await WalletSchema.findByIdAndUpdate(
    //   nft.seller._id,
    //   {
    //     $pull: {
    //       listNFT: nft._id
    //     }
    //   }
    // )

    const wallet = await WalletSchema.findOne(
      { walletAddress: buyer.toLowerCase() },
    );
    if(!wallet) return HttpMethodStatus.badRequest(res, `wallet not exist with address: ${buyer}`)

    setTimeout(async () => {
      return HttpMethodStatus.ok(res, "execute success!", wallet);
    }, durationTrick);

  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
///
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // const nft = await NFT.findOne({orderId: orderId})

    // if(!nft){
    //   return HttpMethodStatus.badRequest(res, `nft not exist with orderId: ${orderId}`)
    // }

    // const walletOwner = await WalletSchema.findById(nft.seller._id)

    // if(!walletOwner) return HttpMethodStatus.badRequest(res, `wallet not exist ${walletOwner.walletAddress}`)

    // await NFT.findOneAndUpdate(
    //   { orderId: orderId },
    //   {
    //     $set: {
    //       price: 0,
    //       status: statusNFT.ONSTOCK,
    //       orderId: 0,
    //       walletOwner: walletOwner.walletAddress,
    //       owner: walletOwner.owner,
    //       seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
    //     },
    //   },{ new : true}
    // );

    // const nfts = await NFT.find({});

    setTimeout(async () => {
      const nfts = await NFT.find({});
      return HttpMethodStatus.ok(res, "cancel success!", nfts);
    }, durationTrick);

  } catch (error) {
    return HttpMethodStatus.badRequest(res, error.message);
  }
};
