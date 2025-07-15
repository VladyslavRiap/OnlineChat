import { ChevronLeft, X } from "lucide-react";
import vite from "../assets/vite.svg";
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { formatLastSeen } from "../lib/utils";
import { useMediaQuery } from "../lib/hooks";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, users } = useChatStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [user, setUser] = useState(selectedUser);

  useEffect(() => {
    const updatedUser = users.find((u) => u._id === selectedUser?._id);
    setUser(updatedUser || selectedUser);
  }, [users, selectedUser]);

  return (
    <div className="p-2.5 border-b bg-base-100 border-base-300 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={
                  user?.profilePic
                    ? `${import.meta.env.VITE_BACKEND_URL}${user.profilePic}`
                    : vite
                }
                alt={user?.fullName}
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{user?.fullName}</h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  user?.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <p className="text-sm text-base-content/70">
                {user?.isOnline
                  ? "Online"
                  : user?.lastSeen
                  ? `Last seen: ${formatLastSeen(user.lastSeen)}`
                  : "Offline"}
              </p>
            </div>
          </div>
        </div>
        {isMobile ? (
          <button
            onClick={() => {
              setSelectedUser(null);
            }}
          >
            <ChevronLeft />
          </button>
        ) : (
          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
