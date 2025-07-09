import { Users } from "lucide-react";
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SdiebarSkeleton";
import vite from "../assets/vite.svg";
const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, userIsLoading } =
    useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);
  if (userIsLoading) return <SidebarSkeleton />;
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 ">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedUser?._id === user._id
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className=" relative mx-auto lg:mx-0">
              <img
                src={
                  user.profilePic
                    ? `http://localhost:5001${user.profilePic}`
                    : vite
                }
                alt={user.username}
                className="size-12 rounded-full object-cover"
              />
              {user.isOnline ? (
                <span className="absolute bottom-0 bg-green-300 size-3 rounded-full right-0  ring-2 ring-zinc-900"></span>
              ) : (
                <span className="absolute bottom-0 bg-gray-300 size-3 rounded-full right-0  ring-2 ring-zinc-900"></span>
              )}
            </div>
            <div className="text-left hidden lg:block  min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {user.isOnline ? "online" : "offline"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
