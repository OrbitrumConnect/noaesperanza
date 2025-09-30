import React from "react";
import { formatTimestamp } from "../utils/helpers";

interface ChatMessageProps {
  message: string;
  sender: "user" | "noa";
  timestamp?: Date;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  sender, 
  timestamp = new Date(),
  isTyping = false 
}) => {
  const isUser = sender === "user";
  const isTypingMessage = isTyping || message === "Typing...";
  
  if (isTypingMessage) {
    return (
      <div
        className="p-2 my-1 rounded-md max-w-[75%] mr-auto bg-gray-100"
        data-testid="typing-indicator"
      >
        <p className="text-sm">Typing...</p>
        <div data-testid="ai-avatar">typing</div>
      </div>
    );
  }

  return (
    <div
      className={`p-2 my-1 rounded-md max-w-[75%] ${
        isUser ? "ml-auto bg-blue-100 text-right" : "mr-auto bg-gray-100"
      }`}
      data-testid={isUser ? "user-message" : "ai-message"}
    >
      <p className="text-sm">{message}</p>
      {timestamp && (
        <span className="text-xs text-gray-500">
          {formatTimestamp(timestamp)}
        </span>
      )}
    </div>
  );
};
