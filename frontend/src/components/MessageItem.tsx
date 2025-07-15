import { Check, CheckCheck, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { type Message } from "../store/useChatStore";
import { format } from "date-fns";

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
      onContextMenu={(e) =>
        isMyMessage && onContextMenu(e, message._id, message.text)
      }
    >
      {editingMessageId === message._id ? (
        <form onSubmit={onEditSubmit} className="chat-bubble w-full max-w-xs">
          <input
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="input w-full text-black"
            autoFocus
          />
          <button className="btn btn-sm mt-2">Save</button>
        </form>
      ) : (
        <div
          className={`chat-bubble relative group break-words max-w-[75%] w-fit ${
            isMyMessage
              ? "bg-primary  text-primary-content self-end"
              : "self-start bg-base-200"
          }`}
        >
          {message.image && (
            <img
              className="sm:max-w-[200px] rounded-md mb-2"
              src={`${import.meta.env.VITE_BACKEND_URL}${message.image}`}
              alt="Attachment"
            />
          )}

          {message.text && (
            <div className="relative">
              <p
                className={`pr-7 whitespace-pre-wrap   ${
                  isMyMessage
                    ? "text-primary-content/70"
                    : "text-base-content/70"
                }`}
              >
                {message.text}
              </p>
              <time
                className={`absolute right-[-0.6rem] bottom-[-0.3rem] text-xs opacity-50${
                  isMyMessage
                    ? "text-primary-content/70"
                    : "text-base-content/70"
                }`}
              >
                {format(new Date(message.createdAt), "HH:mm")}
              </time>

              {isMyMessage &&
                (message.isRead ? (
                  <span className=" absolute  right-[-0.4rem] top-[-0.3rem]  text-green-500 text-xs ml-2 flex items-center gap-1">
                    <CheckCheck size={14} />
                  </span>
                ) : (
                  <span className=" absolute right-[-0.4rem] top-[-0.3rem] text-gray-500 text-xs ml-2 flex items-center gap-1">
                    <Check size={14} />
                  </span>
                ))}
            </div>
          )}

          {isMyMessage && (
            <>
              {mobileMenuOpen && (
                <div
                  ref={mobileMenuRef}
                  className="md:hidden absolute right-0 top-10 bg-white shadow-lg rounded-md py-2 z-50 w-32"
                >
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => {
                      onEdit(message._id, message.text);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Pencil size={14} className="text-blue-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => {
                      onDelete(message._id);
                      setMobileMenuOpen(false);
                    }}
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

export default MessageItem;
