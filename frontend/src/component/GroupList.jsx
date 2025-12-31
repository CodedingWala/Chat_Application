import React, { useEffect } from 'react'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'
import { GroupStore } from '../Store/useGroupChatStore'
import { Authzustand } from '../Store/useAuthStore'
import { useChatStore } from '../Store/useChatStore'

function GroupList() {
  const { ChatGroups, getChatGroup, selectedGroup, isGroupLoading, setSelectedGroup } = GroupStore()
  const { OnlineUsers } = Authzustand()
  const { setSelectedUser } = useChatStore()



useEffect(() => {
  getChatGroup()
}, [getChatGroup])
if (isGroupLoading) { return <UsersLoadingSkeleton /> }
if (!ChatGroups.length) {
  return <NoChatsFound />;
}

return (
  <>
    {
      ChatGroups.map((group) => {
        return <div
          key={group._id}
          className='bg-cyan-500/10 p-4 cursor-pointer rounded-lg hover:bg-cyan-500/20'
          onClick={() => {
            setSelectedGroup(group)
            setSelectedUser(null)

          }}
        >
          <div className='flex items-center justify-start space-x-2'>
            <div className={`avatar ${OnlineUsers.includes(group.admin) ? "online" : "offline"} `}>
              <div className='size-12 rounded-full '>
                <img src={`${group.profile_Pic || "/avatar.png"}`} alt={`${group.name}`} />
              </div>
            </div>
            <h4 className='text-slate-200 font-medium'>{group.name}</h4>
          </div>

        </div>
      })
    }

  </>
)
}

export default GroupList
