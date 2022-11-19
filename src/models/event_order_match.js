import mongoose from "mongoose";

const eventOrderMatched = new mongoose.Schema({
    transactionHash: {
        type: String,
        required: true,
    },
    orderId: {
        type: Number,
        required: true,
    },
    seller :{
      type: String,
      required: true,
    },
    buyer :{
        type: String,
        required: true,
    },
    tokenId :{
        type: Number,
        required: true,
    },
    paymentToken :{
        type: String,
        required: true,
    },
    price :{
        type: Number,
        required: true,
    },
})

const EventOrderMatched = mongoose.model("OrderMatched", eventOrderMatched)
export default EventOrderMatched;