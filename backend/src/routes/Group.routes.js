import express from "express"
import { protectRoute } from "../middlewre/auth.middleware.js"
import { addMemberInGroup, CreateGroup, deleteMessageFromGroup, getChatGroup, getMessageFromGroup, leaveGroup, sendMessageInGroup,deleteGroupAndAllData } from "../controller/groupMessage.controller.js"
const router =express.Router()

router.use(protectRoute)
router.get("/getGroups",getChatGroup)
router.post("/createGroup",CreateGroup)
router.post("/sendMessage/:id",sendMessageInGroup)
router.get("/getGroupMessage/:id",getMessageFromGroup)
router.delete("/deleteMessageFromGroup/:id",deleteMessageFromGroup)
router.post("/addMemberInGroup/:id",addMemberInGroup)
router.post("/leaveGroup/:groupId",leaveGroup)
router.delete("/DeleteGroup/:groupId",deleteGroupAndAllData)
export default router