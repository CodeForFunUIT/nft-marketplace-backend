import mongoose from "mongoose";

const eventOrderAdd = new mongoose.Schema({
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
    name: {
        type: String,
    },
    status: {
        type: String,
    }
})

const EventOrderAdd = mongoose.model("EventOrderAdd", eventOrderAdd)
export default EventOrderAdd;