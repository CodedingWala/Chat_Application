import express from "express"
import authroute from "./routes/auth.routes.js"
import messageroute from "./routes/message.routes.js"
import path from "path"
import connection from "./lib/db.js"
import { ENV } from "./lib/env.js"
import cookieParser from "cookie-parser"



const app=express()
app.use(express.json())
app.use(cookieParser())

const PORT=ENV.PORT || 5000

const __dirname=path.resolve()


app.use("/api/auth",authroute)
app.use("/api/message",messageroute)

if(ENV.NODE_ENV==="development"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
    })
}

app.listen(PORT,(req,res)=>{
    console.log(`server listenning on port ${PORT}`)
    connection()
})