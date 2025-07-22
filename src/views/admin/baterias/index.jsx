import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdCloudUpload, MdSearch, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import Logo from "components/logo";

const Baterias = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedBateria, setSelectedBateria] = useState(null);
  const [baterias, setBaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bateriaInfo, setBateriaInfo] = useState(null);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    capacity: "",
    voltage: "",
    type: "Litio",
    price: "",
    technical_sheet: null
  });

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("brand");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [limit] = useState(10);

  useEffect(() => {
    fetchBaterias();
  }, [currentPage, searchTerm, sortField, sortOrder]);

  const fetchBaterias = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit,
        search: searchTerm,
        sort: sortField,
        order: sortOrder
      });

      const response = await fetch(`http://localhost:3000/api/batteries?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) throw new Error("Error al cargar las baterías");
      
      const data = await response.json();
      setBaterias(data.batteries || []);
      setTotalPages(data.pagination?.total_pages || 1);
    } catch (err) {
      setError("Error al cargar las baterías: " + err.message);
      setBaterias([]);
    } finally {
      setLoading(false);
    }
  };

  const getFichaTecnicaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBaterias();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  const handleCreate = () => {
    setFormData({
      brand: "",
      model: "",
      capacity: "",
      voltage: "",
      type: "Litio",
      price: "",
      technical_sheet: null
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (bateria) => {
    setSelectedBateria(bateria);
    setFormData({
      brand: bateria.brand,
      model: bateria.model,
      capacity: bateria.capacity,
      voltage: bateria.voltage,
      type: bateria.type,
      price: bateria.price,
      technical_sheet: null
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (bateria) => {
    setSelectedBateria(bateria);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 10 * 1024 * 1024) {
          setFormData(prev => ({
            ...prev,
            technical_sheet: file
          }));
          setError("");
        } else {
          setError("El archivo no debe superar los 10MB");
        }
      } else {
        setError("Solo se permiten archivos PDF");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensajes([]);

    try {
      // Validar campos obligatorios según la estructura
      if (!formData.brand || !formData.model || !formData.capacity || !formData.voltage || !formData.type || !formData.price) {
        throw new Error("Los campos marca, modelo, capacidad, voltaje, tipo y precio son obligatorios");
      }

      // Convertir los valores numéricos
      const capacity = parseFloat(formData.capacity);
      const voltage = parseFloat(formData.voltage);
      const price = parseFloat(formData.price);

      if (isNaN(capacity) || capacity <= 0) throw new Error("La capacidad debe ser un número positivo");
      if (isNaN(voltage) || voltage <= 0) throw new Error("El voltaje debe ser un número positivo");
      if (isNaN(price) || price <= 0) throw new Error("El precio debe ser un número positivo");

      const formDataToSend = new FormData();
      
      // Agregar los campos al FormData
      formDataToSend.append("brand", formData.brand.trim());
      formDataToSend.append("model", formData.model.trim());
      formDataToSend.append("capacity", capacity.toString());
      formDataToSend.append("voltage", voltage.toString());
      formDataToSend.append("type", formData.type);
      formDataToSend.append("price", price.toString());
      
      // Solo agregar ficha técnica si existe
      if (formData.technical_sheet) {
        formDataToSend.append("technical_sheet", formData.technical_sheet);
      }

      const url = isEditModalOpen
        ? `http://localhost:3000/api/batteries/${selectedBateria.battery_id}`
        : "http://localhost:3000/api/batteries";

      const response = await fetch(url, {
        method: isEditModalOpen ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || (isEditModalOpen ? "Error al actualizar la batería" : "Error al registrar la batería"));
      }

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: isEditModalOpen ? "Batería actualizada exitosamente" : "Batería registrada exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      await fetchBaterias();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        brand: "",
        model: "",
        capacity: "",
        voltage: "",
        type: "Litio",
        price: "",
        technical_sheet: null
      });
    } catch (err) {
      setError(err.message);
      setMensajes([{
        contenido: err.message,
        tipo: "error"
      }]);
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setError("");
    setMensajes([]);
    try {
      const response = await fetch(`http://localhost:3000/api/batteries/${selectedBateria.battery_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || "Error al eliminar la batería");
      }

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Batería eliminada exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      await fetchBaterias();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message);
      setMensajes([{
        contenido: err.message,
        tipo: "error"
      }]);
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    }
  };

  const handleInfo = async (bateria) => {
    setSelectedBateria(bateria);
    setIsInfoModalOpen(true);
    try {
      const response = await fetch(`http://localhost:3000/api/batteries/${bateria.battery_id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error("No se pudo obtener la información detallada de la batería");
      const data = await response.json();
      setBateriaInfo(data);
    } catch (err) {
      setError("Error al obtener información detallada de la batería");
      setMensajes([{
        contenido: "Error al obtener información detallada de la batería",
        tipo: "error"
      }]);
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    }
  };

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
        <Card extra="w-full h-full px-8 pb-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Baterías
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Agregar Batería
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por marca o modelo..."
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Buscar
              </button>
            </form>
          </div>



          {/* Tabla de baterías */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("brand")}
                  >
                    <div className="flex items-center gap-1">
                      Marca
                      {sortField === "brand" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("model")}
                  >
                    <div className="flex items-center gap-1">
                      Modelo
                      {sortField === "model" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("capacity")}
                  >
                    <div className="flex items-center gap-1">
                      Capacidad (Ah)
                      {sortField === "capacity" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("voltage")}
                  >
                    <div className="flex items-center gap-1">
                      Voltaje (V)
                      {sortField === "voltage" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-1">
                      Tipo
                      {sortField === "type" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      Precio (USD)
                      {sortField === "price" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Ficha Técnica</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-center text-sm text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : !baterias || baterias.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-center text-sm text-gray-500">
                      No se encontraron baterías
                    </td>
                  </tr>
                ) : (
                  baterias.map((bateria) => (
                    <tr key={bateria.battery_id} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">{bateria.brand}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{bateria.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{bateria.capacity} Ah</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{bateria.voltage}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{bateria.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">${Number(bateria.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {bateria.technical_sheet_url && (
                          <a
                            href={getFichaTecnicaUrl(bateria.technical_sheet_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInfo(bateria)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(bateria)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(bateria)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? "Editar Batería" : "Agregar Nueva Batería"}
      >
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marca*
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: Tesla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Modelo*
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: Powerwall 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacidad (Ah)*
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Voltaje (V)*
              </label>
              <input
                type="number"
                name="voltage"
                value={formData.voltage}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: 48.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo*
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Litio">Litio</option>
                <option value="Gel">Gel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio (USD)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: 2500.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ficha Técnica (PDF)
              </label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Subir archivo</span>
                      <input
                        id="file-upload"
                        name="technical_sheet"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    Solo archivos PDF hasta 10MB
                  </p>
                </div>
              </div>
              {formData.technical_sheet && (
                <p className="mt-2 text-sm text-gray-500">
                  Archivo seleccionado: {formData.technical_sheet.name}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : isEditModalOpen ? "Guardar Cambios" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Batería"
      >
        <div className="p-4">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar la batería {selectedBateria?.model}?
          </p>
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

      {/* Modal de Información */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Información de la Batería"
      >
        <div className="p-4">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Datos de la Batería</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Marca</p>
                  <p className="text-sm text-gray-800">{bateriaInfo?.brand || selectedBateria?.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Modelo</p>
                  <p className="text-sm text-gray-800">{bateriaInfo?.model || selectedBateria?.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacidad</p>
                  <p className="text-sm text-gray-800">{bateriaInfo?.capacity || selectedBateria?.capacity} Ah</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Voltaje</p>
                  <p className="text-sm text-gray-800">{bateriaInfo?.voltage || selectedBateria?.voltage} V</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo</p>
                  <p className="text-sm text-gray-800">{bateriaInfo?.type || selectedBateria?.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio</p>
                  <p className="text-sm text-gray-800">${Number(bateriaInfo?.price || selectedBateria?.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ficha Técnica</p>
                  {(bateriaInfo?.technical_sheet_url || selectedBateria?.technical_sheet_url) ? (
                    <a
                      href={getFichaTecnicaUrl(bateriaInfo?.technical_sheet_url || selectedBateria?.technical_sheet_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No disponible</p>
                  )}
                </div>
              </div>
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

export default Baterias; 