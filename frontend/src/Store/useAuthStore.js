import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const Authzustand = create((set) => ({
    authUser:null,
    isSingingup:false,
    isCheckingAuth: true,


    checkAuth: async () => {
        try {
            const res = await AxiosInstance.get("/auth/check")
            set({authUser:res.data})
        } catch (error) {
            console.log("some error occured", error.message)
            set({authUser:null})
        }
        finally {
            set({ isCheckingAuth: false })
        }
    },


    singup:async(data)=>{
        set({isSingingup:true})
        try {
           const res=await AxiosInstance.post("/auth/singup",data)
           const token=res.data.token
           const user=res.data.user
           localStorage.setItem("token",token) 
           set({authUser:user})
           toast.success("singup successfull")

        } catch (error) {
            console.log("error occured during singup: ",error.message)
            toast.error("message: ",error.message)
        }
        finally{
            set({isSingingup:false})
        }
    }


}))