import express from "express";
import { singup } from "../controller/auth.controller.js";
const router=express.Router()

router.post("/singup",singup)
router.post("/login",(req,res)=>{
    res.send("login successfully")
})

export default  router