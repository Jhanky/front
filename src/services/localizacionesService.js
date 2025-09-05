import { getApiUrl } from '../config/api';

// Función para obtener headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || 
                JSON.parse(localStorage.getItem('user'))?.token;
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Función para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};

// ===== ENDPOINTS DE LOCALIZACIONES =====

/**
 * Obtener lista de localizaciones con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de localizaciones
 */
export const getLocalizaciones = async (filters = {}) => {
  try {

    
    const queryParams = new URLSearchParams();
    
    // Agregar filtros según la especificación
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.municipality) queryParams.append('municipality', filters.municipality);
    if (filters.min_radiation) queryParams.append('min_radiation', filters.min_radiation);
    if (filters.max_radiation) queryParams.append('max_radiation', filters.max_radiation);
    if (filters.radiation_level) queryParams.append('radiation_level', filters.radiation_level);
    if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);
    
    const url = getApiUrl(`/api/locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // La respuesta real no tiene success/data wrapper, es directa
    return {
      success: true,
      data: data.data || [],
      pagination: {
        current_page: data.current_page,
        total: data.total,
        per_page: data.per_page,
        last_page: data.last_page
      }
    };
  } catch (error) {
    console.error('Error en getLocalizaciones:', error);
    throw error;
  }
};

/**
 * Obtener localizaciones por departamento
 * @param {string} department - Nombre del departamento
 * @returns {Promise<Array>} Lista de localizaciones del departamento
 */
export const getLocalizacionesPorDepartamento = async (department) => {
  try {

    
    const url = getApiUrl(`/api/locations/department/${encodeURIComponent(department)}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // La respuesta real no tiene success/data wrapper, es directa
    return data.data || data;
  } catch (error) {
    console.error('Error en getLocalizacionesPorDepartamento:', error);
    throw error;
  }
};

/**
 * Obtener departamentos únicos (versión alternativa)
 * @returns {Promise<Array>} Lista de departamentos únicos
 */
export const getDepartamentosAlternativo = async () => {
  try {

    
    // Intentar obtener departamentos usando un endpoint específico
    const url = getApiUrl('/api/locations/departments');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Si el endpoint específico funciona, usar esa respuesta
    if (Array.isArray(data)) {
      const departamentos = data.sort();
      return departamentos;
    }
    
    // Si no funciona, usar el método original
    return await getDepartamentos();
  } catch (error) {
    console.error('❌ Error en getDepartamentosAlternativo:', error);
    return await getDepartamentos();
  }
};

/**
 * Obtener departamentos únicos (versión optimizada)
 * @returns {Promise<Array>} Lista de departamentos únicos
 */
export const getDepartamentos = async () => {
  try {
    console.log('🔄 Iniciando getDepartamentos (versión optimizada)...');
    
    // Intentar obtener todos los departamentos de una sola vez
    const response = await getLocalizaciones({ 
      per_page: 2000, // Intentar obtener muchos registros
      page: 1 
    });
    
    if (response.success && response.data && response.data.length > 0) {
      // Extraer departamentos únicos y ordenarlos
      const allDepartamentos = new Set();
      response.data.forEach(loc => {
        if (loc.department) {
          allDepartamentos.add(loc.department);
        }
      });
      
      const departamentos = [...allDepartamentos].sort();
      return departamentos;
    }
    
    return [];
    return [];
  } catch (error) {
    console.error('❌ Error en getDepartamentos:', error);
    throw error;
  }
};

// Cache para localizaciones
let localizacionesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtener todas las localizaciones con cache
 * @returns {Promise<Array>} Lista de todas las localizaciones
 */
const getAllLocalizaciones = async () => {
  const now = Date.now();
  
  // Verificar si el cache es válido
  if (localizacionesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return localizacionesCache;
  }
  
  const response = await getLocalizaciones({ 
    per_page: 2000, // Obtener muchos registros
    page: 1 
  });
  
  if (response.success && response.data) {
    localizacionesCache = response.data;
    cacheTimestamp = now;
    return response.data;
  }
  
  return [];
};

/**
 * Obtener ciudades/municipios por departamento
 * @param {string} department - Nombre del departamento
 * @returns {Promise<Array>} Lista de ciudades del departamento
 */
export const getCiudades = async (department) => {
  try {
    // Obtener todas las localizaciones (con cache)
    const localizaciones = await getAllLocalizaciones();
    
    if (localizaciones.length > 0) {
      // Filtrar por departamento y extraer municipios únicos
      const localizacionesDelDepartamento = localizaciones.filter(loc => 
        loc.department === department
      );
      
      if (localizacionesDelDepartamento.length > 0) {
        // Extraer municipios únicos y ordenarlos
        const ciudades = [...new Set(localizacionesDelDepartamento.map(loc => loc.municipality))].sort();
        const ciudadesFormateadas = ciudades.map(ciudad => ({ municipality: ciudad }));
        return ciudadesFormateadas;
      } else {
        return [];
      }
    }
    
    return [];
    return [];
  } catch (error) {
    console.error('❌ Error en getCiudades:', error);
    throw error;
  }
};

/**
 * Obtener localizaciones por nivel de radiación
 * @param {string} level - Nivel de radiación (excelente, muy_buena, buena, regular, baja)
 * @returns {Promise<Array>} Lista de localizaciones
 */
