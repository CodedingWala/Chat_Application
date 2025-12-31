import cloudinary from "../lib/cloudinary.js"
import { getSocketId, io } from "../lib/socket.js"
import Message from "../models/Message.js"
import User from "../models/User.js"
import Group from "../models/Group.js"



export const getChatGroup = async (req, res) => {
    try {
        const LogedinUserId = req.user._id
        const group = await Group.find({ members: LogedinUserId })
        res.status(200).json(group)
    } catch (error) {
        console.log("error occured inside the get chat group route: ", error.message)
        res.status(500).json({ message: "internel server error" })
    }
}


export const CreateGroup = async (req, res) => {
    const { _id: adminId } = req.user
    console.log("adminId", adminId)
    const { name, members } = req.body

    try {
        if (!name || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: "Name and members are required" })
        }

        const uniqueMembers = [...new Set([adminId.toString(), ...members])]

        const newGroup = new Group({
            name,
            admin: adminId,
            members: uniqueMembers,
        })

        const savedGroup = await newGroup.save()
        res.status(201).json(savedGroup)
    } catch (error) {
        console.log("Create group error:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}



export const sendMessageInGroup = async (req, res) => {
    const { id: groupId } = req.params
    const { text, image } = req.body
    const senderId = req.user._id

    try {
        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required" })
        }

        const groupData = await Group.findById(groupId)
        if(!groupData.members.includes(senderId)){
          return res.status(403).json({ message: "You are not a member of this group" })
        }
        if (!groupData) {
            return res.status(404).json({ message: "Group not found" })
        }

        let imageUrl, imagePublicId
        if (image) {
            const upload = await cloudinary.uploader.upload(image)
            imageUrl = upload.secure_url
            imagePublicId = upload.public_id
        }

        const newMessage = await Message.create({
            senderId,
            groupId,
            text,
            image: imageUrl,
            imagePublicId,
        })


        await newMessage.populate("senderId")

        groupData.members.forEach(memberId => {
            if (memberId.toString() !== senderId.toString()) {
                const socketId = getSocketId(memberId)
                if (socketId) {
                    io.to(socketId).emit("newMessageInGroup", newMessage)
                }
            }
        })

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Send group message error:", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


export const getMessageFromGroup = async (req, res) => {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.some(m => String(m) === String(userId))) {
            return res.status(403).json({ message: "You are not a member of this group" });
        }
        const user = await User.findById(userId)
        const deletedMessageIds = await user.deletedMessage;

        const messages = await Message.find({
            groupId,
            _id: { $nin: deletedMessageIds }
        }).populate("senderId");


        console.log("messages inside the groupmessage controler: ", messages)
        res.status(200).json(messages);


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const deleteMessageFromGroup = async (req, res) => {
    const { id: groupId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(messageIds) || !messageIds.length) {
        return res.status(400).json({ message: "messageIds are required" });
    }

    try {
        const myMessages = await Message.find({ _id: { $in: messageIds }, senderId: userId })
            .select("_id imagePublicId");
        const otherMessages = await Message.find({ _id: { $in: messageIds }, senderId: { $ne: userId } })
            .select("_id");

        const myMessageIds = myMessages.map(m => m._id);
        const otherMessageIds = otherMessages.map(m => m._id);

        // 2️⃣ Hard delete my messages + Cloudinary cleanup
        if (myMessageIds.length) {
            const imagePublicIds = myMessages.map(m => m.imagePublicId).filter(Boolean);
            if (imagePublicIds.length) await cloudinary.uploader.destroy(imagePublicIds);

            await Message.deleteMany({ _id: { $in: myMessageIds } });
            await User.updateMany(
                { deletedMessage: { $in: myMessageIds } },
                { $pull: { deletedMessage: { $in: myMessageIds } } }
            );
        }

        // 3️⃣ Soft delete others' messages
        if (otherMessageIds.length) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { deletedMessage: { $each: otherMessageIds } }
            });
        }

        const groupData = await Group.findById(groupId);
        groupData.members.forEach(memberId => {
            if (memberId.toString() !== userId.toString()) {
                const socketId = getSocketId(memberId);
                if (socketId) {
                    io.to(socketId).emit("GroupMessageDeleted", {
                        deletedMessges: myMessageIds,
                        groupId,
                    });
                }
            }
        });

        res.status(200).json({
            message: "Messages deleted successfully",
            hardDeletedCount: myMessageIds.length,
            softDeletedCount: otherMessageIds.length,
        });

    } catch (error) {
        console.error("Error in deleteMessageFromGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addMemberInGroup = async (req, res) => {
  const { id: groupId } = req.params
  let { memberId } = req.body
  const userId = req.user._id

  try {
    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" })
    }

    if (!Array.isArray(memberId)) {
      memberId = [memberId]
    }
    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not admin of this group" })
    }
    const existingMembers = group.members.map(m => m.toString())

    const newMembers = memberId.filter(
      id => !existingMembers.includes(id.toString())
    )

    if (newMembers.length === 0) {
      return res.status(400).json({
        message: "All provided members are already in the group",
      })
    }
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: { $each: newMembers } } },
      { new: true }
    )

    const totalMembers = updatedGroup.members.length
    updatedGroup.members.forEach(member => {
      const socketId = getSocketId(member)
      if (socketId) {
        io.to(socketId).emit("memberAdded", {
          groupId,
          totalMembers,
          newMemberIds: newMembers, // 🔥 array
        })
      }
    })

    return res.status(200).json({
      message: "Members added successfully",
      addedMembers: newMembers,
      group: updatedGroup,
    })
  } catch (error) {
    console.error("Error in addMemberInGroup:", error.message)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const leaveGroup = async (req, res) => {
  const { groupId } = req.params
  let { memberIds } = req.body
  const userId = req.user._id.toString()

  try {
    if (!memberIds) memberIds = [userId]
    if (!Array.isArray(memberIds)) memberIds = [memberIds]

    const group = await Group.findById(groupId)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    if (
      memberIds.some(id => id !== userId) &&
      group.admin.toString() !== userId
    ) {
      return res.status(403).json({
        message: "Only admin can remove other members"
      })
    }
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: { $in: memberIds } } },
      { new: true }
    )

    const removedMembers = await User.find({
      _id: { $in: memberIds }
    }).select("_id fullName")

    const affectedUsers = [
      ...updatedGroup.members.map(id => id.toString()),
      ...memberIds.map(id => id.toString())
    ]

    affectedUsers.forEach(userId => {
      const socketId = getSocketId(userId)
      if (socketId) {
        io.to(socketId).emit("membersRemoved", {
          groupId,
          removedMembers
        })
      }
    })

    return res.status(200).json({
      message: "Members removed successfully",
      removedMembers,
      group: updatedGroup
    })

  } catch (error) {
    console.error("Error in leaveGroup:", error.message)
    res.status(500).json({ message: "Internal server error" })
  }
}


