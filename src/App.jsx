import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "context/AuthContext";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import Loading from "components/loading";

// Componente para redirección por rol
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  // Verificar si el usuario es contador (rol 8)
  const isContador = user?.roles?.some(role => role.id === 8) || 
                    user?.roles?.some(role => role.id === "8") ||
                    user?.role_id === 8 ||
                    user?.role_id === "8" ||
                    (user?.roles && user.roles.length > 0 && user.roles[0].id === 8) ||
                    (user?.roles && user.roles.length > 0 && user.roles[0].id === "8");
  
  if (isContador) {
    return <Navigate to="/admin/contabilidad/dashboard" replace />;
  }
  
  return <Navigate to="/admin/inicio" replace />;
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Guardar la ruta actual para redirigir después del login
    const currentPath = window.location.pathname;
    if (currentPath !== "/auth/sign-in") {
      localStorage.setItem("redirectPath", currentPath);
    }
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

const App = () => {
  useEffect(() => {
    // Aplicar tema oscuro por defecto
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-primary text-text-primary">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/auth/*" element={<AuthLayout />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        
        {/* Redirecciones por defecto */}
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
      
      </div>
    </AuthProvider>
  );
};

export default App;
