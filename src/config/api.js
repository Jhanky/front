// Configuración de la API
const getApiBaseUrl = () => {
  // Primero verificar si hay una URL guardada en localStorage (para cambios dinámicos)
  const savedUrl = localStorage.getItem('REACT_APP_API_URL');
  if (savedUrl) {
    return savedUrl;
  }
  
  // Si hay una variable de entorno específica, usarla
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Si no hay variable de entorno, usar la URL de desarrollo por defecto
  return 'http://127.0.0.1:8000';
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
    ADMIN: '/api/admin'
  }
};

// Función para obtener la URL completa de la API
export const getApiUrl = (endpoint = '') => {
  const baseUrl = API_CONFIG.BASE_URL;

  return `${baseUrl}${endpoint}`;
};

// Función para cambiar dinámicamente la URL de la API
export const setApiUrl = (newUrl) => {
  localStorage.setItem('REACT_APP_API_URL', newUrl);
  // Recargar la página para aplicar el cambio
  window.location.reload();
};

// Función para obtener URLs de hojas técnicas
export const getTechnicalSheetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_CONFIG.BASE_URL}${url}`;
};

// Función para verificar la configuración de la API
export const checkApiConfig = () => {

};

// URLs predefinidas para cambiar rápidamente
export const API_URLS = {
  DEVELOPMENT: 'http://127.0.0.1:8000',
  PRODUCTION: 'https://www.api.energy4cero.com/public',
  LOCALHOST: 'http://localhost:3000',
  LOCALHOST_8000: 'http://localhost:8000'
};