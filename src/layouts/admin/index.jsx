import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import routeComponents from "routesComponents";
import { useAuth } from 'context/AuthContext';
import routesModule from 'routes/index';
import Loading from "components/loading";

const Admin = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");
  
  // Obtener rutas según el rol del usuario
  const routes = routesModule.getRoutesByRole(user?.role);

  React.useEffect(() => {
    // Desactivar modo oscuro
    document.documentElement.classList.remove('dark');
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);

  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname, routes]);

  const getActiveRoute = (routes) => {
    let activeRoute = "Main Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].submenu) {
        for (let j = 0; j < routes[i].submenu.length; j++) {
          if (location.pathname.includes(routes[i].submenu[j].path)) {
            setCurrentRoute(routes[i].submenu[j].name);
            return;
          }
        }
      } else if (location.pathname.includes(routes[i].layout + "/" + routes[i].path)) {
        setCurrentRoute(routes[i].name);
        break;
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].submenu) {
        for (let j = 0; j < routes[i].submenu.length; j++) {
          if (location.pathname.includes(routes[i].submenu[j].path)) {
            return routes[i].submenu[j].secondary;
          }
        }
      } else if (location.pathname.includes(routes[i].layout + "/" + routes[i].path)) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/auth/sign-in";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      window.location.href = "/auth/sign-in";
    }
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Función recursiva para obtener todas las rutas de submenús
  const getAllRoutes = (routesArr) => {
    let allRoutes = [];
    routesArr.forEach((route) => {
      if (route.layout === "/admin") {
        if (route.submenu) {
          allRoutes = allRoutes.concat(getAllRoutes(route.submenu));
        }
        if (route.path && routeComponents[route.path]) {
          allRoutes.push({ path: route.path, element: routeComponents[route.path] });
        }
      }
    });
    return allRoutes;
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  document.documentElement.dir = "ltr";
  return (
    <div className="flex h-full w-full">
      <Sidebar 
        open={open} 
        onClose={() => setOpen(false)} 
        variant="admin" 
        onCollapse={handleSidebarCollapse}
      />
      {/* Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        <main className={`mx-[12px] h-full flex-none transition-all duration-300 md:pr-2 ${
          sidebarCollapsed ? 'xl:ml-[80px]' : 'xl:ml-[313px]'
        }`}>
          {/* Routes */}
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              brandText={currentRoute}
              secondary={getActiveNavbar(routes)}
              user={user}
              onLogout={handleLogout}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getAllRoutes(routes).map((r, idx) => (
                  <Route key={idx} path={r.path} element={r.element} />
                ))}
              </Routes>
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
