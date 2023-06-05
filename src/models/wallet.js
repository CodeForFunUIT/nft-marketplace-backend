import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        unique: true,
        // validate: { isLowercase: true },
        required: true,
    },
    signature: {
        type: String,
        // required: true,
    },
    nonce: {
      type: Number,
      defaultValue: () => Math.floor(Math.random() * 1000000),
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
})

const Wallet = mongoose.model("Wallet", walletSchema)
export default Wallet;