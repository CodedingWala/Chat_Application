import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js"
import User from "../models/User.js"

export const getAllContacts = async (req, res) => {
    try {
        const UserId = req.user._id
        const contacts = await User.find({ _id: { $ne: UserId } }).select("-password")
        res.status(200).json(contacts)
    } catch (error) {
        console.log("error occured inside the get all contacts route: ", error.message)
        res.status(500).json({ message: "internel server error" })
    }
}

export const getMessages = async (req, res) => {
    const { id: partnerId } = req.params
    const myId = req.user._id

    try {
        const messages = await Message.find(
            {
                $or: [
                    { senderId: myId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: myId }
                ]
            })
        console.log("message: ", messages)
        res.status(200).json(messages)


    } catch (error) {
        console.log("error occured inside the get messages route: ", error.message)
        res.status(500).json({ message: "internel server error" })
    }

}

export const sendMessages = async (req, res) => {
    try {
        const { id: receiverId } = req.params
        const { text, image } = req.body
        const senderId = req.user._id

        if (receiverId.toString() === senderId.toString()) {
            return res.status(400).json({ message: "you cannot send message to yourself" })
        }
        else if (!text && !image) {
            return res.status(400).json({ message: "text or image is required" })
        }
        const user = User.findOne({ _id: receiverId })
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        let imageUrl
        if (image) {
            const response = await cloudinary.uploader.upload(image)
            imageUrl = response.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        const savedMessage = await newMessage.save()
        res.status(200).json(savedMessage)

        // todo some code here

    } catch (error) {
        console.log("error occured inside the send messages route: ", error.message)
        res.status(500).json({ message: "internel server error" })
    }

}

export const getChatPartners = async (req, res) => {
    try {
        const LogedinUserId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: LogedinUserId },
                { receiverId: LogedinUserId }
            ]
        })
        const chatPartners = [...new Set(
            messages.map(message => {
                return message.senderId.toString() === LogedinUserId.toString()
                    ? message.receiverId.toString()
                    : message.senderId.toString()
            })
        )] // remove yourself
        const chatusers = await User.find({ _id: { $in: chatPartners } })

        res.status(200).json(chatusers)
    } catch (error) {
        console.log("error occured inside the get chat partners route: ", error.message)
        res.status(500).json({ message: "internel server error" })
    }
}