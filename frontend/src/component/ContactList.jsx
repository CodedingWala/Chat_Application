import React, { useEffect } from 'react'
import { useChatStore } from '../Store/useChatStore'
import UsersLoadingSkeleton from './UsersLoadingSkeleton'
import NoChatsFound from './NoChatsFound'

function ContactList() {
  const { AllContacts,  getAllcontacts, IsUserLoading, setSelectedUser } = useChatStore()


  useEffect(() => {
   getAllcontacts()
  }, [getAllcontacts])


  if (IsUserLoading) { return <UsersLoadingSkeleton /> }
  if (AllContacts.lenght <= 0) {
    return <NoChatsFound/>
  }
  return (
      <>
      {
       AllContacts.map((contact) => {
          return <div
          key={contact._id}
          className='bg-cyan-500/10 p-4 cursor-pointer rounded-lg hover:bg-cyan-500/20'
          onClick={()=>{setSelectedUser(contact)}}
          >
            <div className='flex items-center justify-start space-x-2'>
              <div className='avatar online'>
                <div className='size-12 rounded-full '>
                  <img src={`${contact.profile_Pic || "/avatar.png"}`} alt={`${contact.fullName}`} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>{contact.fullName}</h4>
            </div>

          </div>
        })
      }

    </>
  )
}

export default ContactList
