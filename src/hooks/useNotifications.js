import { useState, useCallback } from 'react';

const useNotifications = () => {
  const [mensajes, setMensajes] = useState([]);

  // Función para mostrar una notificación de éxito
  const showSuccess = useCallback((contenido, autoClose = true, duration = 3000) => {
    const nuevoMensaje = {
      contenido,
      tipo: "success",
      id: Date.now() + Math.random(), // ID único
      timestamp: Date.now()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);

    if (autoClose) {
      setTimeout(() => {
        setMensajes(prev => prev.filter(msg => msg.id !== nuevoMensaje.id));
      }, duration);
    }
  }, []);

  // Función para mostrar una notificación de error
  const showError = useCallback((contenido, autoClose = true, duration = 5000) => {
    const nuevoMensaje = {
      contenido,
      tipo: "error",
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);

    if (autoClose) {
      setTimeout(() => {
        setMensajes(prev => prev.filter(msg => msg.id !== nuevoMensaje.id));
      }, duration);
    }
  }, []);

  // Función para mostrar una notificación de advertencia
  const showWarning = useCallback((contenido, autoClose = true, duration = 4000) => {
    const nuevoMensaje = {
      contenido,
      tipo: "warning",
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);

    if (autoClose) {
      setTimeout(() => {
        setMensajes(prev => prev.filter(msg => msg.id !== nuevoMensaje.id));
      }, duration);
    }
  }, []);

  // Función para mostrar una notificación informativa
  const showInfo = useCallback((contenido, autoClose = true, duration = 4000) => {
    const nuevoMensaje = {
      contenido,
      tipo: "info",
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);

    if (autoClose) {
      setTimeout(() => {
        setMensajes(prev => prev.filter(msg => msg.id !== nuevoMensaje.id));
      }, duration);
    }
  }, []);

  // Función para cerrar una notificación específica
  const closeNotification = useCallback((id) => {
    setMensajes(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Función para cerrar todas las notificaciones
  const closeAllNotifications = useCallback(() => {
    setMensajes([]);
  }, []);

  // Función para limpiar notificaciones antiguas (más de 5 minutos)
  const cleanOldNotifications = useCallback(() => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    setMensajes(prev => prev.filter(msg => msg.timestamp > fiveMinutesAgo));
  }, []);

  // Función para mostrar notificación de operación exitosa (CRUD)
  const showCRUDSuccess = useCallback((operation, entity, autoClose = true) => {
    const messages = {
      create: `${entity} creado exitosamente`,
      read: `${entity} cargado exitosamente`,
      update: `${entity} actualizado exitosamente`,
      delete: `${entity} eliminado exitosamente`,
      save: `Cambios guardados exitosamente`,
      upload: `Archivo subido exitosamente`,
      download: `Descarga iniciada exitosamente`
    };

    const contenido = messages[operation] || `${entity} procesado exitosamente`;
    showSuccess(contenido, autoClose);
  }, [showSuccess]);

  // Función para mostrar notificación de operación fallida (CRUD)
  const showCRUDError = useCallback((operation, entity, error, autoClose = true) => {
    const messages = {
      create: `Error al crear ${entity}`,
      read: `Error al cargar ${entity}`,
      update: `Error al actualizar ${entity}`,
      delete: `Error al eliminar ${entity}`,
      save: `Error al guardar cambios`,
      upload: `Error al subir archivo`,
      download: `Error al descargar archivo`
    };

    const contenido = `${messages[operation] || `Error al procesar ${entity}`}: ${error}`;
    showError(contenido, autoClose);
  }, [showError]);

  return {
    mensajes,
    setMensajes,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification,
    closeAllNotifications,
    cleanOldNotifications,
    showCRUDSuccess,
    showCRUDError
  };
};

export default useNotifications;
