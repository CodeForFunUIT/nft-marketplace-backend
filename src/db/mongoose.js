import mongoose from "mongoose";


const connectDB = async () => {
  try {
    await mongoose.connect(
      // process.env.MONGO_URI,
      'mongodb+srv://DoAn2:DoAn2@doan2.wjazbh5.mongodb.net/test',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("MongoDB connected!");
  } catch (error) {
    console.log("Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;