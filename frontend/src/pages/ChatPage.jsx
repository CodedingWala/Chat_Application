import React, { useEffect, useState } from 'react'
import { Authzustand } from '../Store/useAuthStore'
import { useChatStore } from '../Store/useChatStore'
import BorderAnimatedContainer from '../component/BorderAnimatedContainer'
import ChatContainer from '../component/ChatContainer'
import NoConversationPlaceHolder from '../component/NoConversationPlaceHolder'
import ChatList from '../component/ChatList'
import ContactList from '../component/ContactList'
import ProfileHeader from '../component/ProfileHeader'
import ActiveTabSwitch from '../component/ActiveTabSwitch'
import GroupList from '../component/GroupList'
import { GroupStore } from '../Store/useGroupChatStore'
import SeacrhPeople from '../component/SeacrhPeople'
import { XIcon } from "lucide-react"
import GroupContainer from '../component/GroupContainer'

function ChatPage() {
  const { logout, isSettingClicked, setSetting } = Authzustand()
  const { getAllcontacts, getChatPartners, ActiveTab, SelectedUser, Chats } = useChatStore()
  const { selectedGroup, setSelectMembers, selectMembers, createGroup } = GroupStore()
  const [GroupName, setGroupName] = useState("")

  const submitHandler = (e) => {
    e.preventDefault()
    createGroup(GroupName)
    setGroupName("")

  }

  return (
    <div className='relative w-full max-w-6xl md:h-[800px] h-screen lg:h-[900px]'>
      <BorderAnimatedContainer >

        {isSettingClicked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitHandler(e)
            }}
            className={`${SelectedUser ? "hidden md:w-80 lg:w-80 md:flex lg:flex" : "w-full md:w-80 lg:w-80 md:flex lg:flex pt-4"} flex-col bg-slate-800/50 backdrop-blur-sm h-full`} action="">

            <div className=' flex flex-col w-full justify-center items-center bg-slate-900/50 backdrop-blur-sm gap-2 h-1/6'>



              <input className='w-80 rounded-lg px-2 py-2 bg-white  text-black'
                onChange={(e) => {
                  setGroupName(e.target.value)
                }}
                value={GroupName}
                placeholder='Group Name'
                type="text" />
              <div className={`w-full flex justify-center items-center gap-3`}>
                <button className={`w-32 p-2 rounded-lg text-white ${(selectMembers.length <= 0 || GroupName.trim().length <= 0) ? "bg-gray-500 text-gray-700" : "bg-blue-600"}`}
                  disabled={(selectMembers.length <= 0 || GroupName.trim().length <= 0) ? true : false}
                >Create</button>
                <button
                  className='w-32 p-2 rounded-lg bg-red-500 text-white'
                  onClick={() => {
                    setSetting(!isSettingClicked)
                    setSelectMembers([])
                  }}>Cancle</button>
              </div>
              <p>select the members to add on this group</p>
            </div>


            <div className="w-full md:flex-1  overflow-y-auto p-1 space-y-2 borde">

              {Chats.length > 0 && <ChatList />}
              <ContactList />

            </div>


          </form>
        ) :

          <div className={`${(SelectedUser || selectedGroup) ? "hidden md:w-80 lg:w-80 md:flex lg:flex" : "w-full md:w-80 lg:w-80 md:flex lg:flex"} flex-col bg-slate-800/50 backdrop-blur-sm`}>
            <ProfileHeader />
            <SeacrhPeople />
            <ActiveTabSwitch />

            <div className={`w-full md:flex-1 overflow-y-auto p-1 space-y-2`}>
              {ActiveTab === "chats" && <ChatList />}
              {ActiveTab === "contacts" && <ContactList />}
              {ActiveTab === "groups" && <GroupList />}
            </div>
          </div>


        }

        {/* right */}
        <div className={`${(SelectedUser || selectedGroup)  ? "w-full flex flex-col md:flex-1 lg:flex-1" : "hidden fex flex-col  md:flex-1 lg:flex-1"}  md:flex md:flex-col lg:flex-col  bg-slate-900/50 backdrop-blur-sm`}>
          {/* {(SelectedUser || selectedGroup) ? <ChatContainer /> : <NoConversationPlaceHolder />} */}
          {SelectedUser && <ChatContainer />}
          {selectedGroup && <GroupContainer />}
          {(!SelectedUser && !selectedGroup) && <NoConversationPlaceHolder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  )
}

export default ChatPage
