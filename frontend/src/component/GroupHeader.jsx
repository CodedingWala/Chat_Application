import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, ArrowLeft, Component } from "lucide-react";
import { Authzustand } from '../Store/useAuthStore';
import { GroupStore } from '../Store/useGroupChatStore';
import gsap from 'gsap';
import { useChatStore } from '../Store/useChatStore';
import AddComponent from './AddComponent';

function GroupHeader() {
  const { authUser, OnlineUsers } = Authzustand();
  const { selectedGroup, setSelectedGroup, DeleteGroupMessage, DeleteGroupData, leaveGroup, DleteGroup, isAdding,setIsAdding } = GroupStore();
  const { IsSoundeEnabled } = useChatStore();

  // Guard: avoid crash if no selected group
  if (!selectedGroup) return null;

  const isOnline = OnlineUsers.includes(selectedGroup.admin);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Slide in/out animation with GSAP
  useEffect(() => {
    if (!menuRef.current) return;

    if (showMenu) {
      gsap.set(menuRef.current, { display: "flex", pointerEvents: "auto" });
      gsap.fromTo(
        menuRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(menuRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(menuRef.current, { display: "none", pointerEvents: "none" });
        }
      });
    }
  }, [showMenu]);

  // Close menu on ESC
  useEffect(() => {
    const keypress = (e) => {
      if (e.key === "Escape") setShowMenu(false); // corrected
    };
    window.addEventListener("keydown", keypress);
    return () => window.removeEventListener("keydown", keypress);
  }, []);

  const leavethisGroup = (memberId) => {
    leaveGroup(selectedGroup._id, memberId);
    if (IsSoundeEnabled) {
      const sound = new Audio("/sounds/sounds_notification.mp3");
      sound.currentTime = 0;
      sound.play().catch(err => console.log(err.message));
    }
    setShowMenu(false);
  };

  const adminDelete = () => {
    if (IsSoundeEnabled) {
      const sound = new Audio("/sounds/sounds_notification.mp3");
      sound.currentTime = 0;
      sound.play().catch(err => console.log(err.message));
    }
    DleteGroup();
  };
  const handleDelete = () => {
    DeleteGroupData(selectedGroup._id);
  };


  return (
  isAdding  ? (<AddComponent/> ): (  <div className='relative w-full max-h-[100px] flex items-center justify-between bg-slate-500/50 border-b border-slate-700/50 md:px-4 px-2 z-10'>

      {/* Left Section */}
      <div className='flex items-center'>
        <button className="p-2" onClick={() => setSelectedGroup(null)}>
          <ArrowLeft size={24} />
        </button>
        <div className='flex justify-center items-center space-x-3 py-4 px-1'>
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className='size-12 rounded-full'>
              <img src={selectedGroup.profilepic || "/avatar.png"} alt={selectedGroup.name} />
            </div>
          </div>
          <div>
            <h3 className='text-slate-200 font-medium'>{selectedGroup.name}</h3>
            <p className='text-slate-400'>Total Members: {selectedGroup.members.length}</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full transition-colors duration-200">
        <MoreVertical size={24} />
      </button>

      {/* Animated Menu */}
      <div
        ref={menuRef}
        className="absolute right-2 top-full mt-2 flex flex-col bg-black rounded-lg overflow-hidden z-50"
        style={{ opacity: 0 }}
      >
        {/* Delete Chat (clickable only if there are selected messages) */}
        <button
          className={`px-4 py-2 cursor-pointer text-red-500 hover:bg-gray-700 text-left w-full ${DeleteGroupMessage.length <= 0 ? 'opacity-50 ' : ''}`}
          onClick={() => {
            if (typeof handleDelete === "function") {
              setShowMenu(false)
              handleDelete()}; // safe check
            if (IsSoundeEnabled) {
              const sound = new Audio("/sounds/sounds_mouse-click.mp3");
              sound.currentTime = 0;
              sound.play().catch((err) => console.log(err.message));
            }
          }}
          disabled={DeleteGroupMessage.length <= 0}
        >
          Delete Chat
        </button>

        {/* Leave Group */}
        <button
          className="px-4 py-2 text-red-600 cursor-pointer hover:bg-gray-700 text-left w-full"
          onClick={() => {
            if (selectedGroup.admin === authUser._id) {
              adminDelete();
              setShowMenu(false)
            } else {
              leavethisGroup(authUser._id);
              setShowMenu(false)
            }
          }}
        >
          {selectedGroup.admin === authUser._id ? "Delete And Leave" : "Leave"}
        </button>

        {/* Add Group Member (visible only to admin) */}
        {selectedGroup.admin === authUser._id && (
          <button
            className="px-4 py-2 cursor-pointer text-slate-400 hover:bg-gray-700 text-left w-full"
            onClick={() => {
              console.log("Add Group Member clicked");
              setShowMenu(false);
              setIsAdding(!isAdding)
            }}
          >
            Add And Remove
          </button>
        )}
      </div>
    </div>)
  )
}

export default GroupHeader;
