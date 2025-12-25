import { ENV } from "../lib/env.js"
import jwt from "jsonwebtoken"
import User from "../models/User.js"



export const protectRoute = async (req, res,next) => {
    try {

        const token = req.cookies.jwt || req.headers?.authorization?.split(" ")[1]
        if (!token) { return res.status(401).json({ message: "Login First" }) }

        const decode = jwt.verify(token, ENV.JWT_SECRET)
        if (!decode) { return res.status(401).json({ message: "unauthorized - invalid token" }) }

        const user = await User.findOne({_id: decode.userId}).select("-password")
        if (!user) { return res.status(404).json({ message: "unauthorized - user not found" }) }

        req.user = user
        next()


    } catch (error) {

        console.log("error occured inside the proteted route middelware:", error.message)
        return res.status(401).json({ message: "unauthorized" })

    }
}