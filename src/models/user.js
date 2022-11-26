import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    signature: {
        type: String,
        required: true,
    },
    nonce :{
      type: Number,
      required: true,
    },
    listNFT: {
      type: Array, 
    }

})

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.__v
  userObject.tokens = undefined
  return userObject
};



const User = mongoose.model("User", userSchema)
export default User;