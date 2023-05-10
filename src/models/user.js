import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
    listNFT: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NFT'
    }],
    name: {
      type: String,
      default: "unnamed"
    },
    wishList:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NFT'
    }],
})

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.__v
  userObject.tokens = undefined
  return userObject
};



const User = mongoose.model("User", userSchema)
export default User;