import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'
import { Authzustand } from '../Store/useAuthStore'

function ShowSearched() {
  const { Chats, getChatPartners, IsUserLoading, setSelectedUser, FindingData } = useChatStore()
  const { OnlineUsers } = Authzustand()

  if (FindingData.length <= 0) {
    return <NoChatsFound />
  }

  return (
    <>
      {
        FindingData.map((data) => {
          console.log("running for zubair : ", FindingData, data) 
          return <div
            key={data._id}
            className='bg-cyan-500/10 p-4 cursor-pointer rounded-lg hover:bg-cyan-500/20'
            onClick={() => {
              setSelectedUser(data)
            }
            }
          >
            <div className='flex items-center justify-start space-x-2'>
              <div className={`avatar ${OnlineUsers.includes(data._id) ? "online" : "offline"} `}>
                <div className='size-12 rounded-full '>
                  <img src={`${data.profile_Pic || "/avatar.png"}`} alt={`$  {data.fullName || data.name}`} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>  {data.fullName || data.name}</h4>
            </div>

          </div>
        })
      }

    </>
  )
}

export default ShowSearched
