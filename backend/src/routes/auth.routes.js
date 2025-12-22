import express from "express";
import { googleAuth, login, logout, singup, updateProfile } from "../controller/auth.controller.js";
import { protectRoute } from "../middlewre/auth.middleware.js";
import { arcjetProtection } from "../middlewre/arcjet.middleware.js";
const router=express.Router()


// router.use(arcjetProtection)
router.post("/singup",singup)
router.post("/login",login)
router.post("/google",googleAuth );
router.post("/logout",logout)
router.put("/update-profile",protectRoute,updateProfile)

export default  router