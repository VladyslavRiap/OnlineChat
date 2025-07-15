import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";

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
    markMessagesAsRead,
  } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null as string | null,
    messageText: "",
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!selectedUser?._id) return;

      const authUser = useAuthStore.getState().authUser;
      if (!authUser) return;

      subscribeToMessages();

      await getMessages(selectedUser._id);

      const msgs = useChatStore.getState().messages;
      const hasUnread = msgs.some(
        (msg) =>
          msg.senderId === selectedUser._id &&
          msg.receiverId === authUser._id &&
          !msg.isRead
      );

      if (hasUnread) {
        markMessagesAsRead(selectedUser._id);
      }
    };

    run();
    return () => unSubscribeFromMessages();
  }, [selectedUser?._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, 50);
    return () => clearTimeout(timer);
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
  };

  const handleDelete = async (id: string) => {
    await deleteMessage(id);

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
    <div className="flex flex-1 flex-col h-full bg-base-300">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
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
