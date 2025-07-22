import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InputField from "components/fields/InputField";
import Logo from "components/logo";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        const redirectPath = localStorage.getItem("redirectPath") || "/admin/default";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath);
      }
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-200">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)] border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo width={180} height={180} />
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Bienvenido
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Email */}
          <InputField
            variant="auth"
            label="Correo electrónico"
            placeholder="Ingrese su correo electrónico"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <InputField
            variant="auth"
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-600 py-3 text-base font-medium text-white transition duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
