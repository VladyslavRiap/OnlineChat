import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { Socket } from "socket.io-client";

export interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePic?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  image: string;
  isRead: boolean;
}

interface ChatState {
  users: User[];
  selectedUser: User | null;
  userIsLoading: boolean;
  messageIsLoading: boolean;
  messages: Message[];
  socket: Socket | null;
  getUsers: () => Promise<void>;
  getMessages: (userId: User["_id"]) => Promise<void>;
  sendMessage: (data: FormData) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  updateUsersOnlineStatus: (userIds: string[]) => void;
  subscribeToMessages: () => void;
  unSubscribeFromMessages: () => void;
  lastMessagesMap: Record<string, Message | undefined>;
  getLastMessagesForUsers: () => Promise<void>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
  unreadCountMap: Record<string, number>;
  getUnreadCounts: () => Promise<void>;
  deleteMessage: (messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  selectedUser: null,
  userIsLoading: false,
  messageIsLoading: false,
  messages: [],
  socket: null,
  lastMessagesMap: {},
  unreadCountMap: {},

  getUsers: async () => {
    set({ userIsLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/messages/user");
      const currentOnlineIds = get()
        .users.filter((u) => u.isOnline)
        .map((u) => u._id);

      const updatedUsers = res.data.map((user) => ({
        ...user,
        isOnline: currentOnlineIds.includes(user._id),
      }));

      set({ users: updatedUsers });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to get users";
      toast.error(errorMessage);
    } finally {
      set({ userIsLoading: false });
    }
  },

  getMessages: async (userId: User["_id"]) => {
    set({ messageIsLoading: true });
    try {
      const res = await axiosInstance.get<Message[]>(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch messages";
      toast.error(errorMessage);
    } finally {
      set({ messageIsLoading: false });
    }
  },
  getLastMessagesForUsers: async () => {
    try {
      const res = await axiosInstance.get<{
        [userId: string]: Message;
      }>("/messages/last-messages");

      set({ lastMessagesMap: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch messages";
      toast.error(errorMessage);
    }
  },
  sendMessage: async (messageData: FormData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post<Message>(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
      set((state) => ({
        lastMessagesMap: {
          ...state.lastMessagesMap,
          [selectedUser._id]: res.data,
        },
      }));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },
  updateUsersOnlineStatus: (userIds) => {
    set((state) => ({
      users: state.users.map((user) => ({
        ...user,
        isOnline: userIds.includes(user._id),
      })),
    }));
  },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("updateReadStatus");
    socket.off("updateUnreadCounts");
    socket.off("updateLastMessage");
    socket.off("messageDeleted");
    socket.off("newMessage");

    socket.on("updateReadStatus", ({ userId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.receiverId === userId ? { ...msg, isRead: true } : msg
        ),
      }));
    });

    socket.on("updateUnreadCounts", (counts) => {
      set({ unreadCountMap: counts });
    });

    socket.on("updateLastMessage", ({ userId, lastMessage }) => {
      set((state) => ({
        lastMessagesMap: {
          ...state.lastMessagesMap,
          [userId]: lastMessage,
        },
      }));
    });

    socket.on("messageDeleted", ({ messageId, senderId, receiverId }) => {
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) return;

      const { selectedUser } = get();
      const currentChatUserId = selectedUser?._id;

      if (currentChatUserId === senderId || currentChatUserId === receiverId) {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      }

      get().getLastMessagesForUsers();
    });

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, lastMessagesMap, unreadCountMap } = get();
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) return;

      const isChatOpen =
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id);

      const otherUserId =
        newMessage.senderId === authUser._id
          ? newMessage.receiverId
          : newMessage.senderId;

      if (isChatOpen) {
        set({ messages: [...messages, newMessage] });
      } else {
        set({
          unreadCountMap: {
            ...unreadCountMap,
            [otherUserId]: (unreadCountMap[otherUserId] || 0) + 1,
          },
        });
      }

      set({
        lastMessagesMap: {
          ...lastMessagesMap,
          [otherUserId]: newMessage,
        },
      });
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      toast.success(res.data.message);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));

      await get().getLastMessagesForUsers();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to delete message";
      toast.error(errorMessage);
    }
  },
  markMessagesAsRead: async (senderId: string) => {
    try {
      await axiosInstance.patch(`/messages/${senderId}/read-all`);
      const socket = useAuthStore.getState().socket;
      socket?.emit("messagesRead", { senderId });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to mark messages as read";
      toast.error(errorMessage);
    }
  },

  getUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get<Record<string, number>>(
        "/messages/unread-counts"
      );
      set({ unreadCountMap: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Failed to fetch unread counts";
      toast.error(errorMessage);
    }
  },
}));
