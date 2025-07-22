import React, { useState, useRef, useEffect } from "react";
import Card from "components/card";
import { MdSend, MdMic, MdMicOff, MdPlayArrow, MdStop, MdEdit } from "react-icons/md";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";

const AgenteIA = () => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([
    {
      tipo: "asistente",
      contenido: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [botonHabilitado, setBotonHabilitado] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mensajeEditando, setMensajeEditando] = useState(null);
  const [mensajeEditado, setMensajeEditado] = useState("");

  // Función para procesar el mensaje y formatearlo
  const procesarMensaje = (mensaje) => {
    if (!mensaje) return "";

    // Eliminar caracteres Markdown
    let textoLimpio = mensaje
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/>/g, '');

    // Dividir en líneas y procesar cada línea
    const lineas = textoLimpio.split('\n');
    
    return lineas.map((linea, index) => {
      // Si la línea está vacía, retornar un espacio
      if (!linea.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Si la línea comienza con un número y punto (1., 2., etc.)
      if (/^\d+\./.test(linea)) {
        return (
          <div key={index} className="font-semibold text-lg mb-2">
            {linea}
          </div>
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
            <span className="font-semibold min-w-[120px]">{etiqueta}:</span>
            <span className="ml-2">{valor}</span>
          </div>
        );
      }

      // Para el resto de líneas
      return <div key={index} className="mb-1">{linea}</div>;
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [mensajes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !audioURL) return;

    const mensajeActual = nuevoMensaje; // Guardamos el mensaje actual
    setNuevoMensaje(""); // Limpiamos el input inmediatamente

    try {
      setIsLoading(true);

      // Agregar mensaje del usuario
      const mensajeUsuario = {
        tipo: "usuario",
        contenido: mensajeActual || "Mensaje de voz",
        audio: audioURL,
      };
      setMensajes((prev) => [...prev, mensajeUsuario]);

      // Enviar mensaje al webhook
      const response = await fetch("https://energy40.app.n8n.cloud/webhook-test/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatInput: mensajeActual || "Mensaje de voz",
        }),
      });

      const data = await response.json();
      console.log("Respuesta del webhook:", data);

      if (!data || typeof data.reply !== 'string') {
        throw new Error("Formato de respuesta inválido");
      }

      // Agregar respuesta del asistente
      const mensajeAsistente = {
        tipo: "asistente",
        contenido: data.reply,
        audio: data.audio || null,
      };
      setMensajes((prev) => [...prev, mensajeAsistente]);

      setAudioURL(null);
      audioChunksRef.current = [];
    } catch (error) {
      console.error("Error:", error);
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "asistente",
          contenido: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
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
        // No enviamos el mensaje al webhook si es solo audio
        setMensajes((prev) => [
          ...prev,
          {
            tipo: "usuario",
            contenido: "Mensaje de voz",
            audio: audioUrl,
          },
        ]);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTiempoGrabacion(0);
      setBotonHabilitado(false);

      // Deshabilitar el botón por 1 segundo
      setTimeout(() => {
        setBotonHabilitado(true);
      }, 1000);

      // Iniciar el temporizador
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

  const handleEditClick = (mensaje) => {
    setMensajeEditando(mensaje);
    setMensajeEditado(mensaje.contenido);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (mensajeEditando) {
      const mensajesActualizados = mensajes.map((msg) =>
        msg === mensajeEditando
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra="w-full h-full px-8 pb-8">
          <div className="flex h-[600px] flex-col">
            {/* Área de mensajes */}
            <div
              ref={chatContainerRef}
              className="flex-1 space-y-4 overflow-y-auto p-4"
            >
              {mensajes.map((mensaje, index) => (
                <div
                  key={index}
                  className={`flex ${
                    mensaje.tipo === "usuario" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      mensaje.tipo === "usuario"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {mensaje.tipo === "asistente" ? (
                      <div className="space-y-1">
                        {procesarMensaje(mensaje.contenido)}
                        <button
                          onClick={() => handleEditClick(mensaje)}
                          className="mt-2 text-gray-500 hover:text-gray-700"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p>{mensaje.contenido}</p>
                    )}
                    {mensaje.audio && (
                      <div className="mt-2">
                        <button
                          onClick={() => playAudio(mensaje.audio)}
                          className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm"
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
                </div>
              ))}
            </div>

            {/* Área de entrada */}
            <div className="mt-4 flex items-center gap-2 border-t border-gray-200 p-4">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSubmit(e);
                  }
                }}
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={(e) => handleSubmit(e)}
                className="rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading}
              >
                <MdSend className="h-5 w-5" />
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!botonHabilitado || isLoading}
                className={`rounded-lg p-2 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-500 hover:bg-gray-600"
                } text-white disabled:opacity-50`}
              >
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
                    <span className="text-sm">{formatTime(tiempoGrabacion)}</span>
                    <MdMicOff className="h-5 w-5" />
                  </div>
                ) : (
                  <MdMic className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Editar Mensaje</h3>
            <textarea
              value={mensajeEditado}
              onChange={(e) => setMensajeEditado(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgenteIA;