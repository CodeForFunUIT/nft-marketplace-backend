import express from "express";
import http from "http";
import connectDB from "./db/mongoose.js";
import dotenv from "dotenv";
import authRouter from "./routers/auth_router.js"
import contractRouter from "./routers/contract_router.js"
import userRouter from "./routers/user_router.js"
import nftRouter from "./routers/nft_router.js"
import imageRouter from "./routers/image_router.js"
import activityRouter from "./routers/activity_router.js"
// import utilRouter from "./routers/utils_router.js"

import Jwt  from "jsonwebtoken";
import {authToken} from "./middleware/authorization.js";
import cors from "cors";
import { ethers } from "ethers";
import { Server } from "socket.io";
import EventOrderAdd from "./models/event_order_add.js";
import NFT from "./models/nft.js";
import { statusNFT, address } from "./utility/enum.js";
dotenv.config({path: './config/config.env'})


const app = express();

const server = http.createServer(app);
// const io = new Server(server, {
//   cors:{
//     origin: "https://example.com",
//     methods: ["GET", "POST"]
//   }
// });

app.use(express.json({ limit: "50mb", extended: true }));
// const allowedOrigins = ['http://localhost:3000','https://nft-marketplace-blue-one.vercel.app/'];

const options = cors.CorsOption = {
  origin: '*'
};

// Then pass these options to cors:
app.use(cors(options));
connectDB();

const INFURA_ID = '615672c98038474aa00db41473c787f8'
const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${INFURA_ID}`)
const addressMarketPlace = address.ADDRESS_MERKETPLACE
const ERC20_ABI_marketPlace = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeDecimal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeRate","type":"uint256"}],"name":"FeeRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderMatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"},{"internalType":"address","name":"paymentToken_","type":"address"},{"internalType":"uint256","name":"price_","type":"uint256"}],"name":"addOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"addPaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"executeOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeDecimal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"isPaymentTokenSupported","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"},{"internalType":"address","name":"seller_","type":"address"}],"name":"isSeller","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nftContract","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"feeDecimal_","type":"uint256"},{"internalType":"uint256","name":"feeRate_","type":"uint256"}],"name":"updateFeeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeRecipient_","type":"address"}],"name":"updateFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"}
]

const contract = new ethers.Contract(addressMarketPlace, ERC20_ABI_marketPlace, provider);


const filterAddOrder = contract.filters.OrderAdded();
const filterCancelOrder = contract.filters.OrderCancelled();
const filterMatchOrder = contract.filters.OrderMatched();

/// cancel
contract.on(filterCancelOrder, (orderId) =>{
  let transfer =  {
    orderId: Number(orderId.hex),
  }

  console.log("cancel")
  console.log(JSON.stringify(transfer,null,4))
})

// Đăng ký bộ lọc với provider để lắng nghe sự kiện OrderAdded
contract.on(filterAddOrder, async (orderId, seller, tokenId, paymentToken,price) => {
  console.log(`orderId: ${orderId}`);
  console.log(`seller: ${seller}`);
  console.log(`tokenId: ${tokenId}`);
  console.log(`paymentToken: ${paymentToken}`);
  console.log(`price: ${price}`);

  // const nft = await NFT.findOneAndUpdate(
  //   {'tokenId': tokenId},
  //   {"$set": {price: price, 
  //       status: statusNFT.SELLING,
  //       orderId: orderId,}
  //   }).exec();

//   const event = EventOrderAdd.findOne({tokenId: tokenId})
//   if(event){
//     return ;
//   }
//   const newEventOrderAdd = new EventOrderAdd({
//     transactionHash: eventMarketPlace[newIndex].transactionHash,
//     orderId: orderId,
//     seller : seller.toLowerCase(),
//     tokenId :tokenId,
//     paymentToken :paymentToken,
//     price :price,
//     status: statusNFT.SELLING,
//     name: nft.name,
//     uri: nft.uri,
// });

  ///Save event
  //  newEventOrderAdd.save((error, data) => {
  //     if(error){
  //         return HttpMethodStatus.badRequest(res, error.message)
  //     }
  //     HttpMethodStatus.created(res, 'add order success!', data );
  // });
});
/// match
contract.on(filterMatchOrder, (orderId,seller,buyer,tokenId,paymentToken,price) =>{
  let transfer =  {
    orderId: Number(orderId._hex),
    seller: seller,
    buyer: buyer,
    tokenId: Number(tokenId._hex),
    paymentToken: paymentToken,
    price: Number(price._hex),
  }

  console.log('match');
  console.log(JSON.stringify(transfer,null,4))
})

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });

//   socket.on('send-message', (msg) => {
//     console.log('message: ' + msg);
//     io.emit("receive-message", msg);

//   });
// });


// app.use((req, res, next) => {
//     const error = new Error("NOT FOUND!");
//     error.status = 403;
//     next(error);
//   });

  // app.use((error, req, res, next) => {
  //   res.status(error.status || 500);
  //   res.send({
  //     msg: "INVALID DATA!",
  //     detail: error.message,
  //   });
  // });
  // app.use((error, req, res, next) => {
  //   res.status(error.status || 500);
  //   res.send({
  //     msg: "xin cái 123456576",
  //     detail: '2k1',
  //   });
  // });
  app.use("/auth",authRouter)
  app.use("/contract", contractRouter)
  app.use("/user", userRouter)
  app.use("/nft", nftRouter)
  app.use("/image",imageRouter)
  app.use("/activity",activityRouter)
  // app.use("/utils",utilRouter)

  app.get('/books',authToken, (req, res) => {
    res.json({status: 'Success', data: books})
  })

  app.get('/',(req, res) => {
    res.send('hello')
  })


  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`Server API listening at http://localhost:${port}`);
  });
