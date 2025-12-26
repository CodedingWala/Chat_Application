import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { ENV } from "../lib/env.js"

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token
        console.log("token: ",token)
        
            if(!token){
                console.log("no token found")
                return next(new Error("unauthorized access"))

            }

            const decoded =jwt.verify(token, ENV.JWT_SECRET);
            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                console.log("user not found")
                return next(new Error("unauthorized access"));
            }
            socket.user = user;
            socket.userId=user._id.toString()
            next();
    } catch (error) {
        console.log("error in socket middleware", error.message);
        next(new Error("unauthorized access"));
    }
}