import React, { useState } from "react";
import { MdClose, MdSend } from "react-icons/md";

const ChatWindow = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "bot",
      message: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Agregar mensaje del usuario
    setChatHistory([
      ...chatHistory,
      { type: "user", message: message },
    ]);

    // Simular respuesta del bot
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "bot",
          message: "Gracias por tu mensaje. Estoy procesando tu consulta...",
        },
      ]);
    }, 1000);

    setMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="h-[600px] w-[400px] rounded-lg bg-primary-card shadow-xl text-text-primary">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-brand-500 p-4">
          <h3 className="text-lg font-bold text-white">Asistente Virtual</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-[480px] overflow-y-auto p-4">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                chat.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  chat.type === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {chat.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 border-t p-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Escribe tu mensaje..."
            className="w-full rounded-lg border border-gray-300 p-2 focus:border-brand-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600"
          >
            <MdSend className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 