import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Authzustand } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    AllContacts: [],
    Chats: [],
    FindingData:[],
    isFinding:false,
    messages: [],
    ActiveTab: "chats",
    SelectedUser: null,
    IsMessageLoading: false,
    IsUserLoading: false,
    IsSoundeEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
    DataToDelete:[],
    ChatGroups:[],

    setFindingData:(data)=>{
        set({FindingData : data})
        set({isFinding:true})
    },
    clearFindingData:()=>{
        set({FindingData : []})
        set({isFinding:false})
    },
    ToggleSound: () => {
        localStorage.setItem("isSoundEnabled", !get().IsSoundeEnabled)
        set({ IsSoundeEnabled: !get().IsSoundeEnabled })
    },

    setSelectedTab: (tab) => {
        set({ ActiveTab: tab })
    },

    setDataToDelete: (data) => {
        set({ DataToDelete: data })
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
            set({ Chats: res.data})
            console.log(get().Chats)
            console.log("response: ",res.data)
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

DeleteMessage: async (userId) => {
  const { DataToDelete, messages } = get();

  // 1️⃣ Backup current state (for rollback)
  const previousMessages = [...messages];

  // 2️⃣ Optimistically update UI
  set({
    messages: messages.filter(
      msg => !DataToDelete.some(d => d._id === msg._id)
    )
  });

  try {
    // 3️⃣ Call backend
    await AxiosInstance.delete(`/message/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      data: { DataToDelete }
    });

    // 4️⃣ Clear selection after success
    set({ DataToDelete: [] });

    toast.success("Messages deleted successfully");

  } catch (error) {
    // 5️⃣ Rollback UI if API fails
    set({ messages: previousMessages });

    toast.error("Delete failed. Restored messages.");
    console.error("Optimistic delete failed:", error);
  }
},


    subsCribeToMessage: () => {
        const notification = new Audio("/sounds/sounds_notification.mp3")
        const { SelectedUser ,IsSoundeEnabled } = get()
        const { socket} = Authzustand.getState()
        if (!SelectedUser) return
        socket.on("newMessage", (message) => {
            const isMessageSendFromSelectedUser = message.senderId.toString() === SelectedUser._id.toString()
            console.log(isMessageSendFromSelectedUser)
            if (! isMessageSendFromSelectedUser) return

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

    },

    messageDeleted:()=>{
        const { socket } = Authzustand.getState()
        socket.on("messageDeleted", ({messages,LogedinUserId}) => {
            if(LogedinUserId !== get().SelectedUser._id) return
            set({ messages })
        })
    }

}))