import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log(`MongoDB connected and host in ${connectionInstance.connection.host}`);         // This tells where the db is hosting if some glitch happens this helps 
    } catch (error) {
        console.log(error);
        process.exit(1)             // This is used to exit the process with failure code (1) if there is some error in connecting DB and code (1) means failure and code (0) means success
    }
}

// This is used every where so instead we are going to use this in "utils folder" and import it from there

export default connectDB