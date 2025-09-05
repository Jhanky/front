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

/**
 * Iniciar sesión
 * @param {Object} credentials - Credenciales de login (email, password)
 * @returns {Promise<Object>} Respuesta del servidor con token
 */
export const login = async (credentials) => {
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
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const register = async (userData) => {
  try {
    const response = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    
    // Guardar token si se proporciona en el registro
    if (data.token) {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user || {}));
    }
    
    return data;
  } catch (error) {
    console.error('Error en register:', error);
    throw error;
  }
};

/**
 * Cerrar sesión
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const logout = async () => {
  try {
    const response = await fetch(getApiUrl('/api/auth/logout'), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    // Limpiar datos del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error en logout:', error);
    // Limpiar datos incluso si hay error
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
 * Obtener datos del usuario desde localStorage
 * @returns {Object|null} Datos del usuario
 */
export const getUserData = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
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
 * Verificar si el token ha expirado
 * @returns {boolean} True si el token ha expirado
 */
export const isTokenExpired = () => {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Interceptor para manejar automáticamente la renovación de tokens
 * @param {Function} apiCall - Función de llamada a la API
 * @returns {Promise} Resultado de la llamada a la API
 */
export const withAuthRefresh = async (apiCall) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.message.includes('401') && !isTokenExpired()) {
      // Intentar renovar el token
      try {
        await refreshToken();
        return await apiCall();
      } catch (refreshError) {
        clearAuthData();
        window.location.href = '/auth/sign-in';
        throw refreshError;
      }
    }
    throw error;
  }
};
