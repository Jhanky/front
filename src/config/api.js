// Configuración de la API
const getApiBaseUrl = () => {
  // Si hay una variable de entorno específica, usarla
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Si hay configuración en el navegador (para producción)
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    return window.APP_CONFIG.API_URL;
  }
  
  // URL de producción por defecto
  return 'https://www.api.energy4cero.com/public';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/users',
    ROLES: '/api/roles',
    PERMISSIONS: '/api/permissions',
    PROJECTS: '/api/projects',
    QUOTATIONS: '/api/quotations',
    CLIENTS: '/api/clients',
    PANELS: '/api/panels',
    INVERTERS: '/api/inverters',
    BATTERIES: '/api/batteries',
    SUPPLIERS: '/api/suppliers',
    COST_CENTERS: '/api/cost-centers',
    PURCHASES: '/api/purchases',
    ADMIN: '/api/admin',
    SIGO: '/api/siigo'
  }
};

// Configuración de Siigo API
export const SIGO_CONFIG = {
  // Credenciales de Siigo API - CONFIGURADAS
  USERNAME: process.env.REACT_APP_SIGO_USERNAME || 'silvia.p@energy4cero.com',
  ACCESS_KEY: process.env.REACT_APP_SIGO_ACCESS_KEY || 'NWQzOTI2YmUtMjVmYi00NzZjLTg0YzEtZTI0YjlmZDNlMWY0OlkjZXE2NTJ7c00=',
  
  // URLs de Siigo API
  BASE_URL: 'https://api.siigo.com',
  AUTH_URL: 'https://api.siigo.com/auth',
  API_VERSION: 'v1',
  
  // Partner ID requerido por Siigo
  PARTNER_ID: 'enterprise',
  
  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000
};

// Función para obtener la URL completa de la API
export const getApiUrl = (endpoint = '') => {
  const baseUrl = API_CONFIG.BASE_URL;

  return `${baseUrl}${endpoint}`;
};

// Función para obtener headers de autenticación
export const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
};

// Función para manejar errores de fetch
export const handleFetchError = (error, url) => {
  console.error('Error en petición a:', url);
  console.error('Error completo:', error);
  
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    console.error('Posibles causas:');
    console.error('1. Problema de CORS - El servidor no permite peticiones desde este dominio');
    console.error('2. Problema de red - No se puede conectar al servidor');
    console.error('3. Problema de HTTPS/SSL - Certificado inválido');
    console.error('4. URL incorrecta - Verificar que la API esté funcionando');
  }
  
  return {
    success: false,
    error: error.message,
    details: 'Error de conexión con el servidor'
  };
};

// Función para obtener URLs de hojas técnicas
export const getTechnicalSheetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_CONFIG.BASE_URL}${url}`;
};