import mongoose from "mongoose";

const nftSchema = new mongoose.Schema({
    nftID: {
        type: Number,
        require: true
    },
    orderID: {
        type: Number,
        default: 0
    },
    addressOwner: {
        type: String,
        require: true,
    },
    uri: {
        type: String,
        default: '',
    },
    nameNFT: {
        type: String,
        require: true,
    },
    status: {
        type: Number,

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
},
{
    timestamps: { 
        createdAt: 'created_at'
    }
}
)



const NFT = mongoose.model("NFT", nftSchema)
export default NFT;