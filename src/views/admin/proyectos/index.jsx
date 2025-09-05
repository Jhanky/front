import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdEdit, MdCalendarToday, MdPerson, MdSearch, MdFilterList, MdAdd } from "react-icons/md";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import { proyectosService } from '../../../services/proyectosService';
import { useNavigate } from 'react-router-dom';

// Hook personalizado para debounce
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Proyectos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados principales
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  
  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    start_date: "", 
    estimated_end_date: "", 
    budget: "",
    notes: "",
    installation_address: ""
  });
  
  // Estado para filtros y búsqueda
  const [filtros, setFiltros] = useState({
    search: ""
  });

  // Estado para paginación
  const [paginacion, setPaginacion] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState(null);

  // Cargar proyectos al montar el componente
  useEffect(() => {
    if (user?.token) {
      cargarProyectos();
      cargarEstadisticas();
    }
  }, [user?.token]);

  // Cargar proyectos solo cuando cambia la página (no en cada búsqueda)
  useEffect(() => {
    if (user?.token && !filtros.search) {
      cargarProyectos();
    }
  }, [paginacion.current_page, user?.token]);

  // Cargar proyectos desde la API
  const cargarProyectos = async () => {
    try {
      console.log('🚀 DEBUG: Iniciando carga de proyectos');
      setLoading(true);
      setError(null);
      
      const params = {
        page: paginacion.current_page
      };
      
      console.log('🔍 DEBUG: Cargando proyectos con parámetros:', params);
      console.log('🔍 DEBUG: Token del usuario:', !!user?.token);
      console.log('🔍 DEBUG: Usuario:', user);
      
      const response = await proyectosService.getProyectos(params, user.token);
      
      console.log('📥 DEBUG: Respuesta del servicio:', response);
      console.log('📥 DEBUG: Tipo de respuesta:', typeof response);
      console.log('📥 DEBUG: ¿Tiene success?', 'success' in response);
      console.log('📥 DEBUG: ¿Tiene data?', 'data' in response);
      console.log('📥 DEBUG: ¿Data es array?', Array.isArray(response.data));
      
      if (response.success) {
        console.log('✅ DEBUG: Respuesta exitosa, procesando datos...');
        // Formatear proyectos para el frontend
        const proyectosFormateados = response.data
          .map(proyecto => {
            console.log('🔍 DEBUG: Procesando proyecto:', proyecto);
            return proyectosService.formatProyectoForFrontend(proyecto);
          })
          .filter(proyecto => proyecto !== null); // Filtrar proyectos inválidos
        
        console.log('✅ DEBUG: Proyectos formateados:', proyectosFormateados);
        console.log('✅ DEBUG: Cantidad de proyectos válidos:', proyectosFormateados.length);
        
        setProyectos(proyectosFormateados);
        
        if (response.pagination) {
          setPaginacion(response.pagination);
          console.log('📊 DEBUG: Paginación actualizada:', response.pagination);
        }
        
        console.log('✅ Proyectos cargados exitosamente:', proyectosFormateados.length);
      } else {
        console.warn('⚠️ Respuesta no exitosa:', response);
        // Si no es exitosa pero hay datos, intentar usarlos
        if (response.data && Array.isArray(response.data)) {
          console.log('⚠️ DEBUG: Intentando usar datos aunque no sea exitoso');
          const proyectosFormateados = response.data
            .map(proyecto => proyectosService.formatProyectoForFrontend(proyecto))
            .filter(proyecto => proyecto !== null);
          
          setProyectos(proyectosFormateados);
          console.log('✅ Proyectos cargados (respuesta no exitosa):', proyectosFormateados.length);
        } else {
          console.error('❌ DEBUG: No hay datos válidos en la respuesta');
          throw new Error(response.message || 'Error al cargar proyectos');
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
      console.error('❌ Stack trace:', error.stack);
      setError(error.message);
      setMensajes([{ contenido: `Error al cargar proyectos: ${error.message}`, tipo: "error" }]);
      setProyectos([]); // Limpiar proyectos en caso de error
    } finally {
      setLoading(false);
      console.log('🏁 DEBUG: Carga de proyectos finalizada');
    }
  };

  // Filtrado local de proyectos (exactamente como en clientes)
  const filteredProyectos = proyectos.filter(proyecto => {
    // Filtro por búsqueda general
    const matchesSearch = 
      proyecto.project_name?.toLowerCase().includes(filtros.search.toLowerCase()) ||
      proyecto.client?.name?.toLowerCase().includes(filtros.search.toLowerCase()) ||
      proyecto.client?.nic?.toString().includes(filtros.search) ||
      proyecto.codigo_proyecto?.toLowerCase().includes(filtros.search.toLowerCase());
    
    return matchesSearch;
  });

  // Manejar búsqueda del formulario
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 DEBUG: Búsqueda manual ejecutada:', filtros.search);
    cargarProyectos(); // Recargar con los filtros actuales
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      console.log('📊 DEBUG: Cargando estadísticas de proyectos');
      
      const response = await proyectosService.getEstadisticas(user.token);
      
      console.log('📥 DEBUG: Respuesta de estadísticas:', response);
      
      if (response.success && response.data) {
        setEstadisticas(response.data);
        console.log('✅ Estadísticas cargadas:', response.data);
      } else {
        console.warn('⚠️ Estadísticas no exitosas o sin datos:', response);
        // Intentar usar los datos aunque no sea exitoso
        if (response.data) {
          setEstadisticas(response.data);
          console.log('✅ Estadísticas cargadas (respuesta no exitosa):', response.data);
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      // No mostrar error al usuario para estadísticas
    }
  };

  // Cambiar página
  const cambiarPagina = (nuevaPagina) => {
    setPaginacion(prev => ({ ...prev, current_page: nuevaPagina }));
  };

  // Cambiar estado del proyecto
  const handleEstadoChange = async (proyectoId, nuevoStatusId) => {
    try {
      setLoading(true);
      
      console.log('🔄 Cambiando estado del proyecto:', proyectoId, 'a status_id:', nuevoStatusId);
      
      const response = await proyectosService.changeProyectoStatus(
        proyectoId, 
        nuevoStatusId, 
        user.token
      );
      
      if (response.success) {
        // Actualizar el estado local
        setProyectos(prevProyectos => 
          prevProyectos.map(p => 
            p.project_id === proyectoId 
              ? { ...p, status_id: nuevoStatusId, status: response.data.status }
              : p
          )
        );
        
        setMensajes([{ 
          contenido: `Estado actualizado exitosamente a: ${response.data.status.name}`, 
          tipo: "success" 
        }]);
        
        // Recargar estadísticas
        cargarEstadisticas();
      } else {
        throw new Error(response.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setMensajes([{ 
        contenido: `Error al actualizar estado: ${error.message}`, 
        tipo: "error" 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => setMensajes([]), 3000);
    }
  };

  // Abrir modal de edición
  const handleEdit = (proyecto) => {
    setSelectedProyecto(proyecto);
    setEditForm({
      start_date: proyecto.start_date || "",
      estimated_end_date: proyecto.estimated_end_date || "",
      budget: proyecto.budget || "",
      notes: proyecto.notes || "",
      installation_address: proyecto.installation_address || ""
    });
    setIsEditModalOpen(true);
  };

  // Guardar cambios del proyecto
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validar datos antes de enviar
      const validation = proyectosService.validateProyectoData(editForm);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Formatear datos para el backend
      const datosActualizados = proyectosService.formatProyectoForBackend(editForm);
      
      console.log('📝 Actualizando proyecto:', selectedProyecto.project_id);
      console.log('📋 Datos a actualizar:', datosActualizados);
      
      const response = await proyectosService.updateProyecto(
        selectedProyecto.project_id, 
        datosActualizados, 
        user.token
      );
      
      if (response.success) {
        // Actualizar el estado local
        setProyectos(prevProyectos => 
          prevProyectos.map(p => 
            p.project_id === selectedProyecto.project_id 
              ? { ...p, ...datosActualizados }
              : p
          )
        );
        
        setMensajes([{ contenido: "Proyecto actualizado exitosamente", tipo: "success" }]);
        setIsEditModalOpen(false);
      } else {
        throw new Error(response.message || 'Error al actualizar proyecto');
      }
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
      setMensajes([{ 
        contenido: `Error al actualizar proyecto: ${error.message}`, 
        tipo: "error" 
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => setMensajes([]), 3000);
    }
  };

  // Formatear número
  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-SV').format(number);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-SV');
  };

  // Obtener color del estado
  const getEstadoColor = (statusId) => {
    return proyectosService.getEstadoColor(statusId);
  };

  // Obtener nombre del estado
  const getEstadoName = (statusId) => {
    return proyectosService.getEstadoName(statusId);
  };

  if (loading && proyectos.length === 0) return <Loading />;

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-text-primary">
              Gestión de Proyectos
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
              >
                <MdAdd className="h-5 w-5" />
                Nuevo Proyecto
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={filtros.search}
                  onChange={(e) => setFiltros({ search: e.target.value })}
                  placeholder="Buscar por nombre del proyecto, cliente o código..."
                  className="w-full rounded-lg border border-text-disabled/30 px-4 py-2 pl-10 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-disabled" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
              >
                Buscar
              </button>
            </form>
            
            {/* Botón para limpiar búsqueda */}
            {filtros.search && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFiltros({ search: "" });
                    setPaginacion(prev => ({ ...prev, current_page: 1 }));
                  }}
                  className="rounded-lg bg-text-disabled px-4 py-2 text-white hover:bg-text-secondary transition-colors"
                >
                  Limpiar Búsqueda
                </button>
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-text-secondary">
              Mostrando {filteredProyectos.length} de {proyectos.length} proyectos
            </div>
            {filtros.search && (
              <div className="text-sm text-text-secondary">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Búsqueda: "{filtros.search}"
                </span>
              </div>
            )}
          </div>

          {/* Estadísticas rápidas */}
          {estadisticas && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              {estadisticas.by_status?.map((status) => (
                <div key={status.status_id} className="text-center p-4 rounded-lg bg-primary-card border border-text-disabled/20">
                  <div className="text-2xl font-bold text-text-primary">{status.projects_count}</div>
                  <div className="text-sm text-text-secondary">{status.name}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabla de proyectos */}
          <div className="bg-primary-card rounded-xl p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Error al cargar proyectos
                </h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <button
                  onClick={cargarProyectos}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredProyectos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-disabled text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No se encontraron proyectos
                </h3>
                <p className="text-text-secondary mb-4">
                  {filtros.search 
                    ? 'Intenta ajustar la búsqueda'
                    : 'No hay proyectos registrados en el sistema'
                  }
                </p>
                {filtros.search ? (
                  <button
                    onClick={() => {
                      setFiltros({ search: '' });
                      setPaginacion(prev => ({ ...prev, current_page: 1 }));
                    }}
                    className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Limpiar Búsqueda
                  </button>
                ) : (
                  <button
                    onClick={cargarProyectos}
                    className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Recargar
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-text-disabled/20">
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Proyecto</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Cotización</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Presupuesto</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Estado</th>
                      <th className="text-left py-3 px-4 text-text-secondary font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProyectos.map((proyecto) => (
                      <tr key={proyecto.project_id} className="border-b border-text-disabled/10 hover:bg-accent-primary/5">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-text-primary">{proyecto.project_name}</div>
                            <div className="text-sm text-text-secondary">
                              {proyecto.codigo_proyecto && `Código: ${proyecto.codigo_proyecto}`}
                              {proyecto.start_date && ` • Inicio: ${new Date(proyecto.start_date).toLocaleDateString()}`}
                            </div>
                            {proyecto.informacion_tecnica?.tipo_sistema && (
                              <div className="text-xs text-text-disabled mt-1">
                                🔧 {proyecto.informacion_tecnica.tipo_sistema} - {proyecto.informacion_tecnica.potencia_total} kW
                              </div>
                            )}
                            {/* Información de ubicación si está disponible */}
                            {(proyecto.location || proyecto.ubicacion) && (
                              <div className="text-xs text-text-disabled mt-1">
                                📍 {proyecto.location?.municipio || proyecto.ubicacion?.municipio || ''}
                                {(proyecto.location?.municipio || proyecto.ubicacion?.municipio) && 
                                 (proyecto.location?.departamento || proyecto.ubicacion?.departamento) && ', '}
                                {proyecto.location?.departamento || proyecto.ubicacion?.departamento || ''}
                                {(proyecto.location?.radiacion || proyecto.ubicacion?.radiacion) && 
                                 ` • ☀️ ${proyecto.location?.radiacion || proyecto.ubicacion?.radiacion} kWh/m²/día`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {proyecto.client ? (
                            <div>
                              <div className="font-medium text-text-primary">
                                {proyecto.client.name || proyecto.client.nombre || 'Cliente sin nombre'}
                              </div>
                              <div className="text-sm text-text-secondary">
                                ID: {proyecto.client.client_id || proyecto.client_id}
                                {proyecto.client.nic && ` • NIC: ${proyecto.client.nic}`}
                              </div>
                              {(proyecto.client.departamento || proyecto.client.department) && (
                                <div className="text-xs text-text-disabled mt-1">
                                  📍 {proyecto.client.ciudad || proyecto.client.city || ''}
                                  {proyecto.client.ciudad && proyecto.client.departamento && ', '}
                                  {proyecto.client.departamento || proyecto.client.department || ''}
                                </div>
                              )}
                              {(proyecto.client.telefono || proyecto.client.phone) && (
                                <div className="text-xs text-text-disabled">
                                  📞 {proyecto.client.telefono || proyecto.client.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-disabled">Cliente no disponible</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-text-secondary">#{proyecto.quotation_id || 'N/A'}</span>
                          {proyecto.informacion_tecnica?.cantidad_paneles && (
                            <div className="text-xs text-text-disabled mt-1">
                              📊 {proyecto.informacion_tecnica.cantidad_paneles} paneles
                            </div>
                          )}
                          {/* Información adicional de productos si está disponible */}
                          {proyecto.paneles && Object.keys(proyecto.paneles).length > 0 && (
                            <div className="text-xs text-text-disabled mt-1">
                              🟢 {Object.keys(proyecto.paneles).join(', ')}
                            </div>
                          )}
                          {proyecto.inversores && Object.keys(proyecto.inversores).length > 0 && (
                            <div className="text-xs text-text-disabled">
                              🔌 {Object.keys(proyecto.inversores).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-text-primary">
                            ${proyecto.budget ? proyecto.budget.toLocaleString() : '0'}
                          </span>
                          {proyecto.informacion_tecnica?.presupuesto && (
                            <div className="text-xs text-text-secondary">
                              Presupuesto: ${parseFloat(proyecto.informacion_tecnica.presupuesto).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={proyecto.status_id}
                            onChange={(e) => handleEstadoChange(proyecto.project_id, parseInt(e.target.value))}
                            disabled={loading}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${proyectosService.getEstadoColor(proyecto.status_id)}`}
                          >
                            <option value={1}>Activo</option>
                            <option value={2}>Desactivo</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(proyecto)}
                              className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                              title="Editar proyecto"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginación */}
          {paginacion.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Mostrando {((paginacion.current_page - 1) * paginacion.per_page) + 1} a {Math.min(paginacion.current_page * paginacion.per_page, paginacion.total)} de {paginacion.total} proyectos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => cambiarPagina(paginacion.current_page - 1)}
                  disabled={paginacion.current_page === 1}
                  className="px-3 py-1 rounded border border-text-disabled/30 disabled:opacity-50 hover:bg-accent-primary/10"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-text-secondary">
                  Página {paginacion.current_page} de {paginacion.last_page}
                </span>
                <button
                  onClick={() => cambiarPagina(paginacion.current_page + 1)}
                  disabled={paginacion.current_page === paginacion.last_page}
                  className="px-3 py-1 rounded border border-text-disabled/30 disabled:opacity-50 hover:bg-accent-primary/10"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Proyecto"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary">Fecha de Inicio</label>
            <input
              type="date"
              value={editForm.start_date}
              onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Fecha Estimada de Fin</label>
            <input
              type="date"
              value={editForm.estimated_end_date}
              onChange={e => setEditForm(f => ({ ...f, estimated_end_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Presupuesto</label>
            <input
              type="number"
              value={editForm.budget}
              onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="0.00"
              className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Dirección de Instalación</label>
            <input
              type="text"
              value={editForm.installation_address}
              onChange={e => setEditForm(f => ({ ...f, installation_address: e.target.value }))}
              placeholder="Dirección específica de instalación"
              className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Notas</label>
            <textarea
              value={editForm.notes}
              onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              rows="3"
              placeholder="Notas adicionales del proyecto"
              className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
            />
          </div>
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
              disabled={loading}
              className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Proyecto"
      >
        <div className="p-4 text-center">
          <p className="text-text-secondary mb-4">
            Los proyectos se crean automáticamente cuando una cotización cambia su estado a "Contratada".
          </p>
          <p className="text-sm text-text-disabled">
            Si necesitas crear un proyecto manualmente, contacta al administrador del sistema.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="mt-4 rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
          >
            Entendido
          </button>
        </div>
      </Modal>

      {/* Mensajes de notificación */}
      {mensajes.map((mensaje, index) => (
        <div
          key={index}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg transition-all duration-300 ${
            mensaje.tipo === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <span className="flex-1">{mensaje.contenido}</span>
          <button
            onClick={() => {
              setMensajes((prev) => prev.filter((_, i) => i !== index));
            }}
            className="ml-2 rounded-full p-1 hover:bg-white/20 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Proyectos;