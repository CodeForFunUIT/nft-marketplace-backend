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
    }

})

///Find User In the database
userSchema.statics.findByCredentials = async (email, passWord) => {
    let user = await User.findOne({ email });
    if (!user) {
      throw new Error( 'User does not exist')
    }
    // if(passWord != null){
    //   const isMatchPassWord = await bcrypt.compare(passWord, user.passWord);
    //   if (!isMatchPassWord) {
    //     throw new Error( 'PassWord is not correct')
    //   }
    if(passWord != null){
        if (user.passWord !== passWord) {
          throw new Error( 'PassWord is not correct')
        }
    }else{
      throw new Error("Please enter your passWord")
    }
    // if(user.isVerifiedEmail !== true){
    //   throw new Error("Your email haven't verified")
    // }
    return user;
  };

const User = mongoose.model("User", userSchema)
export default User;