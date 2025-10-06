import React from "react";
import { ChatMessage } from "./ChatMessage";

interface ChatWindowProps {
  messages: { message: string; sender: "user" | "noa" }[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="fixed bottom-20 left-4 w-80 h-[400px] z-20 bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl">
      <div className="flex flex-col p-4 overflow-y-auto h-full">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.message} sender={msg.sender} />
        ))}
      </div>
    </div>
  );
};
