import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'
import { Authzustand } from '../Store/useAuthStore'
import ShowSearched from './showSearched'
import { GroupStore } from '../Store/useGroupChatStore'
import { useRef } from 'react'

function ChatList() {
  const { Chats, getChatPartners, IsUserLoading, setSelectedUser, isFinding } = useChatStore()
  const { OnlineUsers,isSettingClicked } = Authzustand()
  const {setSelectMembers,selectMembers, setSelectedGroup }=GroupStore()

  useEffect(() => {
    getChatPartners()
  }, [getChatPartners])
  if (IsUserLoading) { return <UsersLoadingSkeleton /> }
  if (Chats.length <= 0) {
    return <NoChatsFound />
  }

const memberSelecct=(chat)=>{
    if(! isSettingClicked){
      return setSelectMembers([])
    }

    if(selectMembers.includes(chat._id)){
      setSelectMembers(selectMembers.filter(id=>id!==chat._id))
    }else{
      setSelectMembers([...selectMembers,chat._id])
    }
}

  return (
    <>
      {!isFinding ? (
        Chats.map((chat) => (
          
          
          <div
          
            key={chat._id}
            className={`${(isSettingClicked && selectMembers.includes(contact._id))? "bg-cyan-500 " : "bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20"} p-4 cursor-pointer `}
            onClick={() => {
              if(isSettingClicked){

                memberSelecct(chat)
              }else{
                setSelectedUser(chat)
                 setSelectedGroup(null)
              }
            }


            }
          >
            
            <div className='flex items-center justify-start space-x-2'>
              <div className={`avatar ${OnlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className='size-12 rounded-full'>
                  <img src={chat.profile_Pic || "/avatar.png"} alt={chat.fullName} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>{chat.fullName}</h4>
            </div>
          </div>
       ))
      ) : (<>
        <ShowSearched />
        </>
      )}
    </>


  )
}

export default ChatList
