import React, { useState } from "react";

interface InputBoxProps {
  onSend: (text: string) => void;
  isSending: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSend, isSending }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t">
      <input
        className="flex-1 p-2 border rounded-md"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua mensagem..."
        disabled={isSending}
      />
      <button
        type="submit"
        disabled={isSending}
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        Enviar
      </button>
    </form>
  );
};
