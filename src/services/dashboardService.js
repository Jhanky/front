// Servicio para manejar las llamadas a los endpoints del dashboard
import { getApiUrl } from '../config/api';

// Función auxiliar para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    
    console.error('🚨 ERROR DE API DASHBOARD:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: errorData
    });
    
    if (response.status === 422 && errorData.errors) {
      const validationErrors = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      
      throw new Error(`Error de validación: ${validationErrors}`);
    }
    
    if (errorData.message) {
      throw new Error(errorData.message);
    }
    
    if (errorData.errors) {
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      throw new Error(`Errores de validación: ${errorMessages}`);
    }
    
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Función auxiliar para obtener headers de autenticación
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const dashboardService = {
  // 1. Obtener todos los proyectos del dashboard
  getProyectos: async (token) => {
    try {
      console.log('🔍 DEBUG: Obteniendo proyectos del dashboard');
      
      const response = await fetch(getApiUrl('/api/dashboard/projects'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      console.log('📥 DEBUG: Respuesta del dashboard:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await handleResponse(response);
      
      console.log('📋 DEBUG: Proyectos del dashboard obtenidos:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error al obtener proyectos del dashboard:', error);
      throw error;
    }
  },

  // 2. Obtener solo proyectos activos
  getProyectosActivos: async (token) => {
    try {
      console.log('🔍 DEBUG: Obteniendo proyectos activos del dashboard');
      
      const response = await fetch(getApiUrl('/api/dashboard/projects/active'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const result = await handleResponse(response);
      
      console.log('📋 DEBUG: Proyectos activos obtenidos:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error al obtener proyectos activos:', error);
      throw error;
    }
  },

  // 3. Obtener estadísticas del dashboard
  getEstadisticas: async (token) => {
    try {
      console.log('🔍 DEBUG: Obteniendo estadísticas del dashboard');
      
      const response = await fetch(getApiUrl('/api/dashboard/stats'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const result = await handleResponse(response);
      
      console.log('📊 DEBUG: Estadísticas obtenidas:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // 4. Función auxiliar para formatear datos de proyecto para el frontend
  formatProyectoForFrontend: (proyecto) => {
    console.log('🔍 DEBUG: Formateando proyecto del dashboard:', proyecto);
    
    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      ubicacion: proyecto.ubicacion,
      coordenadas: proyecto.coordenadas || [10.9685, -74.7813], // Coordenadas por defecto si no hay
      capacidad: parseFloat(proyecto.capacidad) || 0,
      potenciaActual: parseFloat(proyecto.potenciaActual) || 0,
      generacionHoy: parseFloat(proyecto.generacionHoy) || 0,
      estado: proyecto.estado,
      eficiencia: parseInt(proyecto.eficiencia) || 0,
      ultimaActualizacion: proyecto.ultimaActualizacion,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      cliente: proyecto.cliente,
      gerenteProyecto: proyecto.gerenteProyecto,
      imagenPortada: proyecto.imagen_portada || proyecto.imagenPortada || '/img/Paneles-solares.png', // Imagen de portada o por defecto
      proyecto: proyecto // Mantener referencia al proyecto original
    };
  }
};