export const getLocalizacionesPorRadiacion = async (level) => {
  try {
    const response = await fetch(getApiUrl(`/api/locations/radiation-level/${level}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en getLocalizacionesPorRadiacion:', error);
    throw error;
  }
};

/**
 * Obtener localizaciones con radiación óptima
 * @param {Object} params - Parámetros de radiación
 * @returns {Promise<Array>} Lista de localizaciones
 */
export const getLocalizacionesOptimas = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.min_radiation) queryParams.append('min_radiation', params.min_radiation);
    if (params.max_radiation) queryParams.append('max_radiation', params.max_radiation);
    
    const url = getApiUrl(`/api/locations/optimal-radiation${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en getLocalizacionesOptimas:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de localizaciones
 * @returns {Promise<Object>} Estadísticas de localizaciones
 */
export const getEstadisticasLocalizaciones = async () => {
  try {
    const response = await fetch(getApiUrl('/api/locations/statistics'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en getEstadisticasLocalizaciones:', error);
    throw error;
  }
};

/**
 * Crear nueva localización
 * @param {Object} locationData - Datos de la localización
 * @returns {Promise<Object>} Localización creada
 */
export const createLocalizacion = async (locationData) => {
  try {
    const response = await fetch(getApiUrl('/api/locations'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData)
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en createLocalizacion:', error);
    throw error;
  }
};

/**
 * Obtener localización específica por ID
 * @param {number} locationId - ID de la localización
 * @returns {Promise<Object>} Localización
 */
export const getLocalizacion = async (locationId) => {
  try {
    const response = await fetch(getApiUrl(`/api/locations/${locationId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en getLocalizacion:', error);
    throw error;
  }
};

/**
 * Actualizar localización existente
 * @param {number} locationId - ID de la localización
 * @param {Object} locationData - Datos de la localización
 * @returns {Promise<Object>} Localización actualizada
 */
export const updateLocalizacion = async (locationId, locationData) => {
  try {
    const response = await fetch(getApiUrl(`/api/locations/${locationId}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(locationData)
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en updateLocalizacion:', error);
    throw error;
  }
};

/**
 * Eliminar localización
 * @param {number} locationId - ID de la localización
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteLocalizacion = async (locationId) => {
  try {
    const response = await fetch(getApiUrl(`/api/locations/${locationId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en deleteLocalizacion:', error);
    throw error;
  }
};

// ===== FUNCIONES DE PRUEBA =====

/**
 * Función de prueba para verificar el endpoint directamente
 * @returns {Promise<Object>} Respuesta directa del endpoint
 */
export const testEndpointDirecto = async () => {
  try {
    console.log('🧪 PRUEBA: Llamando directamente a /api/locations');
    
    const url = getApiUrl('/api/locations');
    console.log('🔗 URL de prueba:', url);
    
    const token = localStorage.getItem('access_token') || 
                  JSON.parse(localStorage.getItem('user'))?.token;
    
    console.log('🔑 Token disponible:', !!token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Headers de respuesta:', response.headers);
    
    const data = await response.json();
    console.log('📊 Datos de respuesta:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('❌ Error en prueba directa:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Función de prueba para verificar departamentos específicos
 * @param {string} department - Departamento a probar
 * @returns {Promise<Object>} Respuesta del endpoint de departamento
 */
export const testDepartamentoDirecto = async (department) => {
  try {
    console.log('🧪 PRUEBA: Llamando directamente a /api/locations/department/' + department);
    
    const url = getApiUrl(`/api/locations/department/${encodeURIComponent(department)}`);
    console.log('🔗 URL de prueba:', url);
    
    const token = localStorage.getItem('access_token') || 
                  JSON.parse(localStorage.getItem('user'))?.token;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });
    
    console.log('📡 Status de respuesta:', response.status);
    
    const data = await response.json();
    console.log('📊 Datos de respuesta:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('❌ Error en prueba de departamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Clasificar nivel de radiación
 * @param {number} radiation - Valor de radiación en W/m²
 * @returns {string} Nivel de radiación
 */
export const clasificarRadiacion = (radiation) => {
  if (radiation >= 1480) return 'Excelente';
  if (radiation >= 1450) return 'Muy Buena';
  if (radiation >= 1420) return 'Buena';
  if (radiation >= 1400) return 'Regular';
  return 'Baja';
};

/**
 * Formatear radiación con unidades
 * @param {number} radiation - Valor de radiación
 * @returns {string} Radiación formateada
 */
export const formatearRadiacion = (radiation) => {
  return `${new Intl.NumberFormat('es-ES').format(radiation)} W/m²`;
};

/**
 * Obtener ubicación completa
 * @param {string} municipality - Municipio
 * @param {string} department - Departamento
 * @returns {string} Ubicación completa
 */
export const obtenerUbicacionCompleta = (municipality, department) => {
  return `${municipality}, ${department}`;
};

/**
 * Validar nivel de radiación
 * @param {string} level - Nivel de radiación
 * @returns {boolean} True si es válido
 */
export const validarNivelRadiacion = (level) => {
  const nivelesValidos = ['excelente', 'muy_buena', 'buena', 'regular', 'baja'];
  return nivelesValidos.includes(level.toLowerCase());
};

/**
 * Preparar datos de localización para envío
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos preparados para la API
 */
export const prepararDatosLocalizacion = (formData) => {
  return {
    department: formData.departamento,
    municipality: formData.municipio,
    radiation: Number(formData.radiacion)
  };
};
