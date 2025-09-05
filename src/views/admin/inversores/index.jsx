import { getApiUrl, getTechnicalSheetUrl } from '../../../config/api';
import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdCloudUpload, MdSearch, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";

const Inversores = () => {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInversor, setSelectedInversor] = useState(null);
  const [inversores, setInversores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  // Cambios de estado inicial
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    power: "",
    system_type: "",
    grid_type: "Monofásica 110V",
    price: "",
    technical_sheet: null
  });
  const [inverterInfo, setInverterInfo] = useState(null);

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("marca");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [limit] = useState(10);
  
  // Nuevos filtros
  const [systemTypeFilter, setSystemTypeFilter] = useState("");
  const [gridTypeFilter, setGridTypeFilter] = useState("");

  useEffect(() => {
    fetchInverters();
  }, [currentPage, searchTerm, sortField, sortOrder, systemTypeFilter, gridTypeFilter]);

  // Cambia fetchInversores a fetchInverters
  const fetchInverters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit,
        search: searchTerm,
        sort: sortField,
        order: sortOrder,
        ...(systemTypeFilter && { system_type: systemTypeFilter }),
        ...(gridTypeFilter && { grid_type: gridTypeFilter })
      });
      const response = await fetch(getApiUrl(`/api/inverters?${queryParams}`), {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
  if (!response.ok) throw new Error("Error al cargar los inversores");
  const data = await response.json();
  setInversores(Array.isArray(data.data?.data) ? data.data.data : []);
  setTotalPages(data.data?.last_page || 1);
    } catch (err) {
      setError("Error al cargar los inversores: " + err.message);
      setInversores([]);
    } finally {
      setLoading(false);
    }
  };

  const getFichaTecnicaUrl = (url) => {
  return getTechnicalSheetUrl(url);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInverters();
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  // handleCreate y handleEdit usan los nuevos campos
  const handleCreate = () => {
    setFormData({
      brand: "",
      model: "",
      power: "",
      system_type: "",
      grid_type: "Monofásica 110V",
      price: "",
      technical_sheet: null
    });
    setIsCreateModalOpen(true);
  };
  const handleEdit = (inverter) => {
    setSelectedInversor(inverter);
    setFormData({
      brand: inverter.brand,
      model: inverter.model,
      power: inverter.power,
      system_type: inverter.system_type || "",
      grid_type: inverter.grid_type,
      price: inverter.price,
      technical_sheet: null
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (inverter) => {
    setSelectedInversor(inverter);
    setIsDeleteModalOpen(true);
  };

  // handleFileChange validando PDF
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 10 * 1024 * 1024) {
          setFormData(prev => ({ ...prev, technical_sheet: file }));
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

  // handleSubmit usando los campos correctos y FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensajes([]);

    try {
      if (!formData.brand || !formData.model || !formData.power || !formData.grid_type || !formData.price) {
        throw new Error("Todos los campos son obligatorios excepto la ficha técnica y system type");
      }
      const url = isEditModalOpen
        ? getApiUrl(`/api/inverters/${selectedInversor.inverter_id}`)
        : getApiUrl('/api/inverters');

      let response, data;
      if (formData.technical_sheet) {
        // Si hay archivo, usar FormData
        const formDataToSend = new FormData();
        formDataToSend.append("brand", formData.brand.trim());
        formDataToSend.append("model", formData.model.trim());
        formDataToSend.append("power", Number(formData.power));
        formDataToSend.append("grid_type", formData.grid_type);
        formDataToSend.append("price", formData.price);
        if (formData.system_type) formDataToSend.append("system_type", formData.system_type);
        formDataToSend.append("technical_sheet", formData.technical_sheet);
        response = await fetch(url, {
          method: isEditModalOpen ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${user.token}`
          },
          body: formDataToSend
        });
      } else {
        // Si no hay archivo, enviar JSON (PUT)
        const inverterData = {
          brand: formData.brand.trim(),
          model: formData.model.trim(),
          power: Number(formData.power),
          grid_type: formData.grid_type,
          price: formData.price,
        };
        if (formData.system_type) inverterData.system_type = formData.system_type;
        if (isEditModalOpen && selectedInversor?.technical_sheet_url !== undefined) {
          inverterData.technical_sheet_url = selectedInversor.technical_sheet_url;
        }
        response = await fetch(url, {
          method: isEditModalOpen ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(inverterData)
        });
      }
      data = await response.json();
      if (!response.ok) {
        throw new Error(data.mensaje || (isEditModalOpen ? "Error al actualizar el inversor" : "Error al registrar el inversor"));
      }

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: isEditModalOpen ? "Inversor actualizado exitosamente" : "Inversor registrado exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      await fetchInverters();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        brand: "",
        model: "",
        power: "",
        system_type: "",
        grid_type: "Monofásica 110V",
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
      const response = await fetch(getApiUrl(`/api/inverters/${selectedInversor.inverter_id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.mensaje || "Error al eliminar el inversor");
      }

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Inversor eliminado exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      await fetchInverters();
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

  // Modal de información detallada
  const handleInfo = async (inverter) => {
    setSelectedInversor(inverter);
    setIsInfoModalOpen(true);
    try {
      const response = await fetch(getApiUrl(`/api/inverters/${inverter.inverter_id}`), {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error("No se pudo obtener la información detallada del inversor");
      const data = await response.json();
      setInverterInfo(data);
    } catch (err) {
      setError("Error al obtener información detallada del inversor");
      setMensajes([{
        contenido: "Error al obtener información detallada del inversor",
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
        <Card extra="w-full h-full px-8 pb-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-text-primary">
              Inversores
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              Agregar Inversor
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
                  className="w-full rounded-lg border border-text-disabled/30 pl-10 pr-4 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
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
          </div>

          {/* Filtros */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tipo de Sistema
              </label>
              <select
                value={systemTypeFilter}
                onChange={(e) => setSystemTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
              >
                <option value="">Todos los tipos</option>
                <option value="Interconectado">Interconectado</option>
                <option value="Aislado">Aislado</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tipo de Red
              </label>
              <select
                value={gridTypeFilter}
                onChange={(e) => setGridTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
              >
                <option value="">Todos los tipos</option>
                <option value="Monofásica 110V">Monofásica 110V</option>
                <option value="Bifásico 220V">Bifásico 220V</option>
                <option value="Trifásico 220V">Trifásico 220V</option>
                <option value="Trifásico 440V">Trifásico 440V</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSystemTypeFilter("");
                  setGridTypeFilter("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg bg-text-disabled px-4 py-2 text-white hover:bg-text-disabled/80 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>



          {/* Tabla de inversores */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary-card">
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("marca")}
                  >
                    <div className="flex items-center gap-1">
                      Marca
                      {sortField === "marca" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("modelo")}
                  >
                    <div className="flex items-center gap-1">
                      Modelo
                      {sortField === "modelo" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("potencia")}
                  >
                    <div className="flex items-center gap-1">
                      Potencia (kW)
                      {sortField === "potencia" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("system_type")}
                  >
                    <div className="flex items-center gap-1">
                      Tipo de Sistema
                      {sortField === "system_type" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("tipo_red")}
                  >
                    <div className="flex items-center gap-1">
                      Tipo de Red
                      {sortField === "tipo_red" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("precio")}
                  >
                    <div className="flex items-center gap-1">
                      Precio (USD)
                      {sortField === "precio" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Ficha Técnica</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-center text-sm text-text-secondary">
                      Cargando...
                    </td>
                  </tr>
                ) : !inversores || inversores.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-3 text-center text-sm text-text-secondary">
                      No se encontraron inversores
                    </td>
                  </tr>
                ) : (
                  inversores.map((inverter) => (
                    <tr key={inverter.inverter_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{inverter.brand}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{inverter.model}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{inverter.power}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{inverter.system_type}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{inverter.grid_type}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">${Number(inverter.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {inverter.technical_sheet_url && (
                          <a
                            href={getFichaTecnicaUrl(inverter.technical_sheet_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary hover:text-accent-hover transition-colors"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleInfo(inverter)}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(inverter)}
                            className="text-accent-primary hover:text-accent-hover transition-colors"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inverter)}
                            className="text-red-500 hover:text-red-400 transition-colors"
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
              <div className="text-sm text-text-secondary">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 disabled:opacity-50 transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 disabled:opacity-50 transition-colors"
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
        title={isEditModalOpen ? "Editar Inversor" : "Agregar Nuevo Inversor"}
      >
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Marca*
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: SMA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Modelo*
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: Sunny Boy 5.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Potencia (kW)*
              </label>
              <input
                type="number"
                name="power"
                value={formData.power}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: 5.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Tipo de Sistema
              </label>
              <select
                name="system_type"
                value={formData.system_type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
              >
                <option value="">Seleccionar tipo de sistema</option>
                <option value="Interconectado">Interconectado</option>
                <option value="Aislado">Aislado</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Tipo de Red*
              </label>
              <select
                name="grid_type"
                value={formData.grid_type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
              >
                <option value="Monofásica 110V">Monofásica 110V</option>
                <option value="Bifásica 220V">Bifásica 220V</option>
                <option value="Trifásica 220V">Trifásica 220V</option>
                <option value="Trifásica 440V">Trifásica 440V</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
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
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: 1200.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Ficha Técnica (PDF)
              </label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-text-disabled/30 px-6 py-10 bg-primary-card">
                <div className="text-center">
                  <MdCloudUpload className="mx-auto h-12 w-12 text-text-disabled" />
                  <div className="mt-4 flex text-sm leading-6 text-text-secondary">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-primary-card font-semibold text-accent-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-offset-2 hover:text-accent-hover transition-colors"
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
                  <p className="text-xs leading-5 text-text-secondary">
                    Solo archivos PDF hasta 10MB
                  </p>
                </div>
              </div>
              {formData.technical_sheet && (
                <p className="mt-2 text-sm text-text-secondary">
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
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
        title="Eliminar Inversor"
      >
        <div className="p-4">
          <p className="text-text-secondary">
            ¿Está seguro que desea eliminar el inversor {selectedInversor?.model}?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-400 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Información */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setInverterInfo(null);
        }}
        title="Información del Inversor"
      >
        <div className="p-4">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-text-primary">Datos del Inversor</h3>
              {inverterInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Marca</p>
                    <p className="text-sm text-text-primary">{inverterInfo.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Modelo</p>
                    <p className="text-sm text-text-primary">{inverterInfo.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Potencia</p>
                    <p className="text-sm text-text-primary">{inverterInfo.power} kW</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipo de sistema</p>
                    <p className="text-sm text-text-primary">{inverterInfo.system_type || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipo de red</p>
                    <p className="text-sm text-text-primary">{inverterInfo.grid_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Precio</p>
                    <p className="text-sm text-text-primary">${Number(inverterInfo.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Ficha Técnica</p>
                    {inverterInfo.technical_sheet_url ? (
                      <a
                        href={getTechnicalSheetUrl(inverterInfo.technical_sheet_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:text-accent-hover underline transition-colors"
                      >
                        Ver PDF
                      </a>
                    ) : (
                      <p className="text-sm text-text-disabled">No disponible</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-text-secondary">Cargando información...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsInfoModalOpen(false);
                  setInverterInfo(null);
                }}
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
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

export default Inversores;