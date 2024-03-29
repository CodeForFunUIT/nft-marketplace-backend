import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connect(
      process.env.MONGO_URI,
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