import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdCloudUpload, MdSearch, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { getApiUrl, getTechnicalSheetUrl } from '../../../config/api';

const Paneles = async () => {
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
      
      if (!response.ok) throw new Error("Error al cargar los paneles");
      
      const data = await response.json();
      setPaneles(Array.isArray(data) ? data : []);
      setTotalPages(1); // Por ahora, ya que la API no devuelve paginación
    } catch (err) {
      setError("Error al cargar los paneles: " + err.message);
      setPaneles([]);
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

  const handleEdit = (panel) => {
    setSelectedPanel(panel);
    setFormData({
      marca: panel.brand,
      modelo: panel.model,
      potencia: panel.power,
      tipo: panel.type,
      precio: panel.price,
      ficha_tecnica: null
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (panel) => {
    setSelectedPanel(panel);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 10 * 1024 * 1024) { // 10MB
          setFormData(prev => ({
            ...prev,
            ficha_tecnica: file
          }));
          setError("");
        } else {
          setError("El archivo no debe superar los 10MB");
          setMensajes([{
            contenido: "El archivo no debe superar los 10MB",
            tipo: "error"
          }]);
          
          // Limpiar mensaje después de 2 segundos
          setTimeout(() => {
            setMensajes([]);
          }, 2000);
        }
      } else {
        setError("Solo se permiten archivos PDF");
        setMensajes([{
          contenido: "Solo se permiten archivos PDF",
          tipo: "error"
        }]);
        
        // Limpiar mensaje después de 2 segundos
        setTimeout(() => {
          setMensajes([]);
        }, 2000);
      }
    }
  };

  const formatPrice = (value) => {
    // Eliminar todo excepto números
    const numbers = value.replace(/\D/g, "");
    // Formatear con separadores de miles
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formatted;
  };

  const handlePriceChange = (e) => {
    const formattedValue = formatPrice(e.target.value);
    setFormData(prev => ({
      ...prev,
      precio: formattedValue
    }));
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
        formDataToSend.append("price", Number(formData.precio.replace(/\./g, "")));
        formDataToSend.append("technical_sheet", formData.ficha_tecnica);

      const url = isEditModalOpen
          ? `http://localhost:3000/api/panels/${selectedPanel.panel_id}`
          : "http://localhost:3000/api/panels";

        console.log("=== ENVIANDO CON ARCHIVO ===");
        console.log("URL:", url);
        console.log("Método:", isEditModalOpen ? "PUT" : "POST");
        console.log("Datos del formulario:", formData);
        console.log("Archivo:", formData.ficha_tecnica);
        console.log("FormData entries:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`  ${key}:`, value);
        }

        console.log("Token de autorización:", user.token);
        
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

        console.log("=== RESPUESTA DEL SERVIDOR ===");
        console.log("Status de respuesta:", response.status);
        console.log("Status text:", response.statusText);
        console.log("Headers de respuesta:");
        for (let [key, value] of response.headers.entries()) {
          console.log(`  ${key}: ${value}`);
        }

        // Verificar si la respuesta es JSON válido
        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);
        
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("=== RESPUESTA NO ES JSON ===");
          console.error("Content-Type recibido:", contentType);
          console.error("Respuesta completa:", textResponse);
          console.error("Primeros 500 caracteres:", textResponse.substring(0, 500));
          throw new Error("El servidor devolvió una respuesta inválida. Verifica que el servidor esté funcionando correctamente.");
        }

      const data = await response.json();
        console.log("=== RESPUESTA JSON ===");
        console.log("Respuesta con archivo:", data);

      if (!response.ok) {
          console.error("Error en respuesta:", response.status, data);
          throw new Error(data.mensaje || (isEditModalOpen ? "Error al actualizar el panel" : "Error al registrar el panel"));
        }
      } else {
        // Usar JSON para datos sin archivo
        const panelData = {
          brand: formData.marca.trim(),
          model: formData.modelo.trim(),
          power: Number(formData.potencia),
          type: formData.tipo,
          price: Number(formData.precio.replace(/\./g, ""))
        };

        const url = isEditModalOpen
          ? `http://localhost:3000/api/panels/${selectedPanel.panel_id}`
          : "http://localhost:3000/api/panels";

        console.log("Enviando sin archivo:", url);
        console.log("Datos del formulario:", formData);
        console.log("Panel data:", panelData);

        console.log("Token de autorización:", user.token);
        
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

        console.log("Status de respuesta:", response.status);
        console.log("Headers de respuesta:", response.headers);

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
      const response = await fetch(`http://localhost:3000/api/panels/${selectedPanel.panel_id}`, {
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
      const response = await fetch(`http://localhost:3000/api/panels/${panel.panel_id}`, {
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

  // Reemplazar todas las URLs hardcodeadas con:
  const response = await fetch(getApiUrl(`/api/panels?${queryParams}`), {
    headers: {
      Authorization: `Bearer ${user.token}`
    }
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
              Paneles Solares
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
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
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
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
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
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
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
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
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
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
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-800 cursor-pointer"
                    onClick={() => handleSort("precio")}
                  >
                    <div className="flex items-center gap-1">
                      Precio (COP)
                      {sortField === "precio" && (
                        sortOrder === "ASC" ? <MdArrowUpward /> : <MdArrowDownward />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Ficha Técnica</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!filteredPaneles || filteredPaneles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-3 text-center text-sm text-gray-500">
                      No se encontraron paneles
                    </td>
                  </tr>
                ) : (
                  filteredPaneles.map((panel) => (
                    <tr key={panel.panel_id} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">{panel.brand}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{panel.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{panel.power}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{panel.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">${Number(panel.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {panel.technical_sheet_url && (
                          <a
                            href={getFichaTecnicaUrl(panel.technical_sheet_url)}
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
                            onClick={() => handleInfo(panel)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <MdVisibility className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(panel)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <MdEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(panel)}
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
        title={isEditModalOpen ? "Editar Panel" : "Agregar Nuevo Panel"}
      >
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Marca*
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: SunPower"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Modelo*
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: X-Series X22-360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: 360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo*
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="Monocristalino">Monocristalino</option>
                <option value="Policristalino">Policristalino</option>
                <option value="Thin Film">Thin Film</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Ej: 250.00"
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
                        name="ficha_tecnica"
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
              {formData.ficha_tecnica && (
                <p className="mt-2 text-sm text-gray-500">
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
        title="Eliminar Panel"
      >
        <div className="p-4">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar el panel {selectedPanel?.modelo}?
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
        onClose={() => {
          setIsInfoModalOpen(false);
          setPanelInfo(null);
        }}
        title="Información del Panel"
      >
        <div className="p-4">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Datos del Panel</h3>
              {panelInfo ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Marca</p>
                    <p className="text-sm text-gray-800">{panelInfo.brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Modelo</p>
                    <p className="text-sm text-gray-800">{panelInfo.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Potencia</p>
                    <p className="text-sm text-gray-800">{panelInfo.power} W</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo</p>
                    <p className="text-sm text-gray-800">{panelInfo.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Precio</p>
                    <p className="text-sm text-gray-800">${Number(panelInfo.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Ficha Técnica</p>
                    {panelInfo.technical_sheet_url ? (
                    <a
                        href={getTechnicalSheetUrl(panelInfo.technical_sheet_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Ver PDF
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No disponible</p>
                  )}
                </div>
              </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Cargando información...</p>
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
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
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