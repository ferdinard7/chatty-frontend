import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/auth/users");
      console.log("Users:", res.data.users);
      set({ users: res.data.users });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      console.log("Messages:", res.data.message);
      set({ messages: res.data.message });
    } catch (error) {
      toast.error(error.response?.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/message/send-message/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket is not initialized yet");
    return;
  }

  // Remove existing listener before adding a new one
  socket.off("newMessage");

 socket.on("newMessage", (newMessage) => {
  const authUser = useAuthStore.getState().authUser;
  const selectedUser = get().selectedUser;
  console.log("new message", newMessage);

  const isIncomingFromSelectedUser = newMessage.senderId === selectedUser._id;
  const isOutgoingToSelectedUser = newMessage.receiverId === selectedUser._id;

  if (!isIncomingFromSelectedUser && !isOutgoingToSelectedUser) return;

  set({
    messages: [...get().messages, newMessage],
  });
});
},
unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return; 
  socket.off("newMessage");
},

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
