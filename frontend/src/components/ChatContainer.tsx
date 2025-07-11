import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "../store/useChatStore";

import MessageInput from "./MessageInput";

import toast from "react-hot-toast";
import MeessageSkeleton from "./skeletons/MeessageSkeleton";
import { ContextMenu } from "./ContextMenu";
import { MessageItem } from "./MessageItem";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    messageIsLoading,
    selectedUser,
    subscribeToMessages,
    unSubscribeFromMessages,
    deleteMessage,
    updateMessage,
  } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null as string | null,
    messageText: "",
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        setKeyboardHeight(window.innerHeight - visualViewport.height);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

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

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages]);

  const handleContextMenu = (
    e: React.MouseEvent,
    messageId: string,
    messageText: string
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId,
      messageText,
    });
  };

  const handleEdit = (id: string, currentText: string) => {
    setEditingMessageId(id);
    setEditText(currentText);
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessageId || !editText.trim()) return;

    await updateMessage(editingMessageId, editText);
    setEditingMessageId(null);
    setEditText("");
    toast.success("Message updated");
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);
    toast.success("Message deleted");
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  if (messageIsLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MeessageSkeleton />
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-auto"
      style={{
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight - 40}px` : "0",
      }}
    >
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            isMyMessage={message.senderId === authUser?._id}
            editingMessageId={editingMessageId}
            editText={editText}
            onEditSubmit={handleEditSubmit}
            onEditChange={setEditText}
            onContextMenu={handleContextMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() =>
            contextMenu.messageId &&
            handleEdit(contextMenu.messageId, contextMenu.messageText)
          }
          onDelete={() =>
            contextMenu.messageId && handleDelete(contextMenu.messageId)
          }
        />
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
