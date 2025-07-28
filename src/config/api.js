export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://149.130.169.113:3030',
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