export const deleteGroupAndAllData = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id.toString();

    try {
        // 1️⃣ Fetch the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        // Only admin can delete the group
        if (group.admin.toString() !== userId) {
            return res.status(403).json({ message: "Only admin can delete the group" });
        }

        const memberIds = group.members.map(m => m.toString());

        // 2️⃣ Fetch all messages in this group
        const allMessages = await Message.find({ groupId }).select("_id imagePublicId");

        const messageIds = allMessages.map(m => m._id);
        const imagePublicIds = allMessages.map(m => m.imagePublicId).filter(Boolean);

        // 3️⃣ Delete images from Cloudinary
        if (imagePublicIds.length) {
            await cloudinary.api.delete_resources(imagePublicIds);
        }

        if (messageIds.length) {
            await Message.deleteMany({ _id: { $in: messageIds } });

            await User.updateMany(
                { deletedMessage: { $in: messageIds } },
                { $pull: { deletedMessage: { $in: messageIds } } }
            );
        }

        await Group.findByIdAndDelete(groupId);

        memberIds.forEach(memberId => {
            if (memberId !== userId) { 
                const socketId = getSocketId(memberId);
                if (socketId) {
                    io.to(socketId).emit("GroupDeleted", { groupId });
                }
            }
        });

        res.status(200).json({
            message: "Group, members, and messages deleted successfully",
            deletedMessagesCount: messageIds.length,
            totalMembers: memberIds.length
        });

    } catch (error) {
        console.error("Error in deleteGroupAndAllData:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};












