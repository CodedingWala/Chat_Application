import express from "express";
import { getAllContacts, getChatPartners, getMessages, sendMessages } from "../controller/message.controller.js";
import { protectRoute } from "../middlewre/auth.middleware.js";
import { arcjetProtection } from "../middlewre/arcjet.middleware.js";
const router=express.Router()


router.use(arcjetProtection,protectRoute)

 router.get("/contacts",getAllContacts)
 router.get("/chats",getChatPartners)

 router.get("/:id",getMessages)
 router.post("/send/:id",sendMessages)

 export default router



