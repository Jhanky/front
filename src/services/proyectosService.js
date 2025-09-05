// Servicio para manejar las llamadas a los endpoints de proyectos
import { getApiUrl } from '../config/api';

// Función auxiliar para manejar respuestas de la API
const handleResponse = async (response) => {
  console.log('🔍 DEBUG: handleResponse recibió:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    
    // Log detallado del error para debugging
    console.error('🚨 ERROR DE API PROYECTOS:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: errorData
    });
    
    // Si es un error de validación (422), mostrar los errores específicos
    if (response.status === 422 && errorData.errors) {
      const validationErrors = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      
      throw new Error(`Error de validación: ${validationErrors}`);
    }
    
    // Si hay un mensaje específico del backend, usarlo
    if (errorData.message) {
      throw new Error(errorData.message);
    }
    
    // Si hay errores específicos, mostrarlos
    if (errorData.errors) {
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      throw new Error(`Errores de validación: ${errorMessages}`);
    }
    
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  try {
    const result = await response.json();
    console.log('✅ DEBUG: handleResponse parseó JSON exitosamente:', result);
    return result;
  } catch (parseError) {
    console.error('❌ DEBUG: Error al parsear JSON de la respuesta:', parseError);
    console.log('📋 DEBUG: Contenido de la respuesta (texto):', await response.text());
    throw new Error('Error al procesar la respuesta del servidor');
  }
};

