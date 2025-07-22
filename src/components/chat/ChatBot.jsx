import React, { useState } from "react";
import { MdChat, MdClose, MdSend } from "react-icons/md";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-all hover:bg-brand-600"
        >
          <MdChat className="h-6 w-6" />
        </button>
      ) : (
        <div className="h-[500px] w-[350px] rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-brand-500 p-4">
            <h3 className="text-lg font-bold text-white">Asistente Virtual</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[380px] overflow-y-auto p-4">
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
      )}
    </div>
  );
};

export default ChatBot; 