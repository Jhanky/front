import { adminRoutes } from './adminRoutes';
import { comercialRoutes } from './comercialRoutes';
import { tecnicoRoutes } from './tecnicoRoutes';

// Rutas comunes (sin restricción de rol)
const commonRoutes = [
  {
    name: "Iniciar Sesión",
    layout: "/auth",
    path: "sign-in"
  }
];

// Función para obtener rutas según el rol del usuario
const getRoutesByRole = (userRole) => {
  switch (userRole) {
    case 'admin':
      return [...adminRoutes, ...commonRoutes];
    case 'comercial':
      return [...comercialRoutes, ...commonRoutes];
    case 'tecnico':
      return [...tecnicoRoutes, ...commonRoutes];
    default:
      return commonRoutes;
  }
};

// Exportar todas las rutas (para casos donde se necesiten todas)
const allRoutes = [...adminRoutes, ...comercialRoutes, ...tecnicoRoutes, ...commonRoutes];

// Exportación por defecto que incluye todas las funciones
const routesModule = {
  getRoutesByRole,
  allRoutes,
  adminRoutes,
  comercialRoutes,
  tecnicoRoutes,
  commonRoutes
};

export default routesModule;
export { getRoutesByRole, allRoutes, adminRoutes, comercialRoutes, tecnicoRoutes, commonRoutes };