import User from "../models/User.js";
import bcrypt from "bcryptjs"
import generatetoken from "../lib/utils.js";


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
            password:hashedPassword
        })


        if (newuser) {
            const token = generatetoken(newuser._id, res)
            await newuser.save()
            res.status(201).json({
                fullName: newuser.fullName,
                email: newuser.email,
                id: newuser._id,
                token: token
            })
        }
        else{
            res.status(400).json({
                message: "user data is Invalid"
            })
        }

    } catch (error) {
        console.log("some error occured into the auth controller singup: ",error.message)
        res.status(500).json({
            message: "internal server error"
        })
    }
}