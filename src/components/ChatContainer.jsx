import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  console.log("authUser ID:", authUser?._id);
  console.log("Messages:", messages);

messages.forEach((msg, i) => {
  if (!msg || !msg.senderId) {
    console.warn(`⚠️ Message ${i} has no senderId`, msg);
  } else {
    console.log(`Message from: ${msg.senderId} - should align ${msg.senderId === authUser._id ? "right" : "left"}`);
  }
});

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
 {messages.map((message, index) => {
  if (!message || (!message.text && !message.image)) return null;

  return (
    <div
      key={message._id || `temp-${index}`}
      className={`chat ${String(message.senderId) === String(authUser?._id) ? "chat-end" : "chat-start"}`}
    >
      {/* profile + header */}
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              String(message.senderId) === String(authUser?._id)
                ? authUser.profilePic || "/avatar.png"
                : selectedUser.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>
      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt || new Date())}
        </time>
      </div>
      <div className="chat-bubble flex flex-col">
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}
        {message.text && <p>{message.text}</p>}
      </div>
    </div>
  );
})}
  <div ref={messageEndRef} />
</div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
