import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../Store/useChatStore'
import { LoaderIcon } from 'react-hot-toast'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceHolder'
import { Authzustand } from '../Store/useAuthStore'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'

function ChatContainer() {
  const { messages, getMessagesById, IsMessageLoading, SelectedUser,  subsCribeToMessage,unSubsCribeToMessage } = useChatStore()
  const { authUser } = Authzustand()
  const [previewImage, setPreviewImage] = useState(null)
  const MessageRef = useRef(null)
  useEffect(() => {
    getMessagesById(SelectedUser._id)
    subsCribeToMessage()
    return () => {
      unSubsCribeToMessage(SelectedUser._id)
    }

  }, [SelectedUser, getMessagesById , subsCribeToMessage,unSubsCribeToMessage])


  useEffect(() => {
    if (MessageRef.current) {
      MessageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])



  return (
    <>
      <ChatHeader />

      <div className='px-6 py-8 flex-1 overflow-y-auto z-0'>
        {
          (messages.length > 0 && !IsMessageLoading) ? (
            <div className='w-full mx-auto space-y-6'>
              {messages.map(message => (
                <div key={message._id}
                  className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                  <div className={`chat-bubble relative  ${message.senderId == authUser._id ? "bg-cyan-800 text-white" : "bg-slate-800 text-slate-200"}}`}>
                    {
                      message.image && (
                        <img src={`${message.image}`}
                          className='rounded-lg h-48 object-cover boreder border-slate-900'
                          alt="sharedpic" 
                          
                          onClick={() => setPreviewImage(message.image)}
                        />
                      )
                    }

                    {message.text && (
                      <p className='mt-2'>{message.text}</p>

                    )}
                    <p className='text-xs opacity-50 mt-1'
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )

              )}
              <div ref={MessageRef} />
            </div>
          ) : IsMessageLoading ?
            <MessagesLoadingSkeleton /> :
            (
              <NoChatHistoryPlaceholder name={SelectedUser?.fullName} />
            )
        }

      </div>
      <MessageInput />

       {previewImage && (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        onClick={() => setPreviewImage(null)}
      >
        <img
          src={previewImage}
          className="max-w-full max-h-full object-contain"
          alt="preview"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image
        />
      </div>
    )}
    </>
  )
}

export default ChatContainer
