import http from "http"
import express from "express"
import {Server} from "socket.io"
import {ENV} from "../lib/env.js"
import { socketAuthMiddleware } from "../middlewre/socket.auth.middleware.js";

const app=express();
const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
})

io.use(socketAuthMiddleware)
const UsersSocketMap={}



export const getSocketId=(userId)=>{
    return UsersSocketMap[userId]
}
io.on("connection",(socket)=>{
        console.log("user connected: ",socket.user.fullName)
        const userId=socket.userId
         UsersSocketMap[userId]=socket.id

        io.emit("getAllUsers",Object.keys( UsersSocketMap))
        
        socket.on("disconnect",()=>{
            console.log("user disconnected",socket.user.fullName)
            delete  UsersSocketMap[userId]
            io.emit("getAllUsers",Object.keys( UsersSocketMap))
        })

})

export {app,server,io}