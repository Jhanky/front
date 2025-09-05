import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
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
      if (!formData.email || !formData.password) {
        throw new Error("Por favor complete todos los campos");
      }

      const success = await login(formData.email, formData.password);
      if (success) {
        navigate("/admin/inicio");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex bg-primary">
      {/* Panel Izquierdo - Imágenes y Gradientes */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-blue-600/30 to-purple-600/20"></div>
        
        {/* Imágenes de fondo */}
        <div className="absolute inset-0">
          <img 
            src="/login/pic1.png" 
            alt="Solar Panel" 
            className="absolute top-10 left-10 w-32 h-32 opacity-60 animate-pulse"
          />
          <img 
            src="/login/pic2.png" 
            alt="Energy" 
            className="absolute top-1/4 right-20 w-24 h-24 opacity-50 animate-bounce"
            style={{ animationDelay: '1s' }}
          />
          <img 
            src="/login/pic3.png" 
            alt="Technology" 
            className="absolute bottom-1/3 left-20 w-28 h-28 opacity-70 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <img 
            src="/login/pic4.png" 
            alt="Innovation" 
            className="absolute bottom-20 right-10 w-20 h-20 opacity-60 animate-bounce"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        {/* Líneas decorativas */}
        <div className="absolute inset-0">
          <img 
            src="/login/line1.png" 
            alt="Line" 
            className="absolute top-1/4 left-0 w-full opacity-30"
          />
          <img 
            src="/login/line2.png" 
            alt="Line" 
            className="absolute bottom-1/3 right-0 w-full opacity-20"
          />
          <img 
            src="/login/yuan.png" 
            alt="Circle" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-10"
          />
        </div>

        {/* Contenido del panel izquierdo */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-accent-primary bg-clip-text text-transparent">
              Solar Energy
            </h1>
            <p className="text-xl text-gray-300 max-w-md">
              Sistema de monitoreo inteligente para plantas fotovoltaicas
            </p>
            <div className="flex space-x-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-primary">100%</div>
                <div className="text-sm text-gray-400">Renovable</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Monitoreo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">AI</div>
                <div className="text-sm text-gray-400">Inteligente</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header del formulario */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-text-secondary">
              Accede a tu panel de control solar
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
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-text-secondary hover:text-text-primary transition-colors duration-200 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-gray-600 bg-gray-700 text-accent-primary focus:ring-accent-primary/20" />
                  Recordarme
                </label>
                <a href="#" className="text-accent-primary hover:text-accent-hover transition-colors duration-200">
                  ¿Olvidaste tu contraseña?
                </a>
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

            {/* Footer del formulario */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                ¿No tienes una cuenta?{" "}
                <a href="#" className="text-accent-primary hover:text-accent-hover transition-colors duration-200 font-medium">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-xs">
              © 2024 Sistema Solar. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;