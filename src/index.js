// ********************************************************************************************* //
// import mongoose from 'mongoose'                                      // Tp connect DB
// import { DB_NAME } from './constants';

// import express from 'express'                            // previously
// const app = express()


    // Method 1     (use normal function)

    // function connectDB(){}
    // connectDB()


    // Method 2     (use IIFE = Immediately Invoked Function Expression) 
    // This just runs funcction immediately after it defined


    // ;(async ()=>{               // ; professional approach if above line dosen't have semicolon

    //     try {

    //         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)                         // Caling data from DB might result some time so we use await

    //         app.on("error",()=>{                    // Used for error listening (after database connection error like wrong password etc)
    //             console.log("Error :", error);
    //             throw error
    //         })

    //         app.listen(process.env.PORT,()=>{
    //             console.log(`App is listening on port ${process.env.PORT}`);
    //         })
    //     } catch (error) {

    //         // console.log(error);
    //         console.error(error);                   // Saem as console.log
    //         throw error

    //     }

    // })()

// ********************************************************************************************* //

    // Method 3     (use different file for DB connection and export that function and call here)

    // require("dotenv").config({path:'./env'});                    // this cause incosistancey so we use import
    import dotenv from "dotenv";                        
    import connectDB from './db/index.js';
    import app from "./app.js";
    
    dotenv.config(      // to write import dotenv we have to use it + also you have to change something in package.json
        {
            path:'./.env'
        }
    )
    connectDB()
    .then(()=>{
        app.listen(process.env.PORT || 8000) 
    })
    .catch((error)=>{
        console.error("DB Connection failed",error);
        process.exit(1)
    })