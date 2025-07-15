import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
interface AuthUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  profilePic: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: string;
}

interface signUpData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}
interface loginData {
  email: string;
  password: string;
}
interface AuthState {
  authUser: AuthUser | null;
  isSignUp: boolean;
  isChekingAuth: boolean;
  isUpdatingProfile: boolean;
  socket: Socket | null;
  checkAuth: () => Promise<void>;
  signUp: (data: signUpData) => Promise<void>;
  isLoggingIn: boolean;
  login: (data: loginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  updateFullName: (fullName: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateOnlineStatus: (userIds: string[]) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSignUp: false,
  isLoggingIn: false,
  isChekingAuth: true,
  isUpdatingProfile: false,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<AuthUser>("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("❌ checkAuth error:", error);
    } finally {
      set({ isChekingAuth: false });
    }
  },
  signUp: async (data) => {
    set({ isSignUp: true });

    try {
      const res = await axiosInstance.post<AuthUser>("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created scucsessfully");
      get().connectSocket();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Sign up failed";
      toast.error(errorMessage);
    } finally {
      set({ isSignUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<AuthUser>("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logging in succcsessfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Login up is failed";
      toast.error(errorMessage);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post<AuthUser>("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logout is succsessfully ");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "logout  is failed";
      toast.error(errorMessage);
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put<AuthUser>(
        "/auth/update-profile",
        data
      );
      set({ authUser: res.data });
      toast.success("Profile photo updated successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Update is failed";
      toast.error(errorMessage);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  updateFullName: async (fullName) => {
    try {
      const res = await axiosInstance.put<AuthUser>("/auth/update-fullname", {
        fullName,
      });
      set({ authUser: res.data });
      toast.success("Profile full name update successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Update name is failed";
      toast.error(errorMessage);
    }
  },
  updateUsername: async (username) => {
    try {
      const res = await axiosInstance.put<AuthUser>("/auth/update-username", {
        username,
      });
      set({ authUser: res.data });
      toast.success("Profile username update successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Update username is failed";
      toast.error(errorMessage);
    }
  },
  changePassword: async (currentPassword, newPassword) => {
    try {
      await axiosInstance.post<AuthUser>("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Profile password update successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || "Update password is failed";
      toast.error(errorMessage);
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket: Socket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();
    set({ socket });
    useChatStore.getState().subscribeToMessages();
    socket.on("getOnlineUsers", (userIds: string[]) => {
      get().updateOnlineStatus(userIds);
      useChatStore.getState().updateUsersOnlineStatus(userIds);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
    set({ socket: null });
  },

  updateOnlineStatus: (userIds) => {
    const { authUser } = get();
    if (!authUser) return;

    const isCurrentUserOnline = userIds.includes(authUser._id);
    const updatedAuthUser = { ...authUser, isOnline: isCurrentUserOnline };
    set({ authUser: updatedAuthUser });
  },
}));
