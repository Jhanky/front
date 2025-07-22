import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdInfo, MdSearch, MdEdit, MdRemoveRedEye } from "react-icons/md";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";

const Proyectos = () => {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ fecha_inicio: "", fecha_fin: "" });

  // Obtener proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) throw new Error("No hay token de autenticación");
      const response = await fetch("http://localhost:3000/api/projects", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setProyectos(data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
    // eslint-disable-next-line
  }, []);

  // Mostrar detalles extendidos del proyecto
  const handleInfo = async (proyecto) => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) throw new Error("No hay token de autenticación");
      const id = proyecto.id || proyecto.proyecto_id || proyecto._id || proyecto.id_proyecto || proyecto.nombre_proyecto;
      const response = await fetch(`http://localhost:3000/api/projects/${id}/detail`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error("Error al obtener detalles del proyecto");
      const data = await response.json();
      setSelectedProyecto(data);
      setIsInfoModalOpen(true);
    } catch (error) {
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const filteredProyectos = proyectos.filter(p =>
    p.nombre_proyecto?.toLowerCase().includes(search.toLowerCase()) ||
    p.estado?.toLowerCase().includes(search.toLowerCase())
  );

  // Estados posibles para proyectos
  const estadosProyecto = [
    { value: "activo", label: "Activo" },
    { value: "finalizado", label: "Finalizado" },
    { value: "pendiente", label: "Pendiente" }
  ];

  // Cambiar estado del proyecto
  const handleEstadoChange = async (proyecto, nuevoEstado) => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) throw new Error("No hay token de autenticación");
      const id = proyecto.id || proyecto.proyecto_id || proyecto._id || proyecto.id_proyecto || proyecto.nombre_proyecto;
      const response = await fetch(`http://localhost:3000/api/projects/${id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nuevoEstado })
      });
      if (!response.ok) throw new Error("Error al actualizar el estado del proyecto");
      setMensajes([{ contenido: "Estado actualizado exitosamente", tipo: "success" }]);
      fetchProyectos();
    } catch (error) {
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición
  const handleEdit = (proyecto) => {
    setSelectedProyecto(proyecto);
    setEditForm({
      fecha_inicio: proyecto.fecha_inicio || "",
      fecha_fin: proyecto.fecha_fin || ""
    });
    setIsEditModalOpen(true);
  };

  // Guardar cambios de fechas
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) throw new Error("No hay token de autenticación");
      const id = selectedProyecto.id || selectedProyecto.proyecto_id || selectedProyecto._id || selectedProyecto.id_proyecto || selectedProyecto.nombre_proyecto;
      const response = await fetch(`http://localhost:3000/api/projects/${id}/dates`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ start_date: editForm.fecha_inicio, end_date: editForm.fecha_fin })
      });
      if (!response.ok) throw new Error("Error al actualizar las fechas del proyecto");
      setMensajes([{ contenido: "Fechas actualizadas exitosamente", tipo: "success" }]);
      setIsEditModalOpen(false);
      fetchProyectos();
    } catch (error) {
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <Mensaje contenido={error} tipo="error" />
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
              Proyectos
            </h1>
          </div>
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o estado..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-green-500 focus:outline-none"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Buscar
              </button>
            </form>
          </div>
          {/* Tabla de proyectos */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Potencia (kWp)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Paneles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Inversores</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Baterías</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Valor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Inicio</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fin</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProyectos.map((proyecto, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-800">{proyecto.nombre_proyecto}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proyecto.potencia}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {proyecto.paneles && Object.entries(proyecto.paneles).map(([marca, cantidad]) => (
                        <div key={marca}>{marca}: {cantidad}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {proyecto.inversores && Object.entries(proyecto.inversores).map(([marca, cantidad]) => (
                        <div key={marca}>{marca}: {cantidad}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {proyecto.baterias && Object.entries(proyecto.baterias).map(([marca, cantidad]) => (
                        <div key={marca}>{marca}: {cantidad}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">${formatNumber(proyecto.valor_proyecto)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proyecto.fecha_inicio}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proyecto.fecha_fin}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <select
                        className="rounded-full px-2 py-1 text-xs font-semibold border focus:outline-none"
                        value={proyecto.estado}
                        onChange={e => handleEstadoChange(proyecto, e.target.value)}
                      >
                        {estadosProyecto.map(e => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <button
                        onClick={() => handleInfo(proyecto)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <MdInfo className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(proyecto)}
                        className="ml-2 text-green-600 hover:text-green-700"
                        title="Editar fechas"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Información */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Información del Proyecto"
      >
        <div className="p-4">
          {selectedProyecto && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Nombre:</h3>
                <p>{selectedProyecto.nombre_proyecto}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Estado:</h3>
                <p>{selectedProyecto.estado}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Fechas:</h3>
                <p>Inicio: {selectedProyecto.fecha_inicio}</p>
                <p>Fin: {selectedProyecto.fecha_fin}</p>
                <p>Días estimados: {selectedProyecto.dias_estimados}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Cliente:</h3>
                {selectedProyecto.cliente && (
                  <ul className="ml-4 text-sm text-gray-700">
                    <li><b>Nombre:</b> {selectedProyecto.cliente.name}</li>
                    <li><b>Tipo:</b> {selectedProyecto.cliente.client_type}</li>
                    <li><b>NIC:</b> {selectedProyecto.cliente.nic}</li>
                    <li><b>Departamento:</b> {selectedProyecto.cliente.department}</li>
                    <li><b>Ciudad:</b> {selectedProyecto.cliente.city}</li>
                    <li><b>Dirección:</b> {selectedProyecto.cliente.address}</li>
                    <li><b>Consumo mensual:</b> {selectedProyecto.cliente.monthly_consumption_kwh} kWh</li>
                    <li><b>Tarifa energía:</b> {selectedProyecto.cliente.energy_rate} COP/kWh</li>
                    <li><b>Tipo de red:</b> {selectedProyecto.cliente.network_type}</li>
                  </ul>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Productos:</h3>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Tipo</th>
                      <th className="border px-2 py-1">Marca</th>
                      <th className="border px-2 py-1 text-center">Cantidad</th>
                      <th className="border px-2 py-1 text-center">Potencia</th>
                      <th className="border px-2 py-1 text-center">Capacidad</th>
                      <th className="border px-2 py-1 text-center">Voltaje</th>
                      <th className="border px-2 py-1 text-center">Ficha técnica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProyecto.productos && selectedProyecto.productos.map((prod, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{prod.tipo}</td>
                        <td className="border px-2 py-1">{prod.marca}</td>
                        <td className="border px-2 py-1 text-center">{prod.cantidad}</td>
                        <td className="border px-2 py-1 text-center">
                          {prod.potencia !== undefined ? (
                            prod.tipo === "panel"
                              ? prod.potencia + " W"
                              : prod.tipo === "inverter"
                                ? prod.potencia + " kW"
                                : prod.potencia
                          ) : "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {prod.capacidad !== undefined ? prod.capacidad + (prod.tipo === "battery" ? " Ah" : "") : "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {prod.voltaje !== undefined ? prod.voltaje + (prod.tipo === "battery" ? " V" : "") : "-"}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {prod.ficha_tecnica ? (
                            <a href={`http://localhost:3000${prod.ficha_tecnica}`} target="_blank" rel="noopener noreferrer" title="Ver ficha técnica">
                              <MdRemoveRedEye className="inline-block text-blue-600 hover:text-blue-800 w-5 h-5" />
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsInfoModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Edición de Fechas */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Fechas del Proyecto"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
            <input
              type="date"
              value={editForm.fecha_inicio}
              onChange={e => setEditForm(f => ({ ...f, fecha_inicio: e.target.value }))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
            <input
              type="date"
              value={editForm.fecha_fin}
              onChange={e => setEditForm(f => ({ ...f, fecha_fin: e.target.value }))}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
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
              Guardar
            </button>
          </div>
        </form>
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