import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [search, setSearch] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    id_rol: ""
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch("http://localhost:3000/api/usuarios", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }

      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      nombre: "",
      email: "",
      contraseña: "",
      id_rol: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: "",
      id_rol: usuario.id_rol
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajes([]);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Preparar los datos para enviar con el campo password correcto
      const datosCreacion = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.contraseña,
        id_rol: parseInt(formData.id_rol)
      };

      const response = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosCreacion)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al crear el usuario");
      }

      setMensajes([{
        contenido: "Usuario creado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsCreateModalOpen(false);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajes([]);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Preparar los datos para enviar
      const datosActualizacion = {
        nombre: formData.nombre,
        email: formData.email,
        id_rol: parseInt(formData.id_rol)
      };

      // Solo incluir la contraseña si se ha modificado
      if (formData.contraseña) {
        datosActualizacion.password = formData.contraseña;
      }

      const response = await fetch(`http://localhost:3000/api/usuarios/${selectedUsuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizacion)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al actualizar el usuario");
      }

      setMensajes([{
        contenido: "Usuario actualizado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsEditModalOpen(false);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  const handleDeleteConfirm = async () => {
    setError("");
    setMensajes([]);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(`http://localhost:3000/api/usuarios/${selectedUsuario.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || "Error al eliminar el usuario");
      }

      setMensajes([{
        contenido: "Usuario eliminado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsDeleteModalOpen(false);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => 
    usuario.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <Mensaje 
          contenido={error} 
          tipo="error"
        />
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Usuarios
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nuevo Usuario
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-green-500 focus:outline-none"
              />
              <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Mensajes */}
          {mensajes.map((mensaje, index) => (
            <Mensaje
              key={index}
              contenido={mensaje.contenido}
              tipo={mensaje.tipo}
            />
          ))}

          {/* Tabla de usuarios */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">{usuario.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{usuario.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {usuario.id_rol === 1 ? "Administrador" : 
                       usuario.id_rol === 2 ? "Vendedor" : 
                       usuario.id_rol === 3 ? "Técnico" : "Usuario"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Usuario"
      >
        <div className="p-4">
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ingrese el nombre completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ingrese la contraseña"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Vendedor</option>
                <option value="3">Técnico</option>
              </select>
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Usuario"
      >
        <div className="p-4">
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Dejar en blanco para mantener la actual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                name="id_rol"
                value={formData.id_rol}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Vendedor</option>
                <option value="3">Técnico</option>
              </select>
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Usuario"
      >
        <div className="p-4">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar al usuario {selectedUsuario?.nombre}?
          </p>
          {error && (
            <div className="mt-4">
              <Mensaje 
                contenido={error} 
                tipo="error"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Usuarios; 