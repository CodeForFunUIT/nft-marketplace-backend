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
import utilRouter from "./routers/utils_router.js"
import auctionRouter from "./routers/auction_router.js"
import mongoose from "mongoose";

import Jwt  from "jsonwebtoken";
import {authToken} from "./middleware/authorization.js";
import cors from "cors";
import { ethers } from "ethers";
import { Server } from "socket.io";
import EventOrderAdd from "./models/event_order_add.js";
import NFT from "./models/nft.js";
import { statusNFT, address } from "./utility/enum.js";
import User from "./models/user.js";
import WalletSchema from "./models/wallet.js";
import { wsContractMarketPlace, wsContractNFT } from "./utility/contract.js";
import Auction from "./models/auction.js";
import { openLootBox } from "./utility/open_loot_box.js";
import Image from "./models/image.js";
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

// const INFURA_ID = '615672c98038474aa00db41473c787f8'
// const provider = new ethers.providers.WebSocketProvider(`wss://goerli.infura.io/ws/v3/${INFURA_ID}`)
// const addressMarketPlace = address.ADDRESS_MERKETPLACE
// const ERC20_ABI_marketPlace = [
//   {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"feeDecimal","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeRate","type":"uint256"}],"name":"FeeRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"orderId","type":"uint256"},{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"paymentToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"OrderMatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"uint256","name":"tokenId_","type":"uint256"},{"internalType":"address","name":"paymentToken_","type":"address"},{"internalType":"uint256","name":"price_","type":"uint256"}],"name":"addOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"addPaymentToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"cancelOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"}],"name":"executeOrder","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"feeDecimal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"paymentToken_","type":"address"}],"name":"isPaymentTokenSupported","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"orderId_","type":"uint256"},{"internalType":"address","name":"seller_","type":"address"}],"name":"isSeller","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"nftContract","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"orders","outputs":[{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"paymentToken","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"feeDecimal_","type":"uint256"},{"internalType":"uint256","name":"feeRate_","type":"uint256"}],"name":"updateFeeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeRecipient_","type":"address"}],"name":"updateFeeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"}
// ]

// const contract = new ethers.Contract(addressMarketPlace, ERC20_ABI_marketPlace, provider);


const filterAddOrder = wsContractMarketPlace.filters.OrderAdded();
const filterCancelOrder = wsContractMarketPlace.filters.OrderCancelled();
const filterMatchOrder = wsContractMarketPlace.filters.OrderMatched();
const filterMintFromUser = wsContractNFT.filters.Transfer();

/// cancel
wsContractMarketPlace.on(filterCancelOrder, async (orderId) =>{
  let transfer =  {
    orderId: Number(orderId._hex),
  }

  console.log("cancel")
  console.log(JSON.stringify(transfer,null,4))
  const nft = await NFT.findOne({orderId: transfer.orderId})
  console.log(`nft ${nft}`)
  if(nft){
    const walletOwner = await WalletSchema.findById(nft.seller._id)
    console.log(`walletOwner ${walletOwner}`)
    if(walletOwner){
      nft.price = 0
      nft.status = statusNFT.ONSTOCK
      nft.orderId = 0
      nft.walletOwner = walletOwner.walletAddress
      nft.owner = walletOwner.owner._id
      nft.seller = mongoose.Types.ObjectId("648fce0ac17d70451ccd6798")
      await nft.save()
      console.log(nft)
      // await NFT.findOneAndUpdate(
      //   { orderId: transfer.orderId },
      //   {
      //     $set: {
      //       price: 0,
      //       status: statusNFT.ONSTOCK,
      //       orderId: 0,
      //       walletOwner: walletOwner.walletAddress,
      //       owner: walletOwner.owner._id,
      //       seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
      //     },
      //   },
      // );
    }
  }
})

