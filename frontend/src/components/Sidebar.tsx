import { Users, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import vite from "../assets/vite.svg";
import { useMediaQuery } from "../lib/hooks";
import { format } from "date-fns";
import SidebarSkeleton from "./skeletons/SdiebarSkeleton";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    userIsLoading,
    getLastMessagesForUsers,
    lastMessagesMap,
    getUnreadCounts,
    unreadCountMap,
  } = useChatStore();

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    getUsers();
    getLastMessagesForUsers();
    getUnreadCounts();
  }, [getUsers, getLastMessagesForUsers, getUnreadCounts]);

  const sortedUsers = [...users].sort((a, b) => {
    const aLastMsg = lastMessagesMap[a._id];
    const bLastMsg = lastMessagesMap[b._id];

    if (aLastMsg && bLastMsg) {
      return (
        new Date(bLastMsg.createdAt).getTime() -
        new Date(aLastMsg.createdAt).getTime()
      );
    }

    if (bLastMsg) return 1;
    if (aLastMsg) return -1;

    return 0;
  });

  if (userIsLoading) return <SidebarSkeleton />;

  return (
    <aside
      className={`h-full ${
        isMobile ? "w-full border-l" : "w-20 lg:w-80 border-r"
      } border-base-300 flex flex-col transition-all duration-200`}
    >
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full ">
        {sortedUsers.map((user) => {
          const lastMessage = lastMessagesMap[user._id];
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                isSelected ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={
                    user.profilePic
                      ? `${import.meta.env.VITE_BACKEND_URL}${user.profilePic}`
                      : vite
                  }
                  alt={user.username}
                  className="size-12 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-zinc-900 ${
                    user.isOnline ? "bg-green-300" : "bg-gray-300"
                  }`}
                ></span>
              </div>

              <div className="flex-1 min-w-0 hidden lg:block">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-base-content truncate">
                    {user.fullName}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {format(new Date(lastMessage.createdAt), "HH:mm")}
                    </span>
                  )}
                </div>

                {lastMessage && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-primary truncate flex flex-auto justify-between">
                      {lastMessage.text || "📷 Image"}
                    </p>
                    {lastMessage.isRead && (
                      <CheckCheck className="size-3 text-blue-400" />
                    )}
                    {(unreadCountMap?.[user._id] ?? 0) > 0 && (
                      <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full px-2 py-0.5 leading-none">
                        {unreadCountMap[user._id]}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isMobile && (
                <div className="flex-1 min-w-0 block lg:hidden">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate text-base-content">
                      {user.fullName}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {format(new Date(lastMessage.createdAt), "HH:mm")}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-primary truncate flex flex-auto">
                        {lastMessage.text || "📷 Image"}
                      </p>
                      {lastMessage.isRead && (
                        <CheckCheck className="size-3 text-blue-400" />
                      )}
                      {(unreadCountMap?.[user._id] ?? 0) > 0 && (
                        <span className="text-[10px] font-semibold bg-red-500 text-white rounded-full px-2 py-0.5 leading-none">
                          {unreadCountMap[user._id]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
