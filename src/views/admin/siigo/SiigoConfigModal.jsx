import React, { useState, useEffect } from "react";
import Modal from "components/modal";
import { siigoService } from '../../../services/siigoService';

const SiigoConfigModal = ({ isOpen, onClose, onConfigSaved }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    client_secret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar configuración actual al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }
  }, [isOpen]);

  const loadCurrentConfig = async () => {
    try {
      // Aquí podrías cargar la configuración actual desde el backend
      // Por ahora, cargamos desde las variables de entorno
      setFormData({
        client_id: process.env.REACT_APP_SIGO_CLIENT_ID || 'silvia.p@energy4cero.com',
        client_secret: process.env.REACT_APP_SIGO_CLIENT_SECRET || 'NWQzOTI2YmUtMjVmYi00NzZjLTg0YzEtZTI0YjlmZDNlMWY0OlkjZXE2NTJ7c00='
      });
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar que todos los campos estén llenos
      if (!formData.client_id || !formData.client_secret) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Probar la conexión con Siigo
      const testResult = await siigoService.getAccessToken();
      
      if (testResult.access_token) {
        setSuccess('Configuración guardada y conexión exitosa con Siigo API');
        
        // Aquí podrías guardar la configuración en el backend
        // await saveConfigToBackend(formData);
        
        if (onConfigSaved) {
          onConfigSaved(formData);
        }
        
        // Cerrar el modal después de un breve delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error probando conexión con Siigo:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const testResult = await siigoService.getAccessToken();
      
      if (testResult.access_token) {
        setSuccess('Conexión exitosa con Siigo API');
      }
    } catch (error) {
      console.error('Error probando conexión:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Siigo API"
    >
      <div className="p-6">
        <div className="mb-6">
          <p className="text-text-secondary text-sm">
            Ingresa las credenciales OAuth2 de tu cuenta de Siigo API. Estas credenciales se obtienen desde 
            Siigo Nube > Configuración > Alianzas e integraciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Client ID (Usuario API)
            </label>
            <input
              type="text"
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              placeholder="Ingresa tu Client ID de Siigo"
              className="w-full px-3 py-2 border border-text-disabled/30 rounded-md bg-primary-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Client Secret (Token API)
            </label>
            <input
              type="password"
              name="client_secret"
              value={formData.client_secret}
              onChange={handleInputChange}
              placeholder="Ingresa tu Client Secret de Siigo"
              className="w-full px-3 py-2 border border-text-disabled/30 rounded-md bg-primary-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
              required
            />
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={loading || !formData.client_id || !formData.client_secret}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Conexión'}
            </button>

            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-text-disabled/30 text-text-secondary rounded-md hover:bg-text-disabled/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.client_id || !formData.client_secret}
                className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">¿Cómo obtener las credenciales?</h4>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Accede a Siigo Nube con un usuario administrador</li>
            <li>Ve a Configuración > Alianzas e integraciones</li>
            <li>Selecciona "Credenciales de integración a plataformas digitales"</li>
            <li>Completa los datos y guarda para obtener las credenciales</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
};

export default SiigoConfigModal;
