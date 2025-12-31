
import cloudinary from "../lib/cloudinary.js"
import { getSocketId, io } from "../lib/socket.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import Group from "../models/Group.js"

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
        return message.senderId?.toString() === LogedinUserId.toString()
          ? message.receiverId?.toString()
          : message.senderId?.toString()
      })
    )] // remove yourself
    const chatusers = await User.find({ _id: { $in: chatPartners } })
    res.status(200).json(chatusers)
  } catch (error) {
    console.log("error occured inside the get chat partners route: ", error.message)
    res.status(500).json({ message: "internel server error" })
  }
}



export const getMessages = async (req, res) => {
  const { id: partnerId } = req.params;
  const myId = req.user._id;

  try {
    // Step 1: Get your deleted messages
    const user = await User.findById(myId).select('deletedMessage');
    const deletedIds = user.deletedMessage || [];

    // Step 2: Fetch messages between you and partner, excluding deleted ones
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId }
      ],
      _id: { $nin: deletedIds } // exclude messages in deletedMessage
    }).sort({ createdAt: 1 }); // optional: sort by time

    res.status(200).json(messages);

  } catch (error) {
    console.log("Error occurred in getMessages route:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
    let imagePublicId
    if (image) {
      const response = await cloudinary.uploader.upload(image)
      imageUrl = response.secure_url
      imagePublicId = response.public_id
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      imagePublicId: imagePublicId

    })


    const savedMessage = await newMessage.save()
    const SocketId = getSocketId(receiverId)
    if (SocketId) {
      io.to(SocketId).emit("newMessage", savedMessage)
    }
    res.status(200).json(savedMessage)

    // todo some code here

  } catch (error) {
    console.log("error occured inside the send messages route: ", error.message)
    res.status(500).json({ message: "internel server error" })
  }

}


export const DeleteMessage = async (req, res) => {
  try {
    const { id: PartnerId } = req.params;
    const { DataToDelete } = req.body;
    const LogedinUserId = req.user._id;

    const messageIds = DataToDelete.map(m => m._id);

    // 1️⃣ Messages sent by me
    const messagesFromMe = await Message.find({
      _id: { $in: messageIds },
      senderId: LogedinUserId
    });

    // 2️⃣ Delete images from Cloudinary
    await Promise.all(
      messagesFromMe
        .filter(m => m.imagePublicId)
        .map(m => cloudinary.uploader.destroy(m.imagePublicId))
    );

    const messagesFromMeIds = messagesFromMe.map(m => m._id);

    // Remove my message IDs from partner's deletedMessage
    await User.findByIdAndUpdate(PartnerId, {
      $pull: { deletedMessage: { $in: messagesFromMeIds } }
    });

    // 3️⃣ Messages sent by partner → delete for me only
    const messagesFromPartner = await Message.find({
      _id: { $in: messageIds },
      senderId: PartnerId
    }).select("_id");

    await User.findByIdAndUpdate(LogedinUserId, {
      $addToSet: {
        deletedMessage: { $each: messagesFromPartner.map(m => m._id) }
      }
    });

    // 4️⃣ Delete my messages from DB
    const result = await Message.deleteMany({
      _id: { $in: messagesFromMeIds }
    });

    // 5️⃣ Get partner's deleted messages
    const partner = await User.findById(PartnerId).select("deletedMessage");
    const deletedIds = partner?.deletedMessage || [];

    // 6️⃣ Send updated messages to partner
    const messages = await Message.find({
      $or: [
        { senderId: LogedinUserId, receiverId: PartnerId },
        { senderId: PartnerId, receiverId: LogedinUserId }
      ],
      _id: { $nin: deletedIds }
    }).sort({ createdAt: 1 });

    const socketId = getSocketId(PartnerId);
    if (socketId) {
      io.to(socketId).emit("messageDeleted", {
        messages,
        LogedinUserId
      });
    }

    res.status(200).json({
      message: "Messages deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("DeleteMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




