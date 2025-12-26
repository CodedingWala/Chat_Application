import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Authzustand } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    AllContacts: [],
    messages: [],
    Chats: [],
    ActiveTab: "chats",
    SelectedUser: null,
    IsMessageLoading: false,
    IsUserLoading: false,
    IsSoundeEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    ToggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().IsSoundeEnabled)
        set({ IsSoundeEnabled: !get().IsSoundeEnabled })
    },

    setSelectedTab: (tab) => {
        set({ ActiveTab: tab })
    },

    setSelectedUser: (user) => {
        set({ SelectedUser: user })
    },

    getAllcontacts: async () => {
        set({ IsUserLoading: true })
        try {
            const res = await AxiosInstance.get("/message/contacts", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            set({ AllContacts: res.data })
            console.log(get().AllContacts)
        } catch (error) {
            const message =
                error?.response?.data?.messages || "Something went wrong";
            console.error("Some error occurred:", message);
            toast.error(message);
        } finally {
            set({ IsUserLoading: false })
        }
    },
    getChatPartners: async () => {
        set({ IsUserLoading: true })
        try {
            const res = await AxiosInstance.get("/message/chats", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            set({ Chats: res.data })
            console.log(get().Chats)
        } catch (error) {
            const message =
                error?.response?.data?.messages || "Something went wrong";
            console.error("Some error occurred:", message);
            toast.error(message);
        } finally {
            set({ IsUserLoading: false })
        }
    },

    getMessagesById: async (userId) => {
        set({ IsMessageLoading: true })
        try {
            const res = await AxiosInstance.get(`/message/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            set({ messages: res.data })
            console.log(get().messages)
        } catch (error) {
            const message = error?.response?.data?.messages || "Something went wrong"
            console.error("Some error occurred:", message)
            toast.error(message)
        } finally {
            set({ IsMessageLoading: false })
        }
    },

    sendMesage: async (messageData) => {
        try {

            const { authUser } = Authzustand.getState()
            const { SelectedUser, messages } = get()

            const optimisticMessage = {
                senderId: authUser._id,
                receiverId: SelectedUser._id,
                text: messageData.text,
                image: messageData.image,
                _id: new Date().getTime() + Math.random(),
                createdAt: new Date().toISOString(),
                isOptimistic: true
            }
            set({ messages: [...messages, optimisticMessage] })
            const res = await AxiosInstance.post(`/message/send/${SelectedUser._id}`, messageData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            })
            set({ messages: messages.concat(res.data) })

        } catch (error) {
            set({ messages: message })
            const message = error?.response?.data?.message || "some thing went wrong"
            toast.error(message)
            console.log("some error occured", message)
        }
    },

    subsCribeToMessage: () => {
        const notification = new Audio("/sounds/sounds_notification.mp3")
        const { SelectedUser } = get()
        const { socket,  IsSoundeEnabled } = Authzustand.getState()
        if (!SelectedUser) return
        socket.on("newMessage", (message) => {
            const isMessageSendFromSelectedUser = message.senderId.toString() === SelectedUser._id.toString()
            if (isMessageSendFromSelectedUser) return

            const currentMessages = get().messages
            set({ messages: [...currentMessages, message] })
            if (IsSoundeEnabled) {
                notification.currentTime = 0;
                notification.play().catch(err => { console.log(err) });
            }
        })
    },

    unSubsCribeToMessage: () => {
        const { socket } = Authzustand.getState()
        socket.off("newMessage")

    }

}))