export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_API_URL || 'https://www.api.energy4cero.com/public')
    : (process.env.REACT_APP_API_URL || 'https://www.api.energy4cero.com/public'),
  ENDPOINTS: {
    AUTH: '/api/auth',
    USERS: '/api/usuarios',
    PROJECTS: '/api/projects',
    QUOTATIONS: '/api/quotations',
    CLIENTS: '/api/clients',
    PANELS: '/api/panels',
    INVERTERS: '/api/inverters',
    BATTERIES: '/api/batteries',
    SUPPLIERS: '/api/suppliers',
    COST_CENTERS: '/api/cost-centers',
    PURCHASES: '/api/purchases'
  }
};

export const getApiUrl = (endpoint = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getTechnicalSheetUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_CONFIG.BASE_URL}${url}`;
};