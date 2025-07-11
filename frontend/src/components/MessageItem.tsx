import { Check, CheckCheck, Pencil, Trash2, MoreVertical } from "lucide-react";
import { useState, useRef } from "react";
import { useChatStore, type Message } from "../store/useChatStore";
import vite from "../assets/vite.svg";
import { formatMessageTime } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
interface MessageItemProps {
  message: Message;
  isMyMessage: boolean;

  editingMessageId: string | null;
  editText: string;
  onEditSubmit: (e: React.FormEvent) => void;
  onEditChange: (text: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string, text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export const MessageItem = ({
  message,
  isMyMessage,

  editingMessageId,
  editText,
  onEditSubmit,
  onEditChange,
  onContextMenu,
  onEdit,
  onDelete,
}: MessageItemProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div
      className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
      onContextMenu={(e) =>
        isMyMessage && onContextMenu(e, message._id, message.text)
      }
    >
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              isMyMessage
                ? authUser?.profilePic || vite
                : selectedUser?.profilePic || vite
            }
            alt="profilePic"
          />
        </div>
      </div>

      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
        {message.isRead && isMyMessage ? (
          <span className="text-green-500 text-xs ml-2 flex items-center gap-1">
            <CheckCheck size={14} /> Seen
          </span>
        ) : (
          <span className="text-gray-500 text-xs ml-2 flex items-center gap-1">
            <Check size={14} />
          </span>
        )}
      </div>

      {editingMessageId === message._id ? (
        <form onSubmit={onEditSubmit} className="chat-bubble">
          <input
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="input w-full text-black"
          />
          <button className="btn btn-sm mt-2">Save</button>
        </form>
      ) : (
        <div className="chat-bubble flex flex-col relative group">
          {message.image && (
            <img
              className="sm:max-w-[200px] rounded-md mb-2"
              src={`http://localhost:5001${message.image}`}
              alt="Attachment"
            />
          )}
          {message.text && (
            <p className={`${isMyMessage ? "pr-5 lg:pr-0 " : ""}`}>
              {message.text}
            </p>
          )}

          {isMyMessage && (
            <>
              <button
                className="md:hidden absolute right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={toggleMobileMenu}
              >
                <MoreVertical size={10} />
              </button>

              {mobileMenuOpen && (
                <div
                  ref={mobileMenuRef}
                  className="md:hidden absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 z-50 w-32"
                >
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => onEdit(message._id, message.text)}
                  >
                    <Pencil size={14} className="text-blue-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => onDelete(message._id)}
                  >
                    <Trash2 size={14} className="text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
