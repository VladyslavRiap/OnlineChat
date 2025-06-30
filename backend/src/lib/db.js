import mongoose from "mongoose";

export const conncetDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected :${connection.connection.host}`);
  } catch (error) {
    console.log(`MongoDb connection error:`, error);
  }
};
