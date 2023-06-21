import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sellerAddress:{
        type: String,
    },
    listAuction: {
        type: Array,
        default: [],
    },
    minPrice: {
        type: Number,
    },
    startAuction:{
        type: Number,
    },
    endAuction:{
        type: Number,
    },
    winner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    timeOutAuction: {
        type: Number,
    }
},{
    timestamps: {createdAt: 'created_at'}
})

const Auction = mongoose.model("Auction", auctionSchema)
export default Auction;