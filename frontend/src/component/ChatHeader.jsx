import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { MoreVertical, ArrowLeft } from "lucide-react";
import { Authzustand } from "../Store/useAuthStore";
import { gsap } from "gsap";

function ChatHeader() {
  const {
    SelectedUser,
    setSelectedUser,
    DataToDelete,
    IsSoundeEnabled,
    DeleteMessage,
    setDataToDelete,
  } = useChatStore();
  const { OnlineUsers } = Authzustand();
  const isOnline = OnlineUsers.includes(SelectedUser?._id);
  const [showbar, setShowbar] = useState(false);

  const panelRef = useRef();
  const buttonRef = useRef();

  // Escape key to close chat
  useEffect(() => {
    const keypress = (e) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", keypress);
    return () => window.removeEventListener("keydown", keypress);
  }, [setSelectedUser]);

  // Animate panel open/close
  useEffect(() => {
    if (showbar && DataToDelete.length > 0) {
      gsap.to(panelRef.current, {
        y: 0,
        opacity: 1,
        display: "flex",
        duration: 0.3,
      });
    } else {
      gsap.to(panelRef.current, {
        y: -20,
        opacity: 0,
        display: "none",
        duration: 0.3,
      });
    }
  }, [showbar, DataToDelete.length]);

  // Animate vertical button opacity based on selection
  useEffect(() => {
    if (DataToDelete.length > 0) {
      gsap.to(buttonRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.3 });
    } else {
      gsap.to(buttonRef.current, { opacity: 0.4, pointerEvents: "none", duration: 0.3 });
    }
  }, [DataToDelete.length]);

  const DeleteHandler = () => {
    if (DataToDelete.length <= 0) return;
    DeleteMessage(SelectedUser._id);
    setShowbar(false);
  };

  return (
    <div className="relative w-full flex items-center justify-between bg-slate-500/50 border-b border-slate-700/50 md:px-4 lg:px-4 px-2 z-10">
      <div className="flex items-center">
        <button className="p-2" onClick={() => setSelectedUser(null)}>
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-3 py-4 px-1">
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="size-12 rounded-full">
              <img
                src={SelectedUser?.profilepic || "/avatar.png"}
                alt={SelectedUser?.fullName}
              />
            </div>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium">{SelectedUser?.fullName}</h3>
            <p className="text-slate-400">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>

      {/* Vertical menu button */}
      <button
        ref={buttonRef}
        onClick={() => setShowbar(!showbar)}
        className="p-2 rounded-full transition-colors duration-200"
      >
        <MoreVertical size={24} />
      </button>

      {/* Slide panel */}
      <div
        ref={panelRef}
        className="absolute right-2 top-full mt-2 flex flex-col bg-black rounded-lg gap-1 overflow-hidden"
        style={{ display: "none", opacity: 0 }}
      >
        <button
          className="px-4 py-2 text-red-500 hover:bg-gray-700 text-left w-full"
          onClick={() => {
            if (IsSoundeEnabled) {
              const sound = new Audio("/sounds/sounds_mouse-click.mp3");
              sound.currentTime = 0;
              sound.play().catch((err) => console.log(err.message));
            }
            DeleteHandler();
          }}
        >
          Delete
        </button>

        <button
          className="px-4 py-2 text-white hover:bg-gray-700 text-left w-full"
          onClick={() => {
            setShowbar(false);
            setDataToDelete([]);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
