import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "components/loading";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (!email || !password) {
        setError("Por favor complete todos los campos");
        setLoading(false);
        return;
      }

      const success = await login(email, password);
      
      if (success) {
        const redirectPath = localStorage.getItem("redirectPath") || "/admin/inicio";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath);
      }
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex bg-primary">
      {/* Fondo con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-blue-600/5 to-purple-600/10"></div>
      
      {/* Patrón de puntos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 200, 117, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Contenido principal centrado */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
                          <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-hover rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-white text-sm font-bold text-center leading-tight">Energy<br/>4.0</div>
                </div>
              </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Sistema de Gestión
            </h1>
            <p className="text-text-secondary">
              Accede a tu panel de monitoreo
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-primary-card rounded-2xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600/50 bg-gray-700/80 text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 backdrop-blur-sm"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Contraseña
                </label>
                <div className="relative">
                  <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-600/50 bg-gray-700/80 text-text-primary placeholder-text-secondary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                  >
                    {showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div className="flex items-center text-sm">
                <label className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-700 text-accent-primary focus:ring-accent-primary/20" />
                  Recordarme
                </label>
              </div>

              {/* Botón de Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-accent-primary to-accent-hover py-4 text-white font-semibold hover:shadow-lg disabled:opacity-50 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-xs">
              © 2024 Sistema de Gestión. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
