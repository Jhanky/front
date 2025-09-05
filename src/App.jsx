import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "context/AuthContext";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import Loading from "components/loading";
import { checkApiConfig } from "config/api";
import ApiToggle from "components/ApiToggle";

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
    // Verificar la configuración de la API al cargar la aplicación
    checkApiConfig();
    
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
        <Route path="/" element={<Navigate to="/admin/inicio" replace />} />
        <Route path="*" element={<Navigate to="/admin/inicio" replace />} />
      </Routes>
      
      {/* Toggle de API - Solo visible en desarrollo */}
      {process.env.NODE_ENV === 'development' && <ApiToggle />}
      </div>
    </AuthProvider>
  );
};

export default App;
