import React from "react";

const Mensaje = ({ contenido, tipo = "info" }) => {
  const getEstilo = () => {
    switch (tipo) {
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Función para procesar el texto y formatearlo
  const procesarTexto = (texto) => {
    if (!texto) return "";
    
    try {
      // Si el texto es un JSON, extraemos el campo reply
      const jsonData = JSON.parse(texto);
      texto = jsonData.reply || texto;
    } catch (e) {
      // Si no es JSON, usamos el texto tal cual
    }

    // Eliminamos los caracteres Markdown
    let textoLimpio = texto
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/>/g, '');

    // Dividimos el texto en líneas
    const lineas = textoLimpio.split('\n');
    
    return (
      <div className="space-y-2">
        {lineas.map((linea, index) => {
          // Si la línea está vacía, mostramos un espacio
          if (!linea.trim()) {
            return <div key={index} className="h-2" />;
          }

          // Si la línea comienza con un número y punto (1., 2., etc.)
          if (/^\d+\./.test(linea)) {
            return (
              <div key={index} className="font-semibold">
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
              <div key={index} className="flex ml-4">
                <span className="font-semibold min-w-[120px]">{etiqueta}:</span>
                <span className="ml-2">{valor}</span>
              </div>
            );
          }

          // Para el resto de líneas
          return <div key={index}>{linea}</div>;
        })}
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg border ${getEstilo()} mb-4`}>
      {procesarTexto(contenido)}
    </div>
  );
};

export default Mensaje; 