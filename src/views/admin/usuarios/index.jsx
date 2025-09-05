import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, MdClear, MdDownload, MdUpload } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  uploadUserAvatar,
  handleAuthError,
  isAdmin 
} from '../../../services/usuariosService';
import { getAvailableRoles, canCreateUsers, canEditUsers, canDeleteUsers } from '../../../services/rolesService';

const Usuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  
         // Estados para filtros
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");
    const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    id_rol: "",
    phone: "",
    job_title: ""
  });

  const [roles, setRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState({
    canCreate: false,
    canEdit: false,
    canDelete: false
  });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    checkUserPermissions();
  }, [role]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (role) filters.role = role;
      if (search) filters.search = search;

      const data = await getUsers(filters);
      setUsuarios(data.data || data || []);
    } catch (error) {
      handleAuthError(error);
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getAvailableRoles();
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const checkUserPermissions = async () => {
    try {
      const canCreate = await canCreateUsers();
      const canEdit = await canEditUsers();
      const canDelete = await canDeleteUsers();
      
      setUserPermissions({
        canCreate,
        canEdit,
        canDelete
      });
    } catch (error) {
      console.error('Error al verificar permisos:', error);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRole("");
  };

  const handleCreate = () => {
    setFormData({
      nombre: "",
      email: "",
      contraseña: "",
      id_rol: "",
      phone: "",
      job_title: ""
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.name || usuario.nombre,
      email: usuario.email,
      contraseña: "",
      id_rol: usuario.roles?.[0]?.id || usuario.id_rol,
      phone: usuario.phone || "",
      job_title: usuario.job_title || ""
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
      // Preparar los datos para enviar según la especificación
      const userData = {
        name: formData.nombre,
        username: formData.email.split('@')[0], // Generar username del email
        email: formData.email,
        password: formData.contraseña,
        phone: formData.phone,
        job_title: formData.job_title || ""
      };

      // Si se seleccionó un rol específico, agregarlo
      if (formData.id_rol) {
        const selectedRole = roles.find(r => r.id.toString() === formData.id_rol);
        if (selectedRole) {
          userData.role = selectedRole.name;
        }
      }

      await createUser(userData);

      setMensajes([{
        contenido: "Usuario creado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsCreateModalOpen(false);
    } catch (error) {
      handleAuthError(error);
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
      // Preparar los datos para enviar según la especificación
      const userData = {
        name: formData.nombre,
        username: formData.email.split('@')[0], // Generar username del email
        email: formData.email,
        phone: formData.phone,
        job_title: formData.job_title || ""
      };

      // Solo incluir la contraseña si se ha modificado
      if (formData.contraseña) {
        userData.password = formData.contraseña;
      }

      // Si se seleccionó un rol específico, agregarlo
      if (formData.id_rol) {
        const selectedRole = roles.find(r => r.id.toString() === formData.id_rol);
        if (selectedRole) {
          userData.role = selectedRole.name;
        }
      }

      await updateUser(selectedUsuario.id, userData);

      setMensajes([{
        contenido: "Usuario actualizado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsEditModalOpen(false);
    } catch (error) {
      handleAuthError(error);
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
      await deleteUser(selectedUsuario.id);

      setMensajes([{
        contenido: "Usuario eliminado exitosamente",
        tipo: "success"
      }]);

      await fetchUsuarios();
      setIsDeleteModalOpen(false);
    } catch (error) {
      handleAuthError(error);
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  // Filtrar usuarios localmente
  const filteredUsuarios = usuarios.filter(usuario => {
    // Filtro por búsqueda general
    const matchesSearch = 
      usuario.name?.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(search.toLowerCase()) ||
      usuario.phone?.includes(search);
    
    // Filtro por rol
    const matchesRole = !role || usuario.roles?.some(r => r.name === role);
    
    return matchesSearch && matchesRole;
  });





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
          className="rounded-lg bg-accent-primary px-6 py-2.5 text-white transition-colors hover:bg-accent-hover"
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
            <h1 className="text-2xl font-bold text-text-primary">
              Usuarios
            </h1>
            <div className="flex gap-2">
              {userPermissions.canCreate && (
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
                >
                  <MdAdd className="h-5 w-5" />
                  Nuevo Usuario
                </button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda y filtros */}
          <div className="mb-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-text-disabled/30 px-4 py-2 pl-10 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-disabled" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 transition-colors"
              >
                <MdFilterList className="h-5 w-5" />
                Filtros
              </button>
                             {(search || role) && (
                 <button
                   onClick={clearFilters}
                   className="flex items-center gap-2 rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 transition-colors"
                 >
                   <MdClear className="h-5 w-5" />
                   Limpiar
                 </button>
               )}
            </div>

                                                   {/* Filtros expandibles */}
              {showFilters && (
                <div className="grid grid-cols-1 gap-4 rounded-lg border border-text-disabled/20 bg-primary-card p-4 md:grid-cols-1">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Rol
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                    >
                      <option value="">Todos</option>
                      {roles.map((rol) => (
                        <option key={rol.id} value={rol.name}>
                          {rol.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
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
                <tr className="border-b border-text-disabled/20 bg-primary">
                                                           <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nombre</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Email</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Teléfono</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Rol</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Cargo</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
                             <tbody>
                                    {filteredUsuarios.length === 0 ? (
                     <tr>
                       <td colSpan="6" className="px-4 py-8 text-center text-text-secondary">
                         {search || role ? 
                           "No se encontraron usuarios con los filtros aplicados" : 
                           "No hay usuarios registrados"
                         }
                       </td>
                     </tr>
                   ) : (
                   filteredUsuarios.map((usuario) => (
                     <tr key={usuario.id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                                                <td className="px-4 py-3 text-sm text-text-primary">
                           <div className="flex items-center gap-3">
                           {usuario.avatar && (
                             <img
                               src={usuario.avatar}
                               alt={usuario.name}
                               className="h-8 w-8 rounded-full object-cover"
                             />
                           )}
                           <span>{usuario.name}</span>
                         </div>
                       </td>
                                               <td className="px-4 py-3 text-sm text-text-primary">{usuario.email}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">{usuario.phone || "-"}</td>
                                                 <td className="px-4 py-3 text-sm text-text-primary">
                           {usuario.roles?.map(role => role.display_name || role.name).join(", ") || "-"}
                         </td>
                                                <td className="px-4 py-3 text-sm text-text-primary">
                           {usuario.job_title || "-"}
                         </td>
                                                                       <td className="px-4 py-3 text-sm text-text-primary">
                          <div className="flex gap-2">
                            {userPermissions.canEdit && (
                              <button
                                onClick={() => handleEdit(usuario)}
                                className="text-accent-primary hover:text-accent-hover transition-colors"
                                title="Editar"
                              >
                                <MdEdit className="h-5 w-5" />
                              </button>
                            )}
                            {userPermissions.canDelete && (
                              <button
                                onClick={() => handleDelete(usuario)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                                title="Eliminar"
                              >
                                <MdDelete className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                   </tr>
                 ))
               )}
             </tbody>
            </table>

                         {/* Información de resultados */}
             <div className="mt-6 flex items-center justify-between">
                               <div className="text-sm text-text-secondary">
                 Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
               </div>
             </div>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Nombre Completo
                 </label>
                 <input
                   type="text"
                   name="nombre"
                   value={formData.nombre}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="Ingrese el nombre completo"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Email
                 </label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="ejemplo@energy4cero.com"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Teléfono
                 </label>
                 <input
                   type="tel"
                   name="phone"
                   value={formData.phone}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="+573001234567"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Cargo
                 </label>
                 <input
                   type="text"
                   name="job_title"
                   value={formData.job_title}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="Desarrollador, Vendedor, etc."
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Rol
                 </label>
                 <select
                   name="id_rol"
                   value={formData.id_rol}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   required
                 >
                   <option value="">Seleccione un rol</option>
                   {roles.map((rol) => (
                     <option key={rol.id} value={rol.id}>
                       {rol.display_name}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-text-secondary">
                 Contraseña
               </label>
               <input
                 type="password"
                 name="contraseña"
                 value={formData.contraseña}
                 onChange={handleInputChange}
                 className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                 placeholder="Ingrese la contraseña"
                 required
               />
             </div>
             <div className="flex items-center">
               <input
                 type="checkbox"
                 name="is_active"
                 checked={formData.is_active}
                 onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                 className="h-4 w-4 text-accent-primary focus:ring-accent-primary border-text-disabled/30 rounded"
               />
               <label className="ml-2 block text-sm text-text-secondary">
                 Usuario Activo
               </label>
             </div>
             {error && (
               <div className="text-sm text-red-400">
                 {error}
               </div>
             )}
             <div className="flex justify-end gap-2">
               <button
                 type="button"
                 onClick={() => setIsCreateModalOpen(false)}
                 className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 transition-colors"
               >
                 Cancelar
               </button>
               <button
                 type="submit"
                 className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Nombre Completo
                 </label>
                 <input
                   type="text"
                   name="nombre"
                   value={formData.nombre}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Email
                 </label>
                 <input
                   type="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Teléfono
                 </label>
                 <input
                   type="tel"
                   name="phone"
                   value={formData.phone}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="+573001234567"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Cargo
                 </label>
                 <input
                   type="text"
                   name="job_title"
                   value={formData.job_title}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   placeholder="Desarrollador, Vendedor, etc."
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-text-secondary">
                   Rol
                 </label>
                 <select
                   name="id_rol"
                   value={formData.id_rol}
                   onChange={handleInputChange}
                   className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                   required
                 >
                   <option value="">Seleccione un rol</option>
                   {roles.map((rol) => (
                     <option key={rol.id} value={rol.id}>
                       {rol.display_name}
                     </option>
                   ))}
                 </select>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-text-secondary">
                 Contraseña
               </label>
               <input
                 type="password"
                 name="contraseña"
                 value={formData.contraseña}
                 onChange={handleInputChange}
                 className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                 placeholder="Dejar en blanco para mantener la actual"
               />
             </div>
             <div className="flex items-center">
               <input
                 type="checkbox"
                 name="is_active"
                 checked={formData.is_active}
                 onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                 className="h-4 w-4 text-accent-primary focus:ring-accent-primary border-text-disabled/30 rounded"
               />
               <label className="ml-2 block text-sm text-text-secondary">
                 Usuario Activo
               </label>
             </div>
             {error && (
               <div className="text-sm text-red-400">
                 {error}
               </div>
             )}
             <div className="flex justify-end gap-2">
               <button
                 type="button"
                 onClick={() => setIsEditModalOpen(false)}
                 className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 transition-colors"
               >
                 Cancelar
               </button>
               <button
                 type="submit"
                 className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
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
          <p className="text-text-secondary">
            ¿Está seguro que desea eliminar al usuario {selectedUsuario?.name || selectedUsuario?.nombre}?
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
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
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