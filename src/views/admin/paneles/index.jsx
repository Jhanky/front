// Handlers deben ir dentro del componente Paneles para acceder a los hooks
import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdCloudUpload, MdSearch, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { getApiUrl, getTechnicalSheetUrl } from '../../../config/api';

// Formatea el precio con separador de miles y símbolo $
const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value.toString().replace(/[^\d]/g, ""));
  if (isNaN(num) || num === 0) return "";
  return `$ ${num.toLocaleString("es-CO")}`;
};

// Devuelve el número limpio para enviar al backend
const parsePrice = (value) => {
  if (!value) return 0;
  return Number(value.toString().replace(/[^\d]/g, ""));
};

const Paneles = () => {
  // Handlers para editar, eliminar y cambio de archivo
  const handleEdit = (panel) => {
    setSelectedPanel(panel);
    setFormData({
      marca: panel.brand || "",
      modelo: panel.model || "",
      potencia: panel.power || "",
      tipo: panel.type || "Monocristalino",
      precio: panel.price ? panel.price.toString() : "",
      ficha_tecnica: null // No se carga archivo existente
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (panel) => {
    setSelectedPanel(panel);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, ficha_tecnica: file }));
  };
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [panelInfo, setPanelInfo] = useState(null);
  const [paneles, setPaneles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    potencia: "",
    tipo: "Monocristalino",
    precio: "",
    ficha_tecnica: null
  });

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("marca");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [limit] = useState(10);

  // Cargar paneles al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchPaneles();
  }, [currentPage, searchTerm, sortField, sortOrder]);

  const fetchPaneles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit,
        search: searchTerm,
        sort: sortField,
        order: sortOrder
      });

      const response = await fetch(getApiUrl(`/api/panels?${queryParams}`), {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setPaneles(Array.isArray(data.data?.data) ? data.data.data : []);
      setTotalPages(data.data?.last_page || 1);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Resetear a la primera página al buscar
    fetchPaneles();
  };

  // Función para filtrar paneles localmente por marca o modelo
  const filteredPaneles = paneles.filter(panel => 
    panel.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    panel.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (field) => {
    // Mapear los campos de la interfaz a los campos del backend
    const fieldMapping = {
      marca: "brand",
      modelo: "model", 
      potencia: "power",
      tipo: "type",
      precio: "price"
    };
    
    const backendField = fieldMapping[field] || field;
    
    if (backendField === sortField) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(backendField);
      setSortOrder("ASC");
    }
  };

  const handleCreate = () => {
    setFormData({
      marca: "",
      modelo: "",
      potencia: "",
      tipo: "Monocristalino",
      precio: "",
      ficha_tecnica: null
    });
    setIsCreateModalOpen(true);
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
      // Validar campos obligatorios
      if (!formData.marca || !formData.modelo || !formData.potencia || !formData.tipo || !formData.precio) {
        throw new Error("Todos los campos son obligatorios excepto la ficha técnica");
      }

      // Validar que los valores numéricos sean válidos
      if (isNaN(Number(formData.potencia)) || Number(formData.potencia) <= 0) {
        throw new Error("La potencia debe ser un número válido mayor a 0");
      }

      if (isNaN(Number(formData.precio.replace(/\./g, ""))) || Number(formData.precio.replace(/\./g, "")) <= 0) {
        throw new Error("El precio debe ser un número válido mayor a 0");
      }

      // Si hay un archivo, usar FormData, sino usar JSON
      if (formData.ficha_tecnica) {
        // Usar FormData para subir archivo
        const formDataToSend = new FormData();
        
        // Verificar que el archivo sea válido
        if (!formData.ficha_tecnica || !(formData.ficha_tecnica instanceof File)) {
          throw new Error("El archivo no es válido");
        }
        
        // Verificar el tamaño del archivo (máximo 10MB)
        if (formData.ficha_tecnica.size > 10 * 1024 * 1024) {
          throw new Error("El archivo es demasiado grande. Máximo 10MB");
        }
        
        // Verificar el tipo de archivo
        if (formData.ficha_tecnica.type !== "application/pdf") {
          throw new Error("Solo se permiten archivos PDF");
      }
        
  formDataToSend.append("brand", formData.marca.trim());
  formDataToSend.append("model", formData.modelo.trim());
  formDataToSend.append("power", Number(formData.potencia));
  formDataToSend.append("type", formData.tipo);
  formDataToSend.append("price", parsePrice(formData.precio));
  formDataToSend.append("technical_sheet", formData.ficha_tecnica);

      const url = isEditModalOpen
        ? getApiUrl(`/api/panels/${selectedPanel.panel_id}`)
        : getApiUrl('/api/panels');


        
        // Verificar que el token existe
        if (!user.token) {
          throw new Error("No hay token de autorización. Por favor, inicia sesión nuevamente.");
        }

      const response = await fetch(url, {
        method: isEditModalOpen ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${user.token}`
            // NO establecer Content-Type manualmente para FormData
        },
        body: formDataToSend
      });

        // Verificar si la respuesta es JSON válido
        const contentType = response.headers.get("content-type");
        
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("=== RESPUESTA NO ES JSON ===");
          console.error("Content-Type recibido:", contentType);
          console.error("Respuesta completa:", textResponse);
          console.error("Primeros 500 caracteres:", textResponse.substring(0, 500));
          throw new Error("El servidor devolvió una respuesta inválida. Verifica que el servidor esté funcionando correctamente.");
        }

      const data = await response.json();

      if (!response.ok) {
          console.error("Error en respuesta:", response.status, data);
          throw new Error(data.mensaje || (isEditModalOpen ? "Error al actualizar el panel" : "Error al registrar el panel"));
        }
      } else {
        // Usar JSON para datos sin archivo

        // Si es edición, incluir technical_sheet_url si existe
        const panelData = {
          brand: formData.marca.trim(),
          model: formData.modelo.trim(),
          power: Number(formData.potencia),
          type: formData.tipo,
          price: parsePrice(formData.precio)
        };
        if (isEditModalOpen && selectedPanel?.technical_sheet_url) {
          panelData.technical_sheet_url = selectedPanel.technical_sheet_url;
        }

        const url = isEditModalOpen
          ? getApiUrl(`/api/panels/${selectedPanel.panel_id}`)
          : getApiUrl('/api/panels');


        
        // Verificar que el token existe
        if (!user.token) {
          throw new Error("No hay token de autorización. Por favor, inicia sesión nuevamente.");
        }
        
        const response = await fetch(url, {
          method: isEditModalOpen ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(panelData)
        });



        // Verificar si la respuesta es JSON válido
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Respuesta no es JSON:", textResponse);
          throw new Error("El servidor devolvió una respuesta inválida. Verifica que el servidor esté funcionando correctamente.");
        }

        const data = await response.json();
        console.log("Respuesta sin archivo:", data);

        if (!response.ok) {
          console.error("Error en respuesta:", response.status, data);
        throw new Error(data.mensaje || (isEditModalOpen ? "Error al actualizar el panel" : "Error al registrar el panel"));
        }
      }

      await fetchPaneles();
      
      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: isEditModalOpen ? "Panel actualizado exitosamente" : "Panel registrado exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({
        marca: "",
        modelo: "",
        potencia: "",
        tipo: "Monocristalino",
        precio: "",
        ficha_tecnica: null
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
      const response = await fetch(getApiUrl(`/api/panels/${selectedPanel.panel_id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error("Error al eliminar el panel");

      await fetchPaneles();
      
      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Panel eliminado exitosamente",
        tipo: "success"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError("Error al eliminar el panel: " + err.message);
      setMensajes([{
        contenido: "Error al eliminar el panel: " + err.message,
        tipo: "error"
      }]);
      
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    }
  };

  const handleInfo = async (panel) => {
    setSelectedPanel(panel);
    setIsInfoModalOpen(true);
    
    try {
      // Obtener información detallada del panel
      const response = await fetch(getApiUrl(`/api/panels/${panel.panel_id}`), {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("No se pudo obtener la información detallada del panel");
      }
      
      const data = await response.json();
      setPanelInfo(data);
    } catch (err) {
      console.error("Error al obtener información del panel:", err);
      setMensajes([{
        contenido: "Error al obtener información detallada del panel",
        tipo: "error"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    }
  };

  const getFichaTecnicaUrl = (url) => {
    return getTechnicalSheetUrl(url);
  };

  if (loading && !error) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <Loading />
        <span className="text-text-secondary">Cargando paneles...</span>
      </div>
    );
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
              Paneles Solares
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              Agregar Panel
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

          {/* Tabla de paneles */}
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
                      Potencia (W)
                      {sortField === "potencia" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("tipo")}
                  >
                    <div className="flex items-center gap-1">
                      Tipo
                      {sortField === "tipo" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-text-primary cursor-pointer hover:text-accent-primary transition-colors"
                    onClick={() => handleSort("precio")}
                  >
                    <div className="flex items-center gap-1">
                      Precio (COP)
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
                {!filteredPaneles || filteredPaneles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-3 text-center text-sm text-text-secondary">
                      No se encontraron paneles
                    </td>
                  </tr>
                ) : (
                  filteredPaneles.map((panel) => (
                    <tr key={panel.panel_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{panel.brand}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{panel.model}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{panel.power}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{panel.type}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{formatPrice(panel.price)}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {panel.technical_sheet_url && (
                          <a
                            href={getFichaTecnicaUrl(panel.technical_sheet_url)}
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
                            onClick={() => handleInfo(panel)}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(panel)}
                            className="text-accent-primary hover:text-accent-hover transition-colors"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(panel)}
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
        title={isEditModalOpen ? "Editar Panel" : "Agregar Nuevo Panel"}
      >
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Marca*
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: SunPower"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Modelo*
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: X-Series X22-360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Potencia (W)*
              </label>
              <input
                type="number"
                name="potencia"
                value={formData.potencia}
                onChange={handleInputChange}
                required
                min="0"
                step="1"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: 360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Tipo*
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
              >
                <option value="Monocristalino">Monocristalino</option>
                <option value="Policristalino">Policristalino</option>
                <option value="Thin Film">Thin Film</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Precio (USD)*
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                placeholder="Ej: 250.00"
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
                        name="ficha_tecnica"
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
              {formData.ficha_tecnica && (
                <p className="mt-2 text-sm text-text-secondary">
                  Archivo seleccionado: {formData.ficha_tecnica.name}
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
                {loading
                  ? (isEditModalOpen
                      ? "Actualizando..."
                      : "Creando...")
                  : isEditModalOpen
                    ? "Guardar Cambios"
                    : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Panel"
      >
        <div className="p-4">
          <p className="text-text-secondary">
            ¿Está seguro que desea eliminar el panel {selectedPanel?.modelo}?
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
                disabled={loading}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-400 disabled:opacity-50 transition-colors"
              >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Información */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setPanelInfo(null);
        }}
        title="Información del Panel"
      >
        <div className="p-4">
          <div className="space-y-6">
                          <div>
                <h3 className="mb-4 text-lg font-semibold text-text-primary">Datos del Panel</h3>
              {panelInfo ? (
                              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Marca</p>
                      <p className="text-sm text-text-primary">{panelInfo.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Modelo</p>
                      <p className="text-sm text-text-primary">{panelInfo.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Potencia</p>
                      <p className="text-sm text-text-primary">{panelInfo.power} W</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipo</p>
                      <p className="text-sm text-text-primary">{panelInfo.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Precio</p>
                      <p className="text-sm text-text-primary">${Number(panelInfo.price).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Ficha Técnica</p>
                      {panelInfo.technical_sheet_url ? (
                    <a
                        href={getTechnicalSheetUrl(panelInfo.technical_sheet_url)}
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
                  setPanelInfo(null);
                }}
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Paneles;