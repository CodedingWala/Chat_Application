import User from "../models/User.js";
import bcrypt from "bcryptjs"
import generatetoken from "../lib/utils.js";
import { sendWelcomeEmail } from "../email/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import axios from "axios"


export const singup = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "al feilds are required"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                messsage: "password must be at least 6 characters long"
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const user = await User.findOne(({ email }))

        if (user) {
            return res.status(400).json({ message: "user already exists" })

        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newuser = new User({
            fullName,
            email,
            password: hashedPassword
        })


        if (newuser) {
            const saveduser = await newuser.save()
            const token = generatetoken(saveduser._id, res)
            res.status(201).json({
                fullName: newuser.fullName,
                email: newuser.email,
                id: newuser._id,
                token: token
            })


            try {
                await sendWelcomeEmail(saveduser.email, saveduser.fullName, ENV.CLIENT_URL)

            } catch (error) {
                console.log("failed to send welcome email: ", error.message)
            }
        }
        else {
            res.status(400).json({
                message: "user data is Invalid"
            })
        }

    } catch (error) {
        console.log("some error occured into the auth controller singup: ", error.message)
        res.status(500).json({
            message: "internal server error"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "all feilds are required"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        const validpasswor = await bcrypt.compare(password, user.password)
        if (!validpasswor) {
            return res.status(400).json({ message: "invalid password" })
        }


        const token = generatetoken(user._id, res)
        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            id: user._id,
            token: token
        })



    } catch (error) {
        console.log("some error occured into the auth controller login: ", error.message)
        res.status(500).json({
            message: "internal server error"
        })

    }
}



export const logout = async (_, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({ message: "user logged out" })

}


export const googleAuth = async (req, res) => {
    
    const { token } = req.body;
    try {
        // Verify Google ID token
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        );

        const { email, name, picture, sub } = googleRes.data;

        // Check if user exists in MongoDB
        let user = await User.findOne({ email });
        if (!user) {
            user =  await User.create({
                fullName: name,
                email,
                profilePic: picture,
                password: sub,
            });
        }


          try {
                await sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL)

            } catch (error) {
                console.log("failed to send welcome email: ", error.message)

            }



        // Create JWT for your app

        const jwttoken = generatetoken(user._id, res)
        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            id: user._id,
            token: jwttoken
        })
    } catch (err) {
        console.error("Google Auth Error:", err.message);
        res.status(400).json({ message: "internel server error" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        if (!profilePic) {
            return res.status(400).json({ message: "profile pic is required" })
        }
        const userId = req.usr._id
        const uploadresponse = cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadresponse.secure_url }, { new: true })

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("error occured inside the update profile controller:", error.message)
        return res.status(500).json({ message: "internel server error" })

    }
}

