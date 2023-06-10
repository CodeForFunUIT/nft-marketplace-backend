import mongoose from "mongoose";
import bcrypt from "bcrypt"
var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
};

const SALT_WORK_FACTOR = 10

const userSchema = new mongoose.Schema({
  // walletAddress: {
  //   type: String,
  //   // unique: true,
  //   // validate: { isLowercase: true },
  //   // required: true,
  // },
  // signature: {
  //   type: String,
  //   // required: true,
  // },
  // nonce: {
  //   type: Number,
  //   defaultValue: () => Math.floor(Math.random() * 1000000),
  // },
  // listNFT: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'NFT'
  // }],
  name: {
    type: String,
    default: "unnamed"
  },
  wishList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  walletList:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'    
  }],
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'    
  },
  uri: {
    type: String,
  },
  uniqueEmailId: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }
})

userSchema.pre('save', function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(`error on genSalt ${err}`);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(`error on hash ${err}`);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) return cb(err, isMatch);
    cb(null, isMatch);
  });
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.__v
  delete userObject.password
  // userObject.tokens = undefined
  // userObject.password = undefined
  return userObject
};



const User = mongoose.model("User", userSchema)
export default User;