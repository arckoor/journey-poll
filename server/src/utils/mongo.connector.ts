import mongoose from "mongoose";
import { mongoDB } from "../configs/poll.config.js";

mongoose.set("strictQuery", false);
export const connect = async () => await mongoose.connect(mongoDB);