// Función auxiliar para obtener headers de autenticación
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const proyectosService = {
  // 1. Obtener todos los proyectos con filtros y paginación
  getProyectos: async (params = {}, token) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Solo parámetro de búsqueda según la nueva estructura simplificada
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);

      const url = getApiUrl('/api/projects') + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      console.log('🔍 DEBUG: Obteniendo proyectos desde:', url);
      console.log('🔍 DEBUG: Parámetros:', params);
      console.log('🔍 DEBUG: Token disponible:', !!token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      console.log('📥 DEBUG: Respuesta del backend:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await handleResponse(response);
      
      console.log('📋 DEBUG: Resultado completo:', result);
      console.log('📋 DEBUG: Tipo de resultado:', typeof result);
      console.log('📋 DEBUG: ¿Es array?', Array.isArray(result));
      
      // NUEVA ESTRUCTURA: La API devuelve directamente un array de proyectos
      if (Array.isArray(result)) {
        console.log('✅ DEBUG: Estructura nueva detectada - Array directo');
        return {
          success: true,
          data: result, // Array de proyectos
          pagination: {
            current_page: 1,
            total: result.length,
            per_page: result.length,
            last_page: 1
          },
          message: 'Proyectos obtenidos exitosamente'
        };
      }
      
      // Si no es array, mantener compatibilidad con estructura anterior
      console.log('⚠️ DEBUG: Estructura no esperada, intentando compatibilidad');
      if (result.success && result.data) {
        if (result.data.data && Array.isArray(result.data.data)) {
          return {
            success: true,
            data: result.data.data,
            pagination: {
              current_page: result.data.current_page || 1,
              total: result.data.total || 0,
              per_page: result.data.per_page || 15,
              last_page: Math.ceil((result.data.total || 0) / (result.data.per_page || 15))
            },
            message: result.message
          };
        } else if (Array.isArray(result.data)) {
          return {
            success: true,
            data: result.data,
            pagination: {
              current_page: 1,
              total: result.data.length,
              per_page: result.data.length,
              last_page: 1
            },
            message: result.message
          };
        }
      }
      
      // Si no tiene ninguna estructura esperada, devolver como array vacío
      console.log('⚠️ DEBUG: Estructura completamente inesperada, devolviendo array vacío');
      return {
        success: false,
        data: [],
        pagination: {
          current_page: 1,
          total: 0,
          per_page: 15,
          last_page: 1
        },
        message: 'Estructura de respuesta no reconocida'
      };
    } catch (error) {
      console.error('❌ Error al obtener proyectos:', error);
      throw error;
    }
  },

  // 2. Obtener proyecto por ID
  getProyectoById: async (id, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/projects/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const result = await handleResponse(response);
      
      // La respuesta según la documentación tiene esta estructura:
      // { success: true, data: {...}, message }
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error al obtener proyecto:', error);
      throw error;
    }
  },

  // 3. Crear nuevo proyecto manualmente
  createProyecto: async (proyectoData, token) => {
    try {
      console.log('🚀 DEBUG: Enviando proyecto al backend');
      console.log('📤 URL:', getApiUrl('/api/projects'));
      console.log('🔑 Token disponible:', !!token);
      console.log('📋 Datos a enviar:', JSON.stringify(proyectoData, null, 2));
      
      const response = await fetch(getApiUrl('/api/projects'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(proyectoData)
      });

      console.log('📥 Respuesta del backend:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      throw error;
    }
  },

  // 4. Actualizar proyecto
  updateProyecto: async (id, proyectoData, token) => {
    try {
      console.log('📝 DEBUG: Actualizando proyecto:', id);
      console.log('📋 Datos a actualizar:', JSON.stringify(proyectoData, null, 2));
      
      const response = await fetch(getApiUrl(`/api/projects/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(proyectoData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      throw error;
    }
  },

  // 5. Eliminar proyecto
  deleteProyecto: async (id, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/projects/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      throw error;
    }
  },

  // 6. Cambiar estado del proyecto
  changeProyectoStatus: async (id, statusId, token) => {
    try {
      console.log('🔄 DEBUG: Cambiando estado del proyecto:', id, 'a status_id:', statusId);
      
      const response = await fetch(getApiUrl(`/api/projects/${id}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status_id: statusId })
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al cambiar estado del proyecto:', error);
      throw error;
    }
  },

  // 7. Obtener estadísticas de proyectos
  getEstadisticas: async (token) => {
    try {
      console.log('📊 DEBUG: Obteniendo estadísticas de proyectos');
      
      const response = await fetch(getApiUrl('/api/projects-statistics'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      console.log('📥 DEBUG: Respuesta de estadísticas:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await handleResponse(response);
      
      console.log('📊 DEBUG: Estadísticas obtenidas:', result);
      
      // NUEVA ESTRUCTURA: Verificar si la respuesta es un array o tiene estructura anterior
      if (Array.isArray(result)) {
        console.log('✅ DEBUG: Estadísticas en formato array, convirtiendo a estructura esperada');
        // Si es array, crear estructura de estadísticas básica
        return {
          success: true,
          data: {
            total: result.length,
            by_status: [
              {
                status_id: 1,
                name: 'Activo',
                color: '#10B981',
                projects_count: result.filter(p => p.estado?.status_id === 1).length
              },
              {
                status_id: 2,
                name: 'Desactivo',
                color: '#EF4444',
                projects_count: result.filter(p => p.estado?.status_id === 2).length
              }
            ],
            recent: result.slice(0, 5).map(proyecto => ({
              project_id: proyecto.id || proyecto.project_id,
              project_name: proyecto.nombre_proyecto || proyecto.project_name,
              client: {
                client_id: proyecto.client_id,
                name: proyecto.client?.name || 'Cliente no disponible'
              },
              status: proyecto.estado || proyecto.status || {
                status_id: 1,
                name: 'Activo',
                color: '#10B981'
              },
              created_at: proyecto.created_at || new Date().toISOString()
            }))
          }
        };
      }
      
      // Si no es array, devolver tal como viene (estructura anterior)
      return result;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // Función auxiliar para formatear datos de proyecto para el frontend
  formatProyectoForFrontend: (proyecto) => {
    console.log('🔍 DEBUG: Formateando proyecto para frontend:', proyecto);
    
    // Validar que el proyecto tenga los campos mínimos requeridos
    if (!proyecto || (!proyecto.id && !proyecto.project_id)) {
      console.warn('⚠️ Proyecto inválido o sin ID:', proyecto);
      return null;
    }
    
    // NUEVA ESTRUCTURA: Mapear campos nuevos a campos del frontend
    const proyectoFormateado = {
      // ID del proyecto
      id: proyecto.id || proyecto.project_id,
      project_id: proyecto.id || proyecto.project_id,
      
      // Información básica (nuevos campos)
      quotation_id: proyecto.cotizacion_id || proyecto.quotation_id || null,
      client_id: proyecto.client_id || null,
      location_id: proyecto.location_id || null,
      
      // Estado del proyecto
      status_id: proyecto.estado?.status_id || proyecto.status_id || 1,
      project_name: proyecto.nombre_proyecto || proyecto.project_name || 'Sin nombre',
      
      // Fechas (nuevos campos)
      start_date: proyecto.fecha_inicio || proyecto.start_date || null,
      estimated_end_date: proyecto.fecha_fin || proyecto.estimated_end_date || null,
      actual_end_date: proyecto.actual_end_date || null,
      
      // Información del gerente
      project_manager_id: proyecto.project_manager_id || null,
      
      // Presupuesto (nuevo campo en informacion_tecnica)
      budget: proyecto.informacion_tecnica?.presupuesto 
        ? parseFloat(proyecto.informacion_tecnica.presupuesto) 
        : (proyecto.budget ? parseFloat(proyecto.budget) : 0),
      
      // Notas
      notes: proyecto.informacion_tecnica?.notas || proyecto.notes || '',
      
      // Geolocalización (se mantienen los campos originales si existen)
      latitude: proyecto.latitude ? parseFloat(proyecto.latitude) : null,
      longitude: proyecto.longitude ? parseFloat(proyecto.longitude) : null,
      installation_address: proyecto.installation_address || '',
      
      // Timestamps
      created_at: proyecto.created_at || null,
      updated_at: proyecto.updated_at || null,
      
      // Relaciones - Mantener compatibilidad con estructura anterior
      quotation: proyecto.quotation || {
        quotation_id: proyecto.cotizacion_id,
        project_name: proyecto.nombre_proyecto,
        system_type: proyecto.informacion_tecnica?.tipo_sistema,
        power_kwp: proyecto.informacion_tecnica?.potencia_total,
        panel_count: proyecto.informacion_tecnica?.cantidad_paneles,
        total_value: proyecto.informacion_tecnica?.presupuesto
      },
      
      // Cliente - NUEVA ESTRUCTURA: campo 'cliente' en español
      client: proyecto.cliente || proyecto.client || {
        client_id: proyecto.client_id,
        name: 'Cliente no disponible',
        nic: null,
        department: null,
        city: null,
        telefono: null,
        email: null
      },
      
      // Ubicación - NUEVA ESTRUCTURA: campo 'ubicacion' en español
      location: proyecto.ubicacion || proyecto.location || null,
      
      // Estado - Usar nueva estructura
      status: proyecto.estado || proyecto.status || { 
        status_id: 1, 
        name: 'Activo', 
        color: '#10B981' 
      },
      
      project_manager: proyecto.project_manager || null,
      
      // NUEVOS CAMPOS ESPECÍFICOS
      codigo_proyecto: proyecto.codigo_proyecto || null,
      paneles: proyecto.paneles || {},
      inversores: proyecto.inversores || {},
      baterias: proyecto.baterias || [],
      informacion_tecnica: proyecto.informacion_tecnica || {}
    };
    
    console.log('✅ DEBUG: Proyecto formateado:', proyectoFormateado);
    return proyectoFormateado;
  },

  // Función auxiliar para formatear datos para enviar al backend
  formatProyectoForBackend: (proyectoData) => {
    const data = {};
    
    // Solo incluir campos que realmente se están enviando
    if (proyectoData.quotation_id !== undefined) data.quotation_id = parseInt(proyectoData.quotation_id);
    if (proyectoData.client_id !== undefined) data.client_id = parseInt(proyectoData.client_id);
    if (proyectoData.location_id !== undefined) data.location_id = parseInt(proyectoData.location_id);
    if (proyectoData.project_name !== undefined) data.project_name = proyectoData.project_name;
    if (proyectoData.start_date !== undefined) data.start_date = proyectoData.start_date;
    if (proyectoData.estimated_end_date !== undefined) data.estimated_end_date = proyectoData.estimated_end_date;
    if (proyectoData.actual_end_date !== undefined) data.actual_end_date = proyectoData.actual_end_date;
    if (proyectoData.project_manager_id !== undefined) data.project_manager_id = parseInt(proyectoData.project_manager_id);
    if (proyectoData.budget !== undefined) data.budget = parseFloat(proyectoData.budget);
    if (proyectoData.notes !== undefined) data.notes = proyectoData.notes;
    if (proyectoData.latitude !== undefined) data.latitude = parseFloat(proyectoData.latitude);
    if (proyectoData.longitude !== undefined) data.longitude = parseFloat(proyectoData.longitude);
    if (proyectoData.installation_address !== undefined) data.installation_address = proyectoData.installation_address;
    
    return data;
  },

  // Función para validar datos de proyecto
  validateProyectoData: (data) => {
    console.log('🔍 DEBUG: validateProyectoData recibió:', data);
    
    const errors = [];

    // Validaciones básicas según la documentación
    if (data.quotation_id && (!Number.isInteger(data.quotation_id) || data.quotation_id <= 0)) {
      errors.push('El ID de cotización debe ser un número entero positivo');
    }
    
    if (data.client_id && (!Number.isInteger(data.client_id) || data.client_id <= 0)) {
      errors.push('El ID del cliente debe ser un número entero positivo');
    }
    
    if (data.location_id && (!Number.isInteger(data.location_id) || data.location_id <= 0)) {
      errors.push('El ID de ubicación debe ser un número entero positivo');
    }
    
    if (data.project_name && (typeof data.project_name !== 'string' || data.project_name.length > 200)) {
      errors.push('El nombre del proyecto debe ser una cadena de máximo 200 caracteres');
    }
    
    if (data.start_date && data.estimated_end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.estimated_end_date);
      if (endDate <= startDate) {
        errors.push('La fecha estimada de fin debe ser posterior a la fecha de inicio');
      }
    }
    
    if (data.budget && (typeof data.budget !== 'number' || data.budget < 0)) {
      errors.push('El presupuesto debe ser un número mayor o igual a 0');
    }
    
    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
      errors.push('La latitud debe estar entre -90 y 90');
    }
    
    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
      errors.push('La longitud debe estar entre -180 y 180');
    }

    console.log('🔍 DEBUG: Errores encontrados:', errors);
    console.log('🔍 DEBUG: ¿Es válido?', errors.length === 0);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Función para obtener el nombre del estado por ID
  getEstadoName: (statusId) => {
    const estados = {
      1: 'Activo',
      2: 'Desactivo'
    };
    return estados[statusId] || 'Desconocido';
  },

  // Función para obtener el color del estado por ID
  getEstadoColor: (statusId) => {
    const colores = {
      1: 'bg-green-500/20 text-green-300',
      2: 'bg-red-500/20 text-red-300'
    };
    return colores[statusId] || 'bg-gray-500/20 text-gray-300';
  }
};