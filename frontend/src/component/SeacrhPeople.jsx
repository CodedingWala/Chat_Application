import React, { useEffect, useState } from 'react'
import { SearchIcon } from "lucide-react"
import { useChatStore } from '../Store/useChatStore'
import { GroupStore } from '../Store/useGroupChatStore'

function SearchPeople() {
    const { 
        ActiveTab, 
        setFindingData, 
        clearFindingData, 
        AllContacts, 
        Chats 
    } = useChatStore()

    const { ChatGroups } = GroupStore()
    const [searchTerm, setSearchTerm] = useState("")

useEffect(() => {
    const debounceTimer = setTimeout(() => {
        const trimmedTerm = searchTerm.trim().toLowerCase();

        if (!trimmedTerm) {
            clearFindingData();
            return;
        }

        let filtered = [];

        if (ActiveTab.toLowerCase() === "chats") {
            filtered = Chats.filter(chat =>
                chat.fullName.toLowerCase().includes(trimmedTerm)
            );
            console.log("running for the chat tab ",filtered)
        } else if (ActiveTab.toLowerCase() === "contacts") {
            filtered = AllContacts.filter(contact =>
                contact.fullName.toLowerCase().includes(trimmedTerm)
            );
        } else if (ActiveTab.toLowerCase() === "groups") {
            filtered = ChatGroups.filter(group =>
                group.name.toLowerCase().includes(trimmedTerm)
            );
        }

        setFindingData(filtered);
    }, 300);

    return () => clearTimeout(debounceTimer);
}, [searchTerm, ActiveTab, Chats, AllContacts, ChatGroups]); // ✅ Add arrays as dependencies



    return (
        <div className='border-y-2 flex items-center px-2 gap-2 bg-slate-200'>
            <SearchIcon className='text-slate-700' size={24} />
            <input
                className='w-full outline-none px-2 py-2 bg-slate-200 text-slate-700'
                placeholder={`Search ${ActiveTab}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
            />
        </div>
    )
}

export default SearchPeople
