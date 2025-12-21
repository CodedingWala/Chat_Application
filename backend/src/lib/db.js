import mongoose from "mongoose"


const connection=async()=>{
   try {
     await mongoose.connect(process.env.MONGO_URI).then((conn)=>{
        console.log("conneted to Database: ",conn.connection.host)
    })
    
   } catch (error) {
    console.log("could not connect to db: ",error.message)
   }
}

export default connection;