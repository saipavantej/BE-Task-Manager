import mongoose from "mongoose";
mongoose.set("strictQuery", true);
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    mongoose
      .connect(process.env.MONGO_URI, {
        dbname: process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("connected to mongo db");
      })
      .catch((err) => {
        console.log(err.message);
      });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
