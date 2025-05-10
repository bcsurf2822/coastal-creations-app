import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("Error: MONGODB_URI environment variable is missing.");
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (e) {
    if (e instanceof Error) {
      console.error("Mongoose Error:", e.message);
    } else {
      console.error("Mongoose Error:", e);
    }
  }
};
