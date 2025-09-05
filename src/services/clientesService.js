import { getApiUrl } from '../config/api';
import { getDepartamentos, getCiudades } from './localizacionesService';

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

// ===== ENDPOINTS DE CLIENTES =====

/**
 * Obtener lista de clientes con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de clientes
 */
export const getClientes = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros según la especificación
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.client_type) queryParams.append('client_type', filters.client_type);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active);
    if (filters.user_id) queryParams.append('user_id', filters.user_id);
    if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);
    
    const url = getApiUrl(`/api/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return {
        success: true,
        data: data.data.data || [],
        pagination: {
          current_page: data.data.current_page,
          total: data.data.total,
          per_page: data.data.per_page,
          last_page: data.data.last_page
        }
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error en getClientes:', error);
    throw error;
  }
};

/**
 * Crear nuevo cliente
 * @param {Object} clientData - Datos del cliente a crear
 * @returns {Promise<Object>} Cliente creado
 */
export const createCliente = async (clientData) => {
  try {
    const response = await fetch(getApiUrl('/api/clients'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData)
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en createCliente:', error);
    throw error;
  }
};

/**
 * Obtener cliente específico por ID
 * @param {number} clientId - ID del cliente
 * @returns {Promise<Object>} Cliente
 */
export const getCliente = async (clientId) => {
  try {
    const response = await fetch(getApiUrl(`/api/clients/${clientId}`), {
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
    console.error('Error en getCliente:', error);
    throw error;
  }
};

/**
 * Actualizar cliente existente
 * @param {number} clientId - ID del cliente
 * @param {Object} clientData - Datos del cliente a actualizar
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateCliente = async (clientId, clientData) => {
  try {
    const response = await fetch(getApiUrl(`/api/clients/${clientId}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(clientData)
    });
    
    const data = await handleResponse(response);
    
    // Manejar la estructura de respuesta de Laravel
    if (data.success && data.data) {
      return data.data;
    }
    
    return data;
  } catch (error) {
    console.error('Error en updateCliente:', error);
    throw error;
  }
};

/**
 * Eliminar cliente
 * @param {number} clientId - ID del cliente
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export const deleteCliente = async (clientId) => {
  try {
    const response = await fetch(getApiUrl(`/api/clients/${clientId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en deleteCliente:', error);
    throw error;
  }
};

/**
 * Obtener clientes por usuario específico
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de clientes del usuario
 */
export const getClientesByUser = async (userId) => {
  try {
    const response = await fetch(getApiUrl(`/api/clients/user/${userId}`), {
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
    console.error('Error en getClientesByUser:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de clientes
 * @returns {Promise<Object>} Estadísticas de clientes
 */
export const getClientesStatistics = async () => {
  try {
    const response = await fetch(getApiUrl('/api/clients/statistics'), {
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
    console.error('Error en getClientesStatistics:', error);
    throw error;
  }
};

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Formatear número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-CO').format(number);
};

/**
 * Validar tipos de red válidos
 * @param {string} networkType - Tipo de red a validar
 * @returns {boolean} True si es válido
 */
export const validateNetworkType = (networkType) => {
  const validTypes = [
    "Monofásica 110V",
    "Bifásica 220V", 
    "Trifásica 220V",
    "Trifásica 440V"
  ];
  return validTypes.includes(networkType);
};

/**
 * Validar tipos de cliente válidos
 * @param {string} clientType - Tipo de cliente a validar
 * @returns {boolean} True si es válido
 */
export const validateClientType = (clientType) => {
  const validTypes = [
    "Residencial",
    "Comercial",
    "Industrial"
  ];
  return validTypes.includes(clientType);
};

/**
 * Preparar datos del cliente para envío
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos preparados para la API
 */
export const prepareClientData = (formData) => {
  return {
    nic: formData.nic,
    client_type: formData.tipo_cliente,
    name: formData.nombre,
    department: formData.departamento,
    city: formData.ciudad,
    address: formData.direccion,
    monthly_consumption_kwh: Number(formData.consumo_mensual_kwh),
    energy_rate: Number(formData.tarifa_energia),
    network_type: formData.tipo_red,
    is_active: true
  };
};

/**
 * Limpiar datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('user_data');
  localStorage.removeItem('access_token');
};

// Re-exportar funciones de localización para mantener compatibilidad
export { getDepartamentos, getCiudades };
