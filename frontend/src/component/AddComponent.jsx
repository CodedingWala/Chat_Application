import React, { useEffect, useState } from "react";
import { GroupStore } from "../Store/useGroupChatStore";
import { useChatStore } from "../Store/useChatStore";
import PageLoad from "./PageLoad";
import { Authzustand } from "../Store/useAuthStore";

function AddComponent({ setIsAdding }) { // use prop only
  const {
    selectedGroup,
    leaveGroup,
    AddMember,
    selectMembers,
    setSelectMembers,
  } = GroupStore();

  const { AllContacts, getAllcontacts } = useChatStore();
  const {authUser}=Authzustand()

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch contacts once
  useEffect(() => {
    getAllcontacts();
  }, []);

  // Update contacts when AllContacts changes
  useEffect(() => {
    if (AllContacts && AllContacts.length > 0) {
      setContacts(AllContacts);
    }
  }, [AllContacts]);

  if (!contacts.length) return <PageLoad />;
  if (!selectedGroup) return <p>No group selected</p>;

  const handleAdd = async (contactId) => {
    try {
      setLoading(true);
      setSelectMembers([contactId]);
      await AddMember();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (contactId) => {
    try {
      setLoading(true);
      await leaveGroup(selectedGroup._id, [contactId]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsAdding(false); // hide AddComponent
    setSelectMembers(null); // reset selected members
  };

  return loading ? (
    <PageLoad />
  ) : (
    <div className="w-full h-full  p-4 bg-gray-900 text-white relative">
      {/* Close Icon */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
      >
        ×
      </button>

      <h2 className="text-xl font-semibold mb-4">Group Members</h2>

      <div className="flex flex-col space-y-3 h-full overflow-y-auto">
        {contacts.map((contact) => {
          if (contact._id ===authUser._id) return null;
          const isMember = selectedGroup.members.includes(contact._id);


          return (
            <div
              key={contact._id}
              className="flex items-center justify-between bg-gray-800 rounded-lg p-2"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={contact.email}
                  className="w-10 h-10 rounded-full"
                />
                <span>{contact.email}</span>
              </div>

              <button
                className={`px-3 py-1 rounded-md font-medium ${isMember
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
                  }`}
                onClick={() =>
                  isMember ? handleRemove(contact._id) : handleAdd(contact._id)
                }
              >
                {isMember ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AddComponent;
