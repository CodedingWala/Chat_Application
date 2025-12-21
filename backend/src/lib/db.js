import mongoose from "mongoose"
import { ENV } from "./env.js"


const connection=async()=>{
   try {
      if(!ENV.MONGO_URI){
         throw new Error("MONGO_URI is not defined")
      }
     await mongoose.connect(ENV.MONGO_URI).then((conn)=>{
        console.log("conneted to Database: ",conn.connection.host)
    })
    
   } catch (error) {
    console.log("could not connect to db: ",error.message)
   }
}

export default connection;