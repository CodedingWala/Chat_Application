import mongoose from "mongoose"


const connection=async()=>{
   try {
      if(!process.env.MONGO_URI){
         throw new Error("MONGO_URI is not defined")
      }
     await mongoose.connect(process.env.MONGO_URI).then((conn)=>{
        console.log("conneted to Database: ",conn.connection.host)
    })
    
   } catch (error) {
    console.log("could not connect to db: ",error.message)
   }
}

export default connection;