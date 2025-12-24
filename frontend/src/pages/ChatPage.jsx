import React from 'react'
import { Authzustand } from '../Store/useAuthStore'
import {useChatStore } from '../Store/useChatStore'
import BorderAnimatedContainer from '../component/BorderAnimatedContainer'  
import ChatContainer from '../component/ChatContainer'
import NoConversationPlaceHolder from '../component/NoConversationPlaceHolder'
import ChatList from '../component/ChatList'
import ContactList from '../component/ContactList'
import ProfileHeader from '../component/ProfileHeader'
import ActiveTabSwitch from '../component/ActiveTabSwitch'



function ChatPage() {
  const {logout} =Authzustand()
  const {getAllcontacts,getChatPartners,ActiveTab,SelectedUser}=useChatStore()
 
  return (
   <div className='relative w-full max-w-6xl h-[800px]'>
      <BorderAnimatedContainer>
        <div className='w-80 flex flex-col bg-slate-800/50 backdrop-blur-sm'>
            <ProfileHeader/>
            <ActiveTabSwitch/>

            <div className='flex-1 overflow-y-auto p-1 space-y-2'>
              { ActiveTab==="chats"? <ChatList/>:<ContactList/> }
            </div>
        </div>

        {/* right */}
        <div className='flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm'>
               {SelectedUser? <ChatContainer/>: <NoConversationPlaceHolder/>}
        </div>
      </BorderAnimatedContainer>
   </div>
  )
}

export default ChatPage
