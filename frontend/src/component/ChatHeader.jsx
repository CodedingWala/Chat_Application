import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import {XIcon} from "lucide-react"
import { Authzustand } from '../Store/useAuthStore'

function ChatHeader() {
    const {SelectedUser, setSelectedUser}=useChatStore()
    const {OnlineUsers}=Authzustand()
    const isOnline=OnlineUsers.includes(SelectedUser._id)


    useEffect(() => {
      const keypress=(e)=>{
        if(e.key==="Escape"){
          setSelectedUser(null)
        }
      }
      window.addEventListener("keydown",keypress)
    
      return () => {
        window.removeEventListener("keydown",keypress)
      }
    }, [SelectedUser,setSelectedUser])
    
      return (
    <div className='w-full justify-self-start max-h-[100px] flex items-center justify-between bg-slate-500/50 border-b border-slate-700/50 px-4 z-10'>
      <div className='flex justify-center items-center space-x-3 p-4'>
            <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                <div className='size-12 rounded-full '>
                    <img src={`${SelectedUser.profilepic || "/avatar.png"} `}  alt={SelectedUser.fullName} />
                </div>
            </div>
            <div>
                <h3 className='text-slate-200 font-medium'>{SelectedUser.fullName}</h3>
                <p className='text-slate-400'>{isOnline?"Online":"Offline"}</p>
            </div>
      </div>
      <button>
        <XIcon className='w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors' onClick={()=>setSelectedUser(null)}/>
      </button>
    </div>
  )
}

export default ChatHeader
