import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// import.meta.env.MODE === "development" ?
const BASE_URL ="http://localhost:3002";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

checkAuth: async () => {
  set({ isCheckingAuth: true });
  console.log("🔍 Checking auth...");

  try {
    const res = await axiosInstance.get("/auth/check-auth");
    console.log("✅ Auth check response:", res.data);

    set({ authUser: res.data.user });
    get().connectSocket();
  } catch (error) {
    console.error("❌ Error in checkAuth:", error?.response?.data || error.message);
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
    console.log("✅ Done checking auth");
  }
},

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
          const res = await axiosInstance.put("/auth/update-profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
      console.log("updated profile", res.data.data);
      set({ authUser: res.data, isUpdatingProfile: false});
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

 connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
    query: {
      userId: authUser._id,
    },
  });

  socket.connect(); // optional; io() usually auto-connects

  socket.on("connect", () => {
    console.log("✅ Connected to socket:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  set({ socket });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });
},
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));


//  connectSocket: () => {
//   const { authUser, socket } = get();
//   if (!authUser || !authUser._id || socket?.connected) return;

//   const newSocket = io(BASE_URL, {
//     query: {
//       userId: authUser._id,
//     },
//   });

//   newSocket.connect();

//   newSocket.on("connect", () => {
//     console.log("Socket connected:", newSocket.id);
//   });

//   newSocket.on("getOnlineUsers", (userIds) => {
//     set({ onlineUsers: userIds });
//   });

//   set({ socket: newSocket });
// },