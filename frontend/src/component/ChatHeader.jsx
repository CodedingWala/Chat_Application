import React, { useEffect, useState } from 'react'
import { useChatStore } from '../Store/useChatStore'
import { MoreVertical, ArrowLeft } from "lucide-react"
import { Authzustand } from '../Store/useAuthStore'

function ChatHeader() {
  const { SelectedUser, setSelectedUser, DataToDelete, IsSoundeEnabled,DeleteMessage,setDataToDelete } = useChatStore()
  const { OnlineUsers } = Authzustand()
  const isOnline = OnlineUsers.includes(SelectedUser._id)
  const [showbar, setshowbar] = useState(false)




  useEffect(() => {
    const keypress = (e) => {
      if (e.key === "Escape") {
        setSelectedUser(null)
      }
    }
    window.addEventListener("keydown", keypress)

    return () => {
      window.removeEventListener("keydown", keypress)
    }
  }, [SelectedUser, setSelectedUser])


  const DeleteHandler=()=>{
    if(DataToDelete.length<=0) return
    DeleteMessage(SelectedUser._id)
    setshowbar(false)

  }

  return (
    <div className='relative w-full justify-self-start max-h-[100px] flex items-center justify-between bg-slate-500/50 border-b border-slate-700/50 md:px-4 lg:px-4 px-2  z-10'>

      <div className='flex  items-center justify-start'>
        <button className="p-2 m-0">
          <ArrowLeft size={24}
            onClick={() => {
              setSelectedUser(null)
            }}
          />
        </button>
        <div className='flex justify-center items-center space-x-3 py-4 px-1 m-0'>
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className='size-12 rounded-full '>
              <img src={`${SelectedUser.profilepic || "/avatar.png"} `} alt={SelectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className='text-slate-200 font-medium'>{SelectedUser.fullName}</h3>
            <p className='text-slate-400'>{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>
      <button disabled={DataToDelete.length <= 0}
        onClick={() => {
          setshowbar(!showbar)
        }}
        className={`p-2 rounded-full transition-colors duration-200 
    ${DataToDelete.length <= 0
            ? "opacity-40 cursor-not-allowed pointer-events-none"
            : ""}`}>
        <MoreVertical size={24} />

      </button>
      {showbar && DataToDelete.length > 0 && (
        <div
          className={`absolute right-2 top-full mt-2 flex  bg-black rounded-lg gap-1 
                overflow-hidden transition-all duration-200 ease-in-out
                ${showbar ? "opacity-100 max-h-40 scale-100" : "opacity-0 max-h-0 scale-95"}`}
        >
          <button
            className="px-4 py-2 text-red-500 hover:bg-gray-700 text-left w-full"
            onClick={() => {
              if (IsSoundeEnabled) {
                const sound = new Audio("/sounds/sounds_mouse-click.mp3")
                sound.currentTime = 0
                sound.play()
                  .catch((error) => console.log("Audio play failed:", error.message));
              }
                DeleteHandler()

            }}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 text-white hover:bg-gray-700 text-left w-full"
            onClick={() => {
              setshowbar(false)
              setDataToDelete([])
            }}
          >
            Cancel
          </button>
        </div>
      )}

    </div>
  )
}

export default ChatHeader
