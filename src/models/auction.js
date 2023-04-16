import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    nft:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NFT'
    },
    seller:{
        typer: String,
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
        ref: 'User'
    },
    timeOutAuction: {
        type: Number,
    }
},{
    timestamps: {createdAt: 'created_at'}
})

const Auction = mongoose.model("Auction", auctionSchema)
export default Auction;