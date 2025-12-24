import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'

function ChatList() {
  const { Chats, getChatPartners, IsUserLoading,setSelectedUser } = useChatStore()
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
          className='bg-cyan-500/10 pl-1 pr-2 py-2 cursor-pointer rounded-lg hover:bg-cyan-500/20'
          onClick={()=>{setSelectedUser(chat)}}
          >
            <div className='flex items-center justify-start space-x-2'>
              <div className='avatar online'>
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
