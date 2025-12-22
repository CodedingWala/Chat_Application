import express from "express";
import { googleAuth, login, logout, singup, updateProfile } from "../controller/auth.controller.js";
import { protectRoute } from "../middlewre/auth.middleware.js";
const router=express.Router()

router.post("/singup",singup)
router.post("/login",login)
router.post("/logout",logout)
router.put("/update-profile",protectRoute,updateProfile)
router.post("/google",googleAuth );

export default  router