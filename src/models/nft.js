import mongoose from "mongoose";
import {statusNFT} from "../utility/enum.js";
const nftSchema = new mongoose.Schema({
    tokenId: {
        type: Number,
        require: true
    },
    orderId: {
        type: Number,
    },
    walletOwner:{
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet"
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image"
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction"
    },
    uri: {
        type: String,
    },
    name: {
        type: String,
        require: true,
    },
    status: {
        type: String,
    },
    chain: {
        type: String,
        default: 'Goerli'
    },
    price: {
        type: Number,
        default: 0,
    },
    paymentToken: {
        type: String,
        default: "0x006B385edB7B58037Dba2796b122871B3208C03f",
    },
    favorite:{
        type: Number,
        default: 0,
    },
    tagNFT: {
        type: String,
    },
    subTagNFT: {
        type: String
    },
    catalyst: {
        type: String
    },
},
{
    timestamps: {createdAt: 'created_at'}
}
)



const NFT = mongoose.model("NFT", nftSchema)
export default NFT;