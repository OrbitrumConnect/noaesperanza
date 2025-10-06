import React from "react";

interface ChatMessageProps {
  message: string;
  sender: "user" | "noa";
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender }) => {
  const isUser = sender === "user";
  return (
    <div
      className={`p-2 my-1 rounded-md max-w-[75%] ${
        isUser ? "ml-auto bg-blue-100 text-right" : "mr-auto bg-gray-100"
      }`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
};
