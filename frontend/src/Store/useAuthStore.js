import { create } from "zustand";

export const Authzustand=create((set)=>({
    user:{name:"javed",age:21,gender:"male"},
    isloading:false,
    setUser:(val)=>{
        console.log("user is set")
        set({user:val})
        console.log("user: ",user)
    },
    setLoading:(val)=>{
        console.log("loding is set")
        set({isloading:val})
        console.log("loading: ",isloading)
    }
}))