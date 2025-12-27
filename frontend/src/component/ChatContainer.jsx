import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../Store/useChatStore'
import { LoaderIcon } from 'react-hot-toast'
import ChatHeader from './ChatHeader'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import { Authzustand } from '../Store/useAuthStore'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'

function ChatContainer() {
  const { messages, getMessagesById, IsMessageLoading, SelectedUser, subsCribeToMessage, unSubsCribeToMessage, setDataToDelete, DataToDelete, messageDeleted } = useChatStore()
  const { authUser } = Authzustand()
  const [previewImage, setPreviewImage] = useState(null)
  const MessageRef = useRef(null)
  useEffect(() => {
    getMessagesById(SelectedUser._id)
    subsCribeToMessage()
    messageDeleted()
    return () => {
      unSubsCribeToMessage(SelectedUser._id)
    }

  }, [SelectedUser, getMessagesById, subsCribeToMessage, unSubsCribeToMessage, messageDeleted])


  useEffect(() => {
    const container = MessageRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);


  const toggleSelect = (messageId) => {
    const newSelection = DataToDelete.includes(messageId)
      ? DataToDelete.filter(id => id !== messageId)
      : [...DataToDelete, messageId];

    setDataToDelete(newSelection);
  };



  return (
    <>
      <ChatHeader />

      <div
        ref={MessageRef}
        className='px-6 py-8 flex-1 overflow-y-auto z-0'>
        {
          (messages.length > 0 && !IsMessageLoading) ? (
            <div className='w-full mx-auto space-y-6'>
              {messages.map(message => (
                <div key={message._id}
                
                  className={`chat ${String(message.senderId) === String(authUser._id) ? "chat-end" : "chat-start"} ${DataToDelete.some(m => m._id === message._id) ? "bg-slate-600" : ""}`}
                  onClick={(e) => {
                    if(e.target === e.currentTarget){
                      toggleSelect(message)
                    }
                  }}
                >
                  <div className={`chat-bubble relative px-2 py-2  ${String(message.senderId) === String(authUser._id) ? "bg-cyan-800 text-white" : "bg-slate-800 text-slate-200"}`}>
                    {
                      message.image && (
                        <img
                          src={message.image}
                          className=" rounded-lg w-full max-w-[12rem] md:max-w-[16rem] h-auto object-contain border border-slate-900 cursor-pointer"

                          alt="sharedpic"
                          onClick={() => {
                            setPreviewImage(message.image)
                          }

                          }
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center md:p-0 lg:p-0 p-2 cursor-pointer"
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
