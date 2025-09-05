import React, { useState, useEffect } from "react";
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from "react-icons/md";

const NotificationManager = ({ mensajes, setMensajes }) => {
  // Función para cerrar una notificación específica
  const closeNotification = (index) => {
    setMensajes((prev) => prev.filter((_, i) => i !== index));
  };

  // Función para cerrar todas las notificaciones
  const closeAllNotifications = () => {
    setMensajes([]);
  };

  // Función para obtener el ícono según el tipo
  const getIcon = (tipo) => {
    switch (tipo) {
      case "success":
        return <MdCheckCircle className="w-5 h-5" />;
      case "error":
        return <MdError className="w-5 h-5" />;
      case "warning":
        return <MdWarning className="w-5 h-5" />;
      case "info":
        return <MdInfo className="w-5 h-5" />;
      default:
        return <MdInfo className="w-5 h-5" />;
    }
  };

  // Función para obtener los estilos según el tipo
  const getStyles = (tipo) => {
    switch (tipo) {
      case "success":
        return "bg-green-500 border-green-600 shadow-green-500/25";
      case "error":
        return "bg-red-500 border-red-600 shadow-red-500/25";
      case "warning":
        return "bg-yellow-500 border-yellow-600 shadow-yellow-500/25";
      case "info":
        return "bg-blue-500 border-blue-600 shadow-blue-500/25";
      default:
        return "bg-blue-500 border-blue-600 shadow-blue-500/25";
    }
  };

  return (
    <>
      {/* Notificaciones individuales */}
      {mensajes.map((mensaje, index) => (
        <div
          key={index}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 transform ${
            mensaje.tipo === "success" ? "animate-bounce" : ""
          } ${getStyles(mensaje.tipo)} text-white max-w-md`}
        >
          {/* Ícono */}
          <div className="flex-shrink-0">
            {getIcon(mensaje.tipo)}
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {mensaje.contenido}
            </p>
          </div>
          
          {/* Botón de cerrar */}
          <button
            onClick={() => closeNotification(index)}
            className="flex-shrink-0 ml-2 rounded-full p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            aria-label="Cerrar notificación"
          >
            <MdClose className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      {/* Botón para cerrar todas las notificaciones (solo si hay más de una) */}
      {mensajes.length > 1 && (
        <button
          onClick={closeAllNotifications}
          className="fixed bottom-4 right-4 z-50 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-lg transition-colors text-sm font-medium"
        >
          Cerrar todas ({mensajes.length})
        </button>
      )}
    </>
  );
};

export default NotificationManager;
