import React, { useState, useEffect } from 'react';
import { MdSwapHoriz, MdComputer, MdCloud } from 'react-icons/md';
import { API_URLS, checkApiConfig } from '../config/api';

const ApiToggle = () => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Obtener la URL actual del localStorage o de las variables de entorno
    const savedUrl = localStorage.getItem('REACT_APP_API_URL');
    const envUrl = process.env.REACT_APP_API_URL;
    setCurrentUrl(savedUrl || envUrl || API_URLS.DEVELOPMENT);
  }, []);

  const switchToEnvironment = (url) => {
    // Guardar en localStorage para persistencia
    localStorage.setItem('REACT_APP_API_URL', url);
    setCurrentUrl(url);
    
    // Mostrar notificación
    const environment = url === API_URLS.PRODUCTION ? 'PRODUCCIÓN' : 'DESARROLLO';

    
    // Recargar la página para aplicar los cambios
    window.location.reload();
  };

  const getCurrentEnvironment = () => {
    if (currentUrl === API_URLS.PRODUCTION) return 'PRODUCCIÓN';
    if (currentUrl === API_URLS.DEVELOPMENT) return 'DESARROLLO';
    return 'PERSONALIZADO';
  };

  const getEnvironmentIcon = () => {
    if (currentUrl === API_URLS.PRODUCTION) return <MdCloud className="h-4 w-4" />;
    return <MdComputer className="h-4 w-4" />;
  };

  const getEnvironmentColor = () => {
    if (currentUrl === API_URLS.PRODUCTION) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`flex items-center gap-2 rounded-full p-3 shadow-lg transition-all duration-300 ${
            currentUrl === API_URLS.PRODUCTION 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          title={`API: ${getCurrentEnvironment()}`}
        >
          <MdSwapHoriz className="h-5 w-5" />
        </button>
      </div>

      {/* Panel de configuración */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 w-80 rounded-lg bg-primary-card p-4 shadow-xl border border-text-disabled/20 text-text-primary">
          <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-text-primary">Configuración API</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Estado actual */}
          <div className={`mb-4 rounded-lg border p-3 ${getEnvironmentColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              {getEnvironmentIcon()}
              <span className="font-medium">{getCurrentEnvironment()}</span>
            </div>
            <div className="text-sm break-all">{currentUrl}</div>
          </div>

          {/* Botones de cambio */}
          <div className="space-y-2">
            <button
              onClick={() => switchToEnvironment(API_URLS.DEVELOPMENT)}
              className={`w-full flex items-center gap-2 rounded-lg p-3 text-left transition-colors ${
                currentUrl === API_URLS.DEVELOPMENT
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
              }`}
            >
              <MdComputer className="h-4 w-4" />
              <div>
                <div className="font-medium">Desarrollo</div>
                <div className="text-xs text-gray-500">{API_URLS.DEVELOPMENT}</div>
              </div>
            </button>

            <button
              onClick={() => switchToEnvironment(API_URLS.PRODUCTION)}
              className={`w-full flex items-center gap-2 rounded-lg p-3 text-left transition-colors ${
                currentUrl === API_URLS.PRODUCTION
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-2 border-transparent'
              }`}
            >
              <MdCloud className="h-4 w-4" />
              <div>
                <div className="font-medium">Producción</div>
                <div className="text-xs text-gray-500">{API_URLS.PRODUCTION}</div>
              </div>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div>• El cambio requiere recargar la página</div>
              <div>• La configuración se guarda automáticamente</div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
};

export default ApiToggle;
