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
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-hover text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        >
          <MdChat className="h-6 w-6" />
        </button>
      ) : (
        <div className="h-[500px] w-[350px] rounded-2xl bg-primary-card shadow-2xl text-text-primary border border-gray-700/50 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-accent-primary to-accent-hover p-4 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center">
              <MdChat className="mr-2 h-5 w-5" />
              Asistente Virtual
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-all duration-200 p-1 rounded-lg hover:bg-white/10"
            >
              <MdClose className="h-6 w-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="h-[380px] overflow-y-auto p-4 bg-primary-card">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  chat.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-md transition-all duration-200 ${
                    chat.type === "user"
                      ? "bg-gradient-to-br from-accent-primary to-accent-hover text-white shadow-lg"
                      : "bg-gray-700/80 text-text-primary border border-gray-600/50 backdrop-blur-sm"
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2 border-t border-gray-700/50 p-4 bg-primary-card rounded-b-2xl">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe tu mensaje..."
              className="w-full rounded-xl border border-gray-600/50 bg-gray-700/80 p-3 text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 backdrop-blur-sm"
            />
            <button
              onClick={handleSendMessage}
              className="rounded-xl bg-gradient-to-br from-accent-primary to-accent-hover p-3 text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <MdSend className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot; 