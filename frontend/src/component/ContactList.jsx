import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'
import { Authzustand } from '../Store/useAuthStore'
import { GroupStore } from '../Store/useGroupChatStore'
import ShowSearched from './ShowSearched'

function ContactList() {
  const { AllContacts, getAllcontacts, IsUserLoading, setSelectedUser, clearFilterContacts, isFinding } = useChatStore()

  const { OnlineUsers, isSettingClicked } = Authzustand()
  const { setSelectMembers, selectMembers , setSelectedGroup} = GroupStore()


  useEffect(() => {
    getAllcontacts()
  }, [getAllcontacts])


  if (IsUserLoading) { return <UsersLoadingSkeleton /> }
  if (AllContacts.length <= 0) {
    return <NoChatsFound />
  }

  const memberSelect = (contact) => {
    if (!isSettingClicked) {
      return setSelectMembers([])
    }

    if (selectMembers.includes(contact._id)) {
      setSelectMembers(selectMembers.filter(id => id !== contact._id))
    } else {
      setSelectMembers([...selectMembers, contact._id])
    }
  }

  return (
    <>
      {!isFinding ? (<>
        {AllContacts.map((contact) => {
          return <div
            key={contact._id}
            className={`${(isSettingClicked && selectMembers.includes(contact._id))? "bg-cyan-500 " : "bg-cyan-500/10 rounded-lg hover:bg-cyan-500/20"} p-4 cursor-pointer `}
            onClick={() => {

              if (isSettingClicked) {
                memberSelect(contact)
              } else {
                setSelectedUser(contact)
                setSelectedGroup(null)
              }

            }
            }>
            <div className='flex items-center justify-start space-x-2'>
              <div className={`avatar ${OnlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className='size-12 rounded-full '>
                  <img src={`${contact.profile_Pic || "/avatar.png"}`} alt={`${contact.fullName}`} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>{contact.fullName}</h4>
            </div>

          </div>
        })
        }

      </>) : (<>
        <ShowSearched />
      </>)}
    </>


  )
}

export default ContactList
