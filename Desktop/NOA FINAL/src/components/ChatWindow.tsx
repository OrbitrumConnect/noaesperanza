import React from "react";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  messages: { message: string; sender: "user" | "noa" }[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex flex-col p-4 overflow-y-auto h-[400px]">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg.message} sender={msg.sender} />
      ))}
    </div>
  );
};
