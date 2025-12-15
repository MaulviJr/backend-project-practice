import dotenv from 'dotenv'
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js"
// import express, { application } from "express"
import { connectDB } from "./db/index.js";
import { app } from './app.js';


dotenv.config({ path: './.env' })

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`this is PORT: ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("DB connection error! ", err);
    
})

// ;(async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     application.on("error", (error)=>{
//         console.log("Error:", error);
//         throw error;
//     })

//     application.listen(process.env.PORT, ()=>{
//         console.log(`App listening at port : ${process.env.PORT}`);
//     })
// } catch (error) {
//     console.error("ERROR", error);
//     throw error
// }

// })()