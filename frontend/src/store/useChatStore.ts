import type { AxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { Socket } from "socket.io-client";

interface User {
  _id: string;
  username: string;
  fullName: string;
  profilePic?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  image: string;
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
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  selectedUser: null,
  userIsLoading: false,
  messageIsLoading: false,
  messages: [],
  socket: null,

  getUsers: async () => {
    set({ userIsLoading: true });
    try {
      const res = await axiosInstance.get<User[]>("/messages/user");
      set({ users: res.data });
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

  sendMessage: async (messageData: FormData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post<Message>(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
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
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket?.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },
  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
}));
