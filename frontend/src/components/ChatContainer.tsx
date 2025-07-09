import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import MeessageSkeleton from "./skeletons/MeessageSkeleton";
import MessageInput from "./MessageInput";
import vite from "../assets/vite.svg";
const ChatContainer = () => {
  const {
    messages,
    getMessages,
    messageIsLoading,
    selectedUser,
    subscribeToMessages,
    unSubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unSubscribeFromMessages();
    }
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unSubscribeFromMessages,
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    });

    return () => cancelAnimationFrame(frame);
  }, [messages]);
  if (messageIsLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MeessageSkeleton />
      </div>
    );
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1  overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser?._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser?._id
                      ? authUser.profilePic === ""
                        ? vite
                        : `http://localhost:5001${authUser.profilePic}`
                      : selectedUser?.profilePic === ""
                      ? vite
                      : `http://localhost:5001${selectedUser?.profilePic}`
                  }
                  alt="profilePic"
                ></img>
              </div>
            </div>
            <div className="chat-header mb-1 ">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  className="sm:max-w-[200px] rounded-md mb-2"
                  src={`http://localhost:5001${message.image}`}
                  alt="Attachmend"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
