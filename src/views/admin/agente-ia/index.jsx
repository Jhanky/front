import React, { useState, useRef, useEffect } from "react";
import Card from "components/card";
import { MdSend, MdMic, MdMicOff, MdPlayArrow, MdStop, MdEdit, MdRefresh, MdDelete } from "react-icons/md";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";

const AgenteIA = () => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [botonHabilitado, setBotonHabilitado] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mensajeEditando, setMensajeEditando] = useState(null);
  const [mensajeEditado, setMensajeEditado] = useState("");

  // Función para procesar el mensaje y formatearlo con markdown básico
  const procesarMensaje = (mensaje) => {
    if (!mensaje) return "";

    // Procesar markdown básico
    let textoProcesado = mensaje
      // Negrita
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Cursiva
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Código inline
      .replace(/`(.*?)`/g, '<code class="bg-gray-700 px-2 py-1 rounded text-sm text-text-primary border border-gray-600">$1</code>')
      // Enlaces
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Dividir en líneas y procesar cada línea
    const lineas = textoProcesado.split('\n');
    
    return lineas.map((linea, index) => {
      // Si la línea está vacía, retornar un espacio
      if (!linea.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Si la línea comienza con un número y punto (1., 2., etc.)
      if (/^\d+\./.test(linea)) {
        return (
          <div key={index} className="font-semibold text-lg mb-2 text-text-primary" 
               dangerouslySetInnerHTML={{ __html: linea }} />
        );
      }

      // Si la línea comienza con un guión
      if (linea.trim().startsWith('-')) {
        const [etiqueta, valor] = linea
          .replace('-', '')
          .split(':')
          .map(s => s.trim());
        
        return (
          <div key={index} className="flex ml-4 mb-1">
            <span className="font-semibold min-w-[120px] text-text-primary">{etiqueta}:</span>
            <span className="ml-2 text-text-secondary" dangerouslySetInnerHTML={{ __html: valor }} />
          </div>
        );
      }

      // Para el resto de líneas
      return <div key={index} className="mb-1 text-text-primary" dangerouslySetInnerHTML={{ __html: linea }} />;
    });
  };

     useEffect(() => {
     if (chatContainerRef.current) {
       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
     }
   }, [mensajes, isTyping]);

   // Mantener el foco en el input después de enviar un mensaje
   useEffect(() => {
     if (inputRef.current && hasStarted) {
       inputRef.current.focus();
     }
   }, [mensajes.length, hasStarted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !audioURL) return;

    const mensajeActual = nuevoMensaje;
    setNuevoMensaje("");

    // Marcar que la conversación ha comenzado
    if (!hasStarted) {
      setHasStarted(true);
    }

    try {
      setIsLoading(true);
      setIsTyping(true);

      // Agregar mensaje del usuario
      const mensajeUsuario = {
        id: Date.now(),
        tipo: "usuario",
        contenido: mensajeActual || "Mensaje de voz",
        audio: audioURL,
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, mensajeUsuario]);

      // Simular delay de escritura
      await new Promise(resolve => setTimeout(resolve, 1000));

             // Enviar mensaje al webhook
       const response = await fetch("https://n8n.jhanky.online/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: mensajeActual || "Mensaje de voz",
          userId: user?.id || "anonymous",
          timestamp: new Date().toISOString(),
        }),
      });

             const data = await response.json();
       console.log("Respuesta del webhook:", data);

       // Verificar que la respuesta tenga la estructura correcta
       if (!Array.isArray(data) || data.length === 0 || !data[0].output) {
         throw new Error("Formato de respuesta inválido");
       }

       // Agregar respuesta del asistente
       const mensajeAsistente = {
         id: Date.now() + 1,
         tipo: "asistente",
         contenido: data[0].output,
         audio: null,
         timestamp: new Date(),
       };
      setMensajes((prev) => [...prev, mensajeAsistente]);

      setAudioURL(null);
      audioChunksRef.current = [];
    } catch (error) {
      console.error("Error:", error);
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          tipo: "asistente",
          contenido: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTiempoGrabacion(0);
      setBotonHabilitado(false);

      setTimeout(() => {
        setBotonHabilitado(true);
      }, 1000);

      timerRef.current = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setTiempoGrabacion(0);
    }
  };

  const playAudio = (audioUrl) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = (mensaje) => {
    setMensajeEditando(mensaje);
    setMensajeEditado(mensaje.contenido);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (mensajeEditando) {
      const mensajesActualizados = mensajes.map((msg) =>
        msg.id === mensajeEditando.id
          ? { ...msg, contenido: mensajeEditado }
          : msg
      );
      setMensajes(mensajesActualizados);
      setIsEditModalOpen(false);
      setMensajeEditando(null);
      setMensajeEditado("");
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setMensajeEditando(null);
    setMensajeEditado("");
  };

  const handleDeleteMessage = (mensajeId) => {
    setMensajes(prev => prev.filter(msg => msg.id !== mensajeId));
  };

  const handleNewChat = () => {
    setMensajes([]);
    setHasStarted(false);
    setNuevoMensaje("");
    setAudioURL(null);
  };

  return (
    <div className="flex h-screen bg-primary">
      {/* Main Chat Area - Centered */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">


        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 pb-4 bg-primary"
        >
          {/* Pantalla de bienvenida inicial */}
          {!hasStarted && mensajes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
                             <div className="text-center">
                 <h1 className="text-3xl font-bold text-text-primary mb-4">
                   ¡Hola {user?.name ? user.name.split(' ')[0] : 'Usuario'}! 👋
                 </h1>
                 <p className="text-text-secondary text-lg">
                   Soy tu asistente virtual de IA. ¿En qué puedo ayudarte hoy?
                 </p>
               </div>
            </div>
          )}

          {/* Mensajes del chat */}
          {mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-3xl ${mensaje.tipo === "usuario" ? "order-2" : "order-1"}`}>
                                 {/* Avatar */}
                 <div className={`flex items-start gap-3 ${mensaje.tipo === "usuario" ? "flex-row-reverse" : "flex-row"}`}>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                     mensaje.tipo === "usuario" 
                       ? "bg-gradient-to-br from-accent-primary to-accent-hover text-white shadow-lg" 
                       : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
                   }`}>
                     {mensaje.tipo === "usuario" 
                       ? (user?.name ? user.name.charAt(0).toUpperCase() : "U") 
                       : "AI"
                     }
                   </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 ${mensaje.tipo === "usuario" ? "text-right" : "text-left"}`}>
                    <div className={`inline-block max-w-full rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
                      mensaje.tipo === "usuario"
                        ? "bg-gradient-to-br from-accent-primary to-accent-hover text-white"
                        : "bg-primary-card border border-gray-700/50 text-text-primary backdrop-blur-sm"
                    }`}>
                      {mensaje.tipo === "asistente" ? (
                        <div className="space-y-2">
                          {procesarMensaje(mensaje.contenido)}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{mensaje.contenido}</p>
                      )}
                      
                      {mensaje.audio && (
                        <div className="mt-3">
                          <button
                            onClick={() => playAudio(mensaje.audio)}
                            className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-all duration-200 ${
                              mensaje.tipo === "usuario" 
                                ? "bg-white/20 text-white hover:bg-white/30" 
                                : "bg-gray-700/80 text-text-primary hover:bg-gray-600/80 border border-gray-600/50"
                            }`}
                          >
                            {isPlaying ? (
                              <MdStop className="h-4 w-4" />
                            ) : (
                              <MdPlayArrow className="h-4 w-4" />
                            )}
                            {isPlaying ? "Detener" : "Reproducir"}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Actions */}
                    <div className={`flex items-center gap-2 mt-2 text-xs text-text-secondary ${
                      mensaje.tipo === "usuario" ? "justify-end" : "justify-start"
                    }`}>
                      <span>{formatTimestamp(mensaje.timestamp)}</span>
                      {mensaje.tipo === "asistente" && (
                        <>
                          <button
                            onClick={() => handleEditClick(mensaje)}
                            className="hover:text-text-primary transition-colors duration-200"
                            title="Editar"
                          >
                            <MdEdit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(mensaje.id)}
                            className="hover:text-red-400 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <MdDelete className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
                     {/* Typing Indicator */}
           {isTyping && (
             <div className="flex justify-start">
               <div className="max-w-3xl">
                 <div className="flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-lg">
                     AI
                   </div>
                  <div className="bg-primary-card border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-transparent p-4 sticky bottom-0">
          <div className="w-full">
                         {/* Pantalla inicial - Input centrado */}
             {!hasStarted && mensajes.length === 0 ? (
               <div className="max-w-2xl mx-auto">
                 <div className="flex items-center gap-3">
                   <input
                     type="text"
                     value={nuevoMensaje}
                     onChange={(e) => setNuevoMensaje(e.target.value)}
                     placeholder="Pregunta lo que quieras"
                     className="flex-1 rounded-2xl border border-gray-600/50 bg-gray-700/80 px-4 py-4 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 text-lg text-text-primary placeholder-text-secondary backdrop-blur-sm transition-all duration-200"
                     disabled={isLoading}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSubmit(e);
                       }
                     }}
                   />
                   <button
                     type="submit"
                     onClick={handleSubmit}
                     className="rounded-full bg-gradient-to-br from-accent-primary to-accent-hover p-4 text-white hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                     disabled={isLoading || !nuevoMensaje.trim()}
                   >
                     <MdSend className="h-5 w-5" />
                   </button>
                 </div>
               </div>
                         ) : (
               <form onSubmit={handleSubmit} className="flex items-end gap-3">
                 <textarea
                   ref={inputRef}
                   value={nuevoMensaje}
                   onChange={(e) => setNuevoMensaje(e.target.value)}
                   placeholder="Escribe tu mensaje..."
                   className="flex-1 resize-none rounded-2xl border border-gray-600/50 bg-gray-700/80 px-4 py-3 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-secondary backdrop-blur-sm transition-all duration-200"
                   rows="1"
                   style={{ minHeight: '44px', maxHeight: '120px' }}
                   disabled={isLoading}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSubmit(e);
                     }
                   }}
                 />
                 <button
                   type="submit"
                   className="rounded-full bg-gradient-to-br from-accent-primary to-accent-hover p-4 text-white hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105"
                   disabled={isLoading || (!nuevoMensaje.trim() && !audioURL)}
                 >
                   <MdSend className="h-5 w-5" />
                 </button>
               </form>
            )}
            
            {audioURL && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-text-secondary">Audio grabado:</span>
                <button
                  onClick={() => playAudio(audioURL)}
                  className="flex items-center gap-1 rounded-full bg-gray-700/80 px-3 py-1 text-sm text-text-primary hover:bg-gray-600/80 border border-gray-600/50 transition-all duration-200"
                >
                  {isPlaying ? <MdStop className="h-4 w-4" /> : <MdPlayArrow className="h-4 w-4" />}
                  {isPlaying ? "Detener" : "Reproducir"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-primary-card p-6 border border-gray-700/50 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Editar Mensaje</h3>
            <textarea
              value={mensajeEditado}
              onChange={(e) => setMensajeEditado(e.target.value)}
              className="mb-4 w-full rounded-xl border border-gray-600/50 bg-gray-700/80 p-3 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 text-text-primary placeholder-text-secondary backdrop-blur-sm transition-all duration-200"
              rows={8}
              placeholder="Edita el mensaje aquí..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="rounded-xl bg-gray-700/80 px-4 py-2 text-text-primary hover:bg-gray-600/80 border border-gray-600/50 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-xl bg-gradient-to-br from-accent-primary to-accent-hover px-4 py-2 text-white hover:shadow-lg transition-all duration-200"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteIA;