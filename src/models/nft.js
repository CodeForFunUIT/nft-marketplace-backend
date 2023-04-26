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
        ref: "User"
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
    },
    paymentToken: {
        type: String,
        default: "0xFf24e9Ce8D1c32f01B24bE7b1C9BED386D43c22F",
    },
    favorite:{
        type: Number,
    },

},
{
    timestamps: {createdAt: 'created_at'}
}
)



const NFT = mongoose.model("NFT", nftSchema)
export default NFT;