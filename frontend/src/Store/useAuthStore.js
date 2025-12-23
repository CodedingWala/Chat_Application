import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const Authzustand = create((set) => ({
    authUser: null,
    isSingingup: false,
    isCheckingAuth: true,
    isLogingIn: false,



    checkAuth: async () => {
        try {
            const res = await AxiosInstance.get("/auth/check")
            set({ authUser: res.data })
        } catch (error) {
            console.log("some error occured", error.message)
            set({ authUser: null })
        }
        finally {
            set({ isCheckingAuth: false })
        }
    },


    singup: async (data) => {
        set({ isSingingup: true })
        try {
            const res = await AxiosInstance.post("/auth/singup", data)
            const token = res.data.token
            const user = res.data.user
            localStorage.setItem("token", token)
            set({ authUser: user })
            toast.success("singup successfull")

        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        }
        finally {
            set({ isSingingup: false })
        }
    },



    login: async (data) => {
        set({ isLogingIn: true })
        try {
            const res = await AxiosInstance.post("/auth/login", data)
            const token = res.data.token
            const user = res.data.user
            localStorage.setItem("token", token)
            set({ authUser: user })
            toast.success("singup successfull")

        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        }
        finally {
            set({ isLogingIn: false })
        }
    },


    googleLogin: (res) => {
        try {
            const user = res.data.user
            const token = res.data.token
            console.log(user)
            set({ authUser: user })
            console.log(authUser)
            localStorage.setItem("token", token)
            toast.success("Login successfull")
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        }

    },


    logout: async () => {
        try {
            await AxiosInstance.post("/auth/logout")
            localStorage.removeItem("token")
            set({ authUser: null })
            toast.success("logout successfully")
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Loged Out failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        }

    }




}))