import { getApiUrl } from '../config/api';

// Función auxiliar para manejar las respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Función auxiliar para obtener headers con token
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
};

// Función auxiliar para obtener headers para subida de archivos
const getMultipartHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
};

// ===== ENDPOINTS DE AUTENTICACIÓN (PÚBLICOS) =====

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
};

/**
 * Iniciar sesión
 * @param {Object} credentials - Credenciales de login (email, password)
 * @returns {Promise<Object>} Respuesta del servidor con token
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    // Guardar token en localStorage según la estructura de respuesta
    if (data.data?.token) {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user_data', JSON.stringify(data.data.user || {}));
    } else if (data.token) {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user || {}));
    }
    
    return data;
  } catch (error) {
    console.error('Error en loginUser:', error);
    throw error;
  }
};

// ===== ENDPOINTS DE GESTIÓN DE SESIÓN (PROTEGIDOS) =====

/**
 * Cerrar sesión
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const logoutUser = async () => {
  try {
    const response = await fetch(getApiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    // Limpiar token del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en logoutUser:', error);
    // Limpiar token incluso si hay error
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    throw error;
  }
};

/**
 * Obtener información del usuario autenticado
 * @returns {Promise<Object>} Información del usuario
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(getApiUrl('/api/auth/me'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    
    // Actualizar datos del usuario en localStorage
    if (data.data?.user) {
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    } else if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    throw error;
  }
};

/**
 * Renovar token de acceso
 * @returns {Promise<Object>} Nuevo token
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(getApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    
    // Actualizar token en localStorage
    if (data.token) {
      localStorage.setItem('access_token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Error en refreshToken:', error);
    throw error;
  }
};

// ===== ENDPOINTS DE GESTIÓN DE USUARIOS (PROTEGIDOS) =====

/**
 * Listar todos los usuarios con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de usuarios
 */
export const getUsers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar filtros si existen según la especificación
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.per_page) queryParams.append('per_page', filters.per_page);
    if (filters.page) queryParams.append('page', filters.page);
    
    const url = getApiUrl(`/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getUsers:', error);
    throw error;
  }
};

/**
 * Crear nuevo usuario (Solo Administradores)
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Promise<Object>} Usuario creado
 */
export const createUser = async (userData) => {
  try {
    const response = await fetch(getApiUrl('/api/users'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error;
  }
};

/**
 * Obtener usuario específico
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUser = async (userId) => {
  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getUser:', error);
    throw error;
  }
};

/**
 * Actualizar usuario (Solo Administradores)
 * @param {string|number} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

/**
 * Eliminar usuario (Solo Administradores)
 * @param {string|number} userId - ID del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en deleteUser:', error);
    throw error;
  }
};

/**
 * Obtener ID del usuario autenticado
 * @returns {Promise<Object>} ID del usuario
 */
export const getCurrentUserId = async () => {
  try {
    const response = await fetch(getApiUrl('/api/users/me/id'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en getCurrentUserId:', error);
    throw error;
  }
};

/**
 * Subir foto de perfil del usuario
 * @param {string|number} userId - ID del usuario
 * @param {File} profilePhoto - Archivo de imagen
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const uploadUserAvatar = async (userId, profilePhoto) => {
  try {
    const formData = new FormData();
    formData.append('profile_photo', profilePhoto);
    
    const response = await fetch(getApiUrl(`/api/users/${userId}/profile-photo`), {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en uploadUserAvatar:', error);
    throw error;
  }
};

// ===== GESTIÓN DE ROLES DE USUARIO =====

/**
 * Asignar rol a usuario
 * @param {string|number} userId - ID del usuario
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const assignRoleToUser = async (userId, roleName) => {
  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}/roles`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: roleName }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en assignRoleToUser:', error);
    throw error;
  }
};

/**
 * Quitar rol de usuario
 * @param {string|number} userId - ID del usuario
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const removeRoleFromUser = async (userId, roleName) => {
  try {
    const response = await fetch(getApiUrl(`/api/users/${userId}/roles/${roleName}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en removeRoleFromUser:', error);
    throw error;
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Obtener token de acceso
 * @returns {string|null} Token de acceso
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Limpiar datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
};

/**
 * Función para manejar errores de autenticación
 * @param {Error} error - Error capturado
 */
export const handleAuthError = (error) => {
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    clearAuthData();
    // Redirigir al login
    window.location.href = '/auth/sign-in';
  }
};

/**
 * Verificar si el usuario tiene rol de administrador
 * @returns {boolean} True si es administrador
 */
export const isAdmin = () => {
  const userData = localStorage.getItem('user_data');
  if (!userData) return false;
  
  try {
    const user = JSON.parse(userData);
    return user.roles?.some(role => role.name === 'administrador');
  } catch (error) {
    return false;
  }
};

/**
 * Obtener roles del usuario autenticado
 * @returns {Array} Roles del usuario
 */
export const getUserRoles = () => {
  const userData = localStorage.getItem('user_data');
  if (!userData) return [];
  
  try {
    const user = JSON.parse(userData);
    return user.roles || [];
  } catch (error) {
    return [];
  }
};
