import { getApiUrl } from '../config/api';

// Roles del sistema según la información proporcionada
const SYSTEM_ROLES = [
  {
    id: 1,
    name: "administrador",
    display_name: "Administrador",
    description: "Acceso completo al sistema"
  },
  {
    id: 2,
    name: "comercial",
    display_name: "Comercial",
    description: "Gestión de clientes, cotizaciones y ventas"
  },
  {
    id: 3,
    name: "tecnico",
    display_name: "Técnico",
    description: "Gestión de proyectos e instalaciones"
  }
];

// Headers comunes para todas las peticiones
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

// Headers con autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.token : null;
  return {
    ...getHeaders(),
    'Authorization': `Bearer ${token}`
  };
};

// Obtener roles del sistema (estático por ahora)
export const getSystemRoles = async () => {
  return SYSTEM_ROLES;
};

// Obtener roles del usuario actual desde localStorage
export const getCurrentUserRoles = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.roles || [];
    }
    
    // Fallback para compatibilidad
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    return [];
  }
};

// Verificar si el usuario es administrador
export const isAdmin = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.roles?.some(role => role.name === 'administrador') || user.role === 'administrador';
    }
    
    // Fallback para compatibilidad
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles?.some(role => role.name === 'administrador') || parsedUser.role === 'administrador';
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar si es admin:', error);
    return false;
  }
};

// Verificar si el usuario es comercial
export const isCommercial = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.roles?.some(role => role.name === 'comercial') || user.role === 'comercial';
    }
    
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles?.some(role => role.name === 'comercial') || parsedUser.role === 'comercial';
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar si es comercial:', error);
    return false;
  }
};

// Verificar si el usuario es técnico
export const isTechnician = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      return user.roles?.some(role => role.name === 'tecnico') || user.role === 'tecnico';
    }
    
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.roles?.some(role => role.name === 'tecnico') || parsedUser.role === 'tecnico';
    }
    
    return false;
  } catch (error) {
    console.error('Error al verificar si es técnico:', error);
    return false;
  }
};

// Obtener permisos del usuario actual
export const getCurrentUserPermissions = () => {
  const roles = getCurrentUserRoles();
  const permissions = [];
  
  roles.forEach(role => {
    switch (role.name) {
      case 'administrador':
        permissions.push(
          'users.create', 'users.edit', 'users.delete', 'users.view',
          'roles.assign', 'roles.view',
          'projects.create', 'projects.edit', 'projects.delete', 'projects.view',
          'clients.create', 'clients.edit', 'clients.delete', 'clients.view',
          'quotations.create', 'quotations.edit', 'quotations.delete', 'quotations.view',
          'financial.view', 'financial.edit'
        );
        break;
      case 'comercial':
        permissions.push(
          'clients.create', 'clients.edit', 'clients.view',
          'quotations.create', 'quotations.edit', 'quotations.view',
          'projects.view'
        );
        break;
      case 'tecnico':
        permissions.push(
          'projects.create', 'projects.edit', 'projects.view',
          'activities.create', 'activities.edit', 'activities.view',
          'reports.create', 'reports.view'
        );
        break;
    }
  });
  
  return [...new Set(permissions)]; // Eliminar duplicados
};

// Verificar si el usuario tiene un permiso específico
export const hasPermission = (permission) => {
  const permissions = getCurrentUserPermissions();
  return permissions.includes(permission);
};

// Obtener roles disponibles para asignación
export const getAvailableRoles = async () => {
  return SYSTEM_ROLES;
};

// Obtener información de un rol específico
export const getRoleInfo = (roleName) => {
  return SYSTEM_ROLES.find(role => role.name === roleName);
};

// Verificar si el usuario puede crear usuarios
export const canCreateUsers = async () => {
  return await isAdmin();
};

// Verificar si el usuario puede editar usuarios
export const canEditUsers = async () => {
  return await isAdmin();
};

// Verificar si el usuario puede eliminar usuarios
export const canDeleteUsers = async () => {
  return await isAdmin();
};

// Verificar si el usuario puede asignar roles
export const canAssignRoles = async () => {
  return await isAdmin();
};
