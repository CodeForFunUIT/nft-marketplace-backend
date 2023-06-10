import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  isUse:{
    type: Boolean,
    required: true,
  },
  tagNFT: {
    type: String,
  },
  subTagNFT:{
    type: String,
  },
  catalyst:{
    type: String,
  },
  name:{
    type: String,
  }
});

// Pre-save hook
imageSchema.pre('save', function (next) {
  this.url = 'https://nft-marketplace-backend-z4eu.vercel.app/image/' + this._id;
  next();
});

imageSchema.methods.toJSON = function () {
  const imageObject = this.toObject()
  delete imageObject.__v
  delete imageObject.data
  return imageObject
};

const Image = mongoose.model("Image", imageSchema);
export default Image;