import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../Store/useChatStore'
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder'
import { Authzustand } from '../Store/useAuthStore'
import MessageInput from './MessageInput'
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton'
import { GroupStore } from '../Store/useGroupChatStore'
import GroupHeader from './GroupHeader'
import AddComponent from './AddComponent'

function GroupContainer() {

    const { 
        groupMessages, 
        isGroupLoading, 
        getMessages,
        isAdding,
        setIsAdding,
        selectedGroup,
        subscribeToGroupMessage,
        DeleteGroupMessage, 
        setDeletedData,
        messageDeleteIO,
        leavingGroupIO,
        removeAllsocketListeners,
        GroupDeleted,
        newMemberAdded,
    } = GroupStore();

    const { authUser } = Authzustand()
    const messageRef = useRef(null)
    const [previewImage, setPreviewImage] = useState(null)

    useEffect(() => {
        if (!selectedGroup) return;
        getMessages(selectedGroup._id)
        subscribeToGroupMessage()
        messageDeleteIO()
        leavingGroupIO()
        GroupDeleted()
        newMemberAdded()
        return () => {
            removeAllsocketListeners()
        }
    }, [selectedGroup, getMessages, subscribeToGroupMessage])

    useEffect(() => {
        const container = messageRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, [groupMessages]);

    const toggleSelect = (messageId) => {
        const newSelection = DeleteGroupMessage.includes(messageId)
            ? DeleteGroupMessage.filter(id => id !== messageId)
            : [...DeleteGroupMessage, messageId];
        setDeletedData(newSelection);
    };

    return (
        <>
            {isAdding && selectedGroup && (
                <AddComponent setIsAdding={setIsAdding} />
            )}

            {!isAdding && selectedGroup && (
                <>
                    <GroupHeader/>

                    <div
                        ref={messageRef}
                        className='px-6 py-8 flex-1 overflow-y-auto z-0'
                    >
                        {(groupMessages.length > 0 && !isGroupLoading) ? (
                            <div className='w-full mx-auto space-y-6'>
                                {groupMessages.map(message => (
                                    <div 
                                        key={message._id}
                                        className={`chat ${String(message.senderId?._id) === String(authUser._id) ? "chat-end" : "chat-start"} ${DeleteGroupMessage.some(m => m === message._id) ? "bg-slate-600" : ""}`}
                                        onClick={(e) => {
                                            if (e.target === e.currentTarget) {
                                                toggleSelect(message._id)
                                            }
                                        }}
                                    >
                                        <div className={`chat-bubble relative px-2 py-2 ${String(message.senderId._id) === String(authUser._id) ? "bg-cyan-800 text-white" : "bg-slate-800 text-slate-200"}`}>
                                            {message.senderId._id !== authUser._id && (
                                                <div className='flex w-full justify-between items-center px-2 gap-4'>
                                                    <div className='text-xs opacity-50 mt-1'>{message.senderId.fullName}</div>
                                                    <div className='text-xs opacity-40 mt-1'>{message.senderId.email}</div>
                                                </div>
                                            )}

                                            {message.image && (
                                                <img
                                                    src={message.image}
                                                    className="rounded-lg w-full max-w-[12rem] md:max-w-[16rem] h-auto object-contain border border-slate-900 cursor-pointer"
                                                    alt="sharedpic"
                                                    onClick={() => setPreviewImage(message.image)}
                                                />
                                            )}

                                            {message.text && <p className='mt-2'>{message.text}</p>}

                                            <p className='text-xs opacity-50 mt-1'>
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : isGroupLoading ? (
                            <MessagesLoadingSkeleton />
                        ) : (
                            <NoChatHistoryPlaceholder name={"Group Members"} />
                        )}
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
            )}
        </>
    )
}

export default GroupContainer;
