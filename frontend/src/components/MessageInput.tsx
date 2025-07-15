import { Image, Send, X } from "lucide-react";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useChatStore();

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleSend = async () => {
    if (!text.trim() && !imageFile) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (imageFile) formData.append("image", imageFile);

    await sendMessage(formData);
    setText("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  return (
    <div className="w-full border-t border-base-300 bg-base-100">
      <form onSubmit={handleFormSubmit} className="mt-2">
        {imagePreview && (
          <div className="mb-2">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-24 object-cover rounded-lg border border-zinc-300"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message..."
            rows={1}
            className="w-full resize-none text-base py-2 pr-20 px-4 bg-transparent outline-none border-none focus:ring-0 scrollbar-hide"
            style={{
              minHeight: "40px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          />

          <div className="absolute right-4 bottom-[35%] flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-500 hover:text-secondary"
            >
              <Image size={20} />
            </button>
            <button
              type="submit"
              disabled={!text.trim() && !imagePreview}
              className="text-zinc-500 hover:text-primary disabled:opacity-40"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </form>
    </div>
  );
};

export default MessageInput;
