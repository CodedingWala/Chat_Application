import express from "express"
import dotenv from "dotenv"
import authroute from "./routes/auth.routes.js"
import messageroute from "./routes/message.routes.js"

dotenv.config()

const app=express()
const PORT=process.env.PORT || 5000


app.use("/api/auth",authroute)
app.use("/api/message",messageroute)

app.listen(PORT,(req,res)=>{
    console.log(`server listenning on port ${PORT}`)
})