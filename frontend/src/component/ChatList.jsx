import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'
import { Authzustand } from '../Store/useAuthStore'

function ChatList() {
  const { Chats, getChatPartners, IsUserLoading,setSelectedUser } = useChatStore()
  const {OnlineUsers} =Authzustand()

  useEffect(() => {
    getChatPartners()
  }, [getChatPartners])
  if (IsUserLoading) { return <UsersLoadingSkeleton /> }
  if (Chats.lenght <= 0) {
    return <NoChatsFound />
  }

  return (
    <>
      {
        Chats.map((chat) => {
          return <div
          key={chat._id}
          className='bg-cyan-500/10 p-4 cursor-pointer rounded-lg hover:bg-cyan-500/20'
          onClick={()=>{setSelectedUser(chat)}}
          >
            <div className='flex items-center justify-start space-x-2'>
              <div className={`avatar ${OnlineUsers.includes(chat._id) ? "online" : "offline"} `}>
                <div className='size-12 rounded-full '>
                  <img src={`${chat.profile_Pic || "/avatar.png"}`} alt={`${chat.fullName}`} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>{chat.fullName}</h4>
            </div>

          </div>
        })
      }

    </>
  )
}

export default ChatList
