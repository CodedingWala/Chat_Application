import { create } from "zustand";
import { AxiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Authzustand } from "./useAuthStore";
import { useChatStore } from "./useChatStore";


export const GroupStore = create((set, get) => ({
    ChatGroups: [],
    isGroupLoading: false,
    selectedGroup: null,
    selectMembers: [],
    DeleteGroupMessage: [],
    groupMessages: [],
    isAdding: false,

    setIsAdding: (data) => {
        set({ isAdding: data })
    },




    setDeletedData: async (data) => {
        set({ DeleteGroupMessage: data })
    },


    setSelectMembers: (data) => {
        set({ selectMembers: data })
        console.log("selected member while creating a group: ", get().selectMembers)
    },

    setSelectedGroup: (group) => {
        set({ selectedGroup: group })
    },

    createGroup: async (groupName) => {
        const { authUser, setIAuthChecking, setSetting, isSettingClicked } = await Authzustand.getState()
        const { selectMembers } = get()
        if (!groupName || !selectMembers || selectMembers.length === 0) {
            return toast.error("all feilds are required")
        }
        try {
            setIAuthChecking(true)

            const res = await AxiosInstance.post("/group/createGroup", {
                members: [authUser._id, ...selectMembers],
                name: groupName

            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            set({ ChatGroups: [...get().ChatGroups, res.data] })
            console.log("create group in the ChatPage: ", res.data)
            toast.success("Group created successfully")
        } catch (error) {
            console.log("some error occured during group creation:", error.message)
            toast.error(error.message)
        } finally {
            setSetting(!isSettingClicked)
            set({ selectMembers: [] })
            setIAuthChecking(false)
        }

    },
    getChatGroup: async (req, res) => {
        set({ isGroupLoading: true })
        try {
            const res = await AxiosInstance.get("/group/getGroups", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            console.log("inside the get group: ", res)
            set({ ChatGroups: res.data })
            console.log(res.data)

        } catch (error) {
            console.log("some error occured", error.message)
            toast.error(error.message)
        } finally {
            set({ isGroupLoading: false })
        }
    },

    getMessages: async (groupId) => {
        try {
            set({ isGroupLoading: true })
            const res = await AxiosInstance.get(`/group/getGroupMessage/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            set({ groupMessages: res.data })
            console.log("inside the get messages: ", res.data)

        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong";

            toast.error(message);
            // console.log("some error occurred:", message);
        }

        finally {
            set({ isGroupLoading: false })
        }
    },



    sendGroupMesage: async (messageData) => {
        const { authUser } = Authzustand.getState()
        const { selectedGroup } = GroupStore.getState()

        if (!selectedGroup) return

        const optimisticMessage = {
            _id: `optimistic-${Date.now()}`,
            senderId: authUser._id,
            groupId: selectedGroup._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        }

        set((state) => ({
            groupMessages: [...state.groupMessages, optimisticMessage],
        }))

        try {
            const res = await AxiosInstance.post(
                `/group/sendMessage/${selectedGroup._id}`,
                messageData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )

            set((state) => ({
                groupMessages: state.groupMessages.map((msg) =>
                    msg._id === optimisticMessage._id ? res.data : msg
                ),
            }))
        } catch (error) {
            set((state) => ({
                groupMessages: state.groupMessages.filter(
                    (msg) => msg._id !== optimisticMessage._id
                ),
            }))

            const message =
                error?.response?.data?.message || "Something went wrong"
            toast.error(message)
        }
    },

    DeleteGroupData: async (groupId) => {
        const { groupMessages, DeleteGroupMessage } = get();

        const previousMessages = [...groupMessages];

        set({
            groupMessages: groupMessages.filter(
                msg => !DeleteGroupMessage.some(d => d === msg._id)
            )
        });
        try {
            const res = await AxiosInstance.delete(`/group/deleteMessageFromGroup/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                data: {
                    messageIds: get().DeleteGroupMessage
                }
            })

            console.log("delete group message: ", res.data)
            set({ DeleteGroupMessage: [] })
            toast.success("message deleted successfully")
        } catch (error) {
            const message = error?.response?.data?.message || "some thing went wrong"
            toast.error(message)
            console.log("some error occured", message)
        }
    },

    AddMember: async () => {
        const { selectedGroup, selectMembers } = get()

        try {
            const res = await AxiosInstance.post(
                `/group/addMemberInGroup/${selectedGroup._id}`,
                { memberId: selectMembers },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )

            const addedMembersIds = res.data.addedMembers 
            set((state) => ({
                selectedGroup: {
                    ...state.selectedGroup,
                    members: [
                        ...state.selectedGroup.members,
                        ...addedMembersIds,
                    ],
                },
            }))

            toast.success("Members added successfully")
        } catch (error) {
            const message =
                error?.response?.data?.message || "Something went wrong"
            toast.error(message)
            console.log("Some error occurred:", message)
        }
    },


   leaveGroup: async (groupId, memberIds) => {
  try {
    await AxiosInstance.post(
      `/group/leaveGroup/${groupId}`,
      { memberIds },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    )
    // ❗ DO NOTHING ELSE
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong")
  }
},

    

    subscribeToGroupMessage: () => {
        try {
            const notification = new Audio("/sounds/sounds_notification.mp3")
            const { SelectedUser, IsSoundeEnabled } = useChatStore.getState()
            const { socket } = Authzustand.getState()
            if (SelectedUser || !get().selectedGroup) return
            socket.on("newMessageInGroup", (message) => {
                const isMessageSendFromSelectedGroup = message.groupId.toString() === (get().selectedGroup._id).toString()
                console.log("Is Same group: ", isMessageSendFromSelectedGroup)
                if (!isMessageSendFromSelectedGroup) return

                const currentMessages = get().groupMessages
                set({ groupMessages: [...currentMessages, message] })
                if (IsSoundeEnabled) {
                    notification.currentTime = 0;
                    notification.play().catch(err => { console.log(err) });
                }
            })

        } catch (error) {
            const message = error?.response?.data?.message || "some thing went wrong"
            toast.error(message)
            console.log("some error occured", message)
        }
    },
    messageDeleteIO: async () => {
        const { socket } = Authzustand.getState()
        const { groupMessages } = get()
        try {
            socket.off("GroupMessageDeleted")

            socket.on("GroupMessageDeleted", ({ deletedMessges, groupId }) => {
                console.log("deleted message: ", deletedMessges, "groupId in messageDeleteIO: ", groupId)
                if (groupId !== get().selectedGroup._id) return
                set(state => ({
                    groupMessages: state.groupMessages.filter(
                        msg => !deletedMessges.includes(msg._id)
                    )
                }));
            })
        } catch (error) {
            const message = error?.response?.data?.message || "some thing went wrong"
            toast.error(message)
            console.log("some error occured", error)
        }
    },
    DleteGroup: async () => {
        try {
            const res = await AxiosInstance.delete(`/group/DeleteGroup/${get().selectedGroup._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                })
            set({ ChatGroups: get().ChatGroups.filter(group => group._id !== get().selectedGroup._id) })
            set({ selectedGroup: null })
            set({ groupMessages: [] })
            toast.success("Group deleted")
        } catch (error) {
            const message = error?.response?.data?.message || "some thing went wrong"
            toast.error(message)
            console.log("some error occured", error)
        }
    },

leavingGroupIO: async () => {
  try {
    const { socket, authUser } = Authzustand.getState()

    socket.off("membersRemoved")

    socket.on("membersRemoved", ({ groupId, removedMembers }) => {
      const state = get()
      const selectedGroup = state.selectedGroup

      if (!selectedGroup || selectedGroup._id !== groupId) return

      const removedIds = removedMembers.map(m => String(m._id))
      const isSelfRemoved = removedIds.includes(String(authUser._id))

      // 🔴 SELF LEFT
      if (isSelfRemoved) {
        set({
          selectedGroup: null,
          groupMessages: [],
          selectMembers: [],
          ChatGroups: state.ChatGroups.filter(g => g._id !== groupId)
        })

        toast.success("You left the group")
        return
      }

      // 🟢 OTHERS LEFT
      set({
        selectedGroup: {
          ...selectedGroup,
          members: selectedGroup.members.filter(
            id => !removedIds.includes(String(id))
          )
        }
      })

      if (removedMembers.length === 1) {
        toast.success(`${removedMembers[0].fullName} left the group`)
      } else {
        toast.success(`${removedMembers.length} members removed`)
      }
    })

  } catch (error) {
    toast.error("Socket error")
    console.error(error)
  }
},





    GroupDeleted: async () => {
        try {
            const { socket } = Authzustand.getState()
            socket.off("GroupDeleted")
            socket.on("GroupDeleted", ({ groupId }) => {
                set((state) => ({
                    ChatGroups: state.ChatGroups.filter(
                        (group) => group._id !== groupId
                    ),
                    selectedGroup:
                        state.selectedGroup?._id === groupId
                            ? null
                            : state.selectedGroup,
                    groupMessages: [],
                    DeleteGroupMessage: [],
                    selectMembers: [],
                }))

                toast.message("Group deleted by admin")
            })
        } catch (error) {
            const message =
                error?.response?.data?.message || "Something went wrong"
            toast.error(message)
            console.log("Some error occurred:", message)
        }
    },



    newMemberAdded: async () => {
  const { socket } = Authzustand.getState()

  try {
    socket.off("memberAdded")

    socket.on("memberAdded", ({ groupId, totalMembers, newMemberIds }) => {
      const { selectedGroup } = get()
      if (!selectedGroup) return
      if (groupId !== selectedGroup._id) return

      set((state) => ({
        selectedGroup: {
          ...state.selectedGroup,
          members: [
            ...state.selectedGroup.members,
            ...newMemberIds
          ],
          totalMembers,
        },
      }))

      if (newMemberIds.includes(Authzustand.getState().authUser._id)) {
        toast.success("You are added to the group")

        // ✅ FIXED (no mutation)
        set((state) => ({
          ChatGroups: [...state.ChatGroups, groupId],
        }))
      }

      toast.success("New members added to the group")
    })
  } catch (error) {
    const message =
      error?.response?.data?.message || "Something went wrong"
    toast.error(message)
    console.log("Some error occurred:", message)
  }
},




    removeAllsocketListeners: () => {
        const { socket } = Authzustand.getState()
        socket.off("GroupMessageDeleted")
        socket.off("memberRemoved")
        socket.off("newMessageInGroup")
        socket.off("GroupDeleted")
        socket.off("memberAdded")
    },

}))

