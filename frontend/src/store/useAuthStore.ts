import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface AuthUser {
  id: string;
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
  checkAuth: () => Promise<void>;
  signUp: (data: signUpData) => Promise<void>;
  isLoggingIn: boolean;
  login: (data: loginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  isSignUp: false,
  isLoggingIn: false,
  isChekingAuth: false,
  isUpdatingProfile: false,

  checkAuth: async () => {
    set({ isChekingAuth: true });

    try {
      const res = await axiosInstance.get<AuthUser>("/auth/check");

      set({ authUser: res.data });
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
}));
