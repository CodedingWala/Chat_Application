import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import io from "socket.io-client"
const BASE_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL


export const Authzustand = create((set, get) => ({
    authUser: null,
    isSettingClicked:false,
    isSingingup: false,
    isCheckingAuth: false,
    isLogingIn: false,
    uploadingImg: false,
    socket: null,
    OnlineUsers:[],


    setSetting:(data)=>{
        set({isSettingClicked : data})
    },
    setIAuthChecking:(data)=>{
        set({isCheckingAuth : data})
    },


    checkAuth: async () => {
        set({ isCheckingAuth: true })
        try {
            if (!localStorage.getItem("token")) return set({ authUser: null })
            const res = await AxiosInstance.get("/auth/check", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")} || "" `
                }
            })
            set({ authUser: res.data })
            get().SocketConnection()
        } catch (error) {
            const message = error?.response?.data?.message || "Something went wrong"
            toast.error(message)
            console.log("some error occured", message)
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
            get().SocketConnection()

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
            get().SocketConnection()

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
            set({ authUser: user })
            console.log("getting authuser", get().authUser)
            localStorage.setItem("token", token)
            toast.success("Login successfull")
            get().SocketConnection()
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
            get().disConnectSocket()
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Loged Out failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        }

    },
    updateProfile: async (file) => {
        set({ uploadingImg: true })
        try {
            const res = await AxiosInstance.put("/auth/update-profile", file, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            const user = res.data
            set({ authUser: user })
            toast.success("profile updated successfully")

        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Loged Out failed";

            console.log("Login error:", error.response?.data);
            toast.error(message);
        } finally {
            set({ uploadingImg: false })
        }
    },

    SocketConnection: () => {
        try {
            const { authUser } = get()
            if (!authUser || get().socket?.connected) return
            const socket = io(BASE_URL, {
                auth: {
                    token: localStorage.getItem("token")
                },
                withCredentials: true
            })
            console.log("inside socketxconnection: ", socket,"port: ",BASE_URL)

            socket.connect()
            set({ socket })
            socket.on("getAllUsers", (AllUsers) => {
                console.log("all users", AllUsers)
                set({ OnlineUsers: AllUsers })
            })
        } catch (error) {
            const message = error?.response?.data?.message || "Something went wrong"
            toast.error(message)
            console.log("some error occured inside socket connection", message)
        }

    },
    disConnectSocket: () => {
        const { socket } = get()
        if (socket.connected) {
            socket.disconnect()
        }
    }


}))