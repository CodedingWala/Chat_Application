import { useChatStore } from "../Store/useChatStore";
import { GroupStore } from "../Store/useGroupChatStore";

function ActiveTabSwitch() {
  
  const { ActiveTab, setSelectedTab } = useChatStore()
   const { setSelectedGroup}=GroupStore()
  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
       <button
        onClick={() => {
          setSelectedTab("groups")

        }}
        className={`tab ${
         ActiveTab === "groups" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Groups
      </button>
      <button
        onClick={() => {
          setSelectedTab("chats")
        }}
        className={`tab ${
          ActiveTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => {
          setSelectedTab("contacts")
        }}
        className={`tab ${
         ActiveTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;