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
   <div className='relative w-full max-w-6xl md:h-[800px] h-screen lg:h-[900px]'>
      <BorderAnimatedContainer>
        <div className={`${SelectedUser? "hidden md:w-80 lg:w-80 md:flex lg:flex" : "w-full md:w-80 lg:w-80 md:flex lg:flex"} flex-col bg-slate-800/50 backdrop-blur-sm`}>
            <ProfileHeader/>
            <ActiveTabSwitch/>

            <div className={`w-full md:flex-1 overflow-y-auto p-1 space-y-2`}>
              { ActiveTab==="chats"? <ChatList/>:<ContactList/> }
            </div>
        </div>

        {/* right */}
        <div className={`${SelectedUser? "w-full md:flex-1 lg:flex-1" : "hidden md:flex-1 lg:flex-1" } md:flex md:flex-col lg:flex-col  bg-slate-900/50 backdrop-blur-sm`}>
               {SelectedUser? <ChatContainer/>: <NoConversationPlaceHolder/>}
        </div>
      </BorderAnimatedContainer>
   </div>
  )
}

export default ChatPage
