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
      // set({ messages: [...messages, res.data] });
      const message = res.data.message;
      if (!message.createdAt) message.createdAt = new Date().toISOString();
      set({ messages: [...messages, message] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
  const { selectedUser, messages } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket is not initialized yet");
    return;
  }

  socket.off("newMessage");

  socket.on("newMessage", (newMessage) => {
  if (!newMessage?.text && !newMessage?.image) return;

  if (!newMessage.createdAt) newMessage.createdAt = new Date().toISOString();

  const currentSelected = get().selectedUser;
  if (!currentSelected) return;

  const senderId = newMessage.senderId._id || newMessage.senderId;
  const receiverId = newMessage.receiverId._id || newMessage.receiverId;

  const isFromSelectedUser = senderId === currentSelected._id;
  const isToSelectedUser = receiverId === currentSelected._id;

  if (!isFromSelectedUser && !isToSelectedUser) return;

  set({ messages: [...get().messages, newMessage] });
});
},
unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) return; 
  socket.off("newMessage");
},

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
