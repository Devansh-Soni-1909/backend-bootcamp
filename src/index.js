// require('dotenv').config({path : './env'})



import connectDB from './db/index.js';
import dotenv from 'dotenv';

dotenv.config({

    path : './env'
})

connectDB();



















































// first approach to connect through mongoDB where we write all code in index.js
/* import express from 'express'
const app = express()

// Connect to MongoDB

// this is IIFE (Immediately Invoked Function Expression which can immediately call the function)
(async ()=>{

    try{

      await   mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("error",error)
        throw error
      })

      app.listen(process.env.PORT,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
      })

    }
    catch(error){

        console.error("Error",error)
        throw err

    }
})() */