// Đăng ký bộ lọc với provider để lắng nghe sự kiện OrderAdded
wsContractMarketPlace.on(filterAddOrder, async (orderId, seller, tokenId, paymentToken,price) => {
  let transfer =  {
    orderId: Number(orderId._hex),
    seller: seller.toLowerCase(),
    tokenId: Number(tokenId._hex),
    paymentToken: paymentToken,
    price: Number(price._hex),
  }

  console.log('AddOrder');
  console.log(JSON.stringify(transfer,null,4))

  const wallet = await WalletSchema.findOne({
    walletAddress: transfer.seller
  })

  if(wallet){
    await NFT.findOneAndUpdate(
      { tokenId: transfer.tokenId },
      {
        price: transfer.price, 
        status: statusNFT.SELLING,
        orderId: transfer.orderId,
        owner: null,
        walletOwner: address.ADDRESS_MERKETPLACE,
        seller: wallet._id
      });
  }
});
/// match
wsContractMarketPlace.on(filterMatchOrder, async (orderId,seller,buyer,tokenId,paymentToken,price) =>{
  let transfer =  {
    orderId: Number(orderId._hex),
    seller: seller.toLowerCase(),
    buyer: buyer.toLowerCase(),
    tokenId: Number(tokenId._hex),
    paymentToken: paymentToken,
    price: Number(price._hex),
  }
  console.log('match');
  console.log(JSON.stringify(transfer,null,4))

  const wallet = await WalletSchema.findOne({
    walletAddress: transfer.buyer,
  });

  if(wallet){
    const nft = await NFT.findOneAndUpdate(
      { orderId: transfer.orderId },
      {
        owner: wallet.owner._id,
        status: statusNFT.ONSTOCK,
        price: 0,
        walletOwner: wallet.walletAddress.toLowerCase(),
        orderId: 0,
        seller: mongoose.Types.ObjectId("648fce0ac17d70451ccd6798"),
        auction: null,
      }
    );

    if(nft){
      const listNFT = await NFT.find({ walletOwner: wallet.walletAddress.toLowerCase() })
    
      wallet.listNFT = listNFT;
      await WalletSchema.findOneAndUpdate(
        { walletAddress: transfer.buyer },
        { listNFT: listNFT },
        { new: true }
      );
    
      await WalletSchema.findByIdAndUpdate(
        nft.seller._id,
        {
          $pull: {
            listNFT: nft._id
          }
        }
      )
      // await Auction.findOneAndDelete({winner: wallet._id} )
    }
  }
})

wsContractMarketPlace.on(filterMintFromUser, async (from, to, tokens) =>{
  let transfer =  {
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    tokens: Number(tokens._hex),
  }
  if(from === "0x0000000000000000000000000000000000000000"){
    let tokenIds = []
  
    const nfts = await NFT.find()
  
    nfts.forEach((nft) => {
      tokenIds.push(nft.tokenId)
    })
  
    const maxTokenId = Math.max.apply(null,tokenIds)
    const catalyst = openLootBox();

    const randomImage = await Image.aggregate([
      { $match: { isUse: false, catalyst: catalyst } },
      { $sample: { size: 1 } }
    ]);

    if (randomImage.length > 0) {

      const selectedImage = randomImage[0];

      const image = await Image.findById(selectedImage._id)

      const wallet = await WalletSchema.findOne({ walletAddress: transfer.to })

      const currentDate = new Date();
      const vietnamTimeOffset = 7 * 60 * 60 * 1000; 
      const vietnamTime = new Date(currentDate.getTime() + vietnamTimeOffset);
      const nextFreeMint = new Date(currentDate.getTime() + vietnamTimeOffset)
      nextFreeMint.setDate(currentDate.getDate() + 1); // Thêm một ngày
      nextFreeMint.setHours(7, 0, 0, 0); // Đặt giờ thành 7:00:00 AM
      
      if(image && wallet){
        await User.findByIdAndUpdate(wallet.owner._id, {
          lastFreeMint: vietnamTime.toJSON(),
          nextFreeMint: nextFreeMint.toJSON()
        })
  
        const nft = new NFT({
          tokenId: maxTokenId + 1,
          orderId: 0,
          walletOwner: walletAddress.toLowerCase(),
          owner: wallet.owner._id,
          seller: wallet._id,
          image: image._id,
          uri: image.url,
          name: image.name,
          status: statusNFT.ONSTOCK,
          tagNFT: image.tagNFT,
          subTagNFT: image.subTagNFT,
          catalyst: image.catalyst,
          overview: image.overview,
        })
  
        nft.save( async (err, data) => {
          if(data){
            wallet.listNFT.push(data._id)
            await wallet.save()
          }
        }) 
      }
    } 
  }
 

  console.log("mint")
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
  app.use("/utils",utilRouter)
  app.use("/auction",auctionRouter)

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
