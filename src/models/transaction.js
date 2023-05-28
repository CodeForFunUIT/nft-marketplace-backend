import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema({
    value:{
        type: String,
    },
    data: {
        type: String,
    },
    from:{
        type: String,
    },
    to: {
        type: String,
    },
    timestamp: {
        type: Number,
    },
    method:{
        type: String,
    },
    blockNumber:{
        type: Number,
    }
},
)

const Transaction = mongoose.model("Transaction", transactionSchema)
export default Transaction;