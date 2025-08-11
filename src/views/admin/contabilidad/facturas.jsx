import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { MdOutlineCalendarToday, MdAdd, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getApiUrl, API_CONFIG } from "config/api";
import { useAuth } from "context/AuthContext";
import Modal from "components/modal";
import Loading from "components/loading";

const Facturas = () => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    date: "",
    total_amount: "",
    payment_method: "",
    status: "",
    description: "",
    supplier_id: "",
    cost_center_id: "",
    project_id: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const selectRef = React.useRef(null);

  const meses = [
    { value: "", label: "Todos los meses" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const handleCalendarChange = (date) => {
    setSelectedMonth((date.getMonth() + 1).toString().padStart(2, '0'));
    setSelectedYear(date.getFullYear().toString());
    setCalendarOpen(false);
  };

  const facturasFiltradas = useMemo(() => {
    if (!selectedMonth && !selectedYear) return facturas;
    return facturas.filter(f => {
      if (!f.date) return false;
      const fecha = new Date(f.date);
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear().toString();
      const mesOk = selectedMonth ? mes === selectedMonth : true;
      const anioOk = selectedYear ? anio === selectedYear : true;
      return mesOk && anioOk;
    });
  }, [facturas, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      setError("");
      try {
        const storedUser = localStorage.getItem('user');
        let token = null;
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token;
          } catch (e) {}
        }
        if (!token) throw new Error('No se encontró token de autorización');
        const response = await fetch(getApiUrl('/api/purchases'), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        setFacturas(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFacturas();
  }, []);

  const handleView = (factura) => {
    setSelectedFactura(factura);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFactura(null);
  };

  const fetchFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PURCHASES), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las facturas");
      }

      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      setFacturas(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreate = () => {
    setFormData({
      invoice_number: "",
      date: "",
      total_amount: "",
      payment_method: "",
      status: "",
      description: "",
      supplier_id: "",
      cost_center_id: "",
      project_id: ""
    });
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleEdit = (factura) => {
    setSelectedFactura(factura);
    setFormData({
      invoice_number: factura.invoice_number || "",
      date: factura.date ? factura.date.split('T')[0] : "",
      total_amount: factura.total_amount || "",
      payment_method: factura.payment_method || "",
      status: factura.status || "",
      description: factura.description || "",
      supplier_id: factura.supplier_id || "",
      cost_center_id: factura.cost_center_id || "",
      project_id: factura.project_id || ""
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleDelete = (factura) => {
    setSelectedFactura(factura);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!formData.invoice_number || !formData.date || !formData.total_amount) {
        throw new Error("Por favor complete los campos obligatorios");
      }

      const url = selectedFactura 
        ? getApiUrl(`${API_CONFIG.ENDPOINTS.PURCHASES}/${selectedFactura.id}`)
        : getApiUrl(API_CONFIG.ENDPOINTS.PURCHASES);
      
      const method = selectedFactura ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${selectedFactura ? 'actualizar' : 'crear'} la factura`);
      }

      const facturaData = await response.json();

      // Actualización dinámica del estado local
      if (selectedFactura) {
        setFacturas(prev => prev.map(factura => 
          factura.id === selectedFactura.id ? facturaData : factura
        ));
      } else {
        setFacturas(prev => [...prev, facturaData]);
      }

      const successMessage = selectedFactura 
        ? `Factura "${formData.invoice_number}" actualizada exitosamente`
        : `Factura "${formData.invoice_number}" creada exitosamente`;
      showNotification(successMessage, "success");

      // Cerrar modal
      if (selectedFactura) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PURCHASES}/${selectedFactura.id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la factura");
      }

      // Actualización dinámica del estado local
      setFacturas(prev => prev.filter(factura => factura.id !== selectedFactura.id));

      showNotification(`Factura "${selectedFactura.invoice_number}" eliminada exitosamente`, "success");

      setIsDeleteModalOpen(false);
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="mt-3">
      <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white py-4">Facturas</h1>
        <div className="flex items-center gap-4 mb-4">
          <button
            className="linear flex items-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80"
            onClick={() => setCalendarOpen(true)}
            type="button"
          >
            <MdOutlineCalendarToday />
            <span className="text-sm font-medium text-gray-600">Filtrar por mes y año</span>
            {selectedMonth && selectedYear && (
              <span className="ml-2 text-xs text-brand-500">{`${selectedYear}-${selectedMonth}`}</span>
            )}
          </button>
          {(selectedMonth || selectedYear) && (
            <button
              className="ml-2 text-xs text-red-500 underline"
              onClick={() => { setSelectedMonth(""); setSelectedYear(""); }}
              type="button"
            >
              Limpiar filtro
            </button>
          )}
        </div>
        {calendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 relative">
              <button onClick={() => setCalendarOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
              <Calendar
                onChange={handleCalendarChange}
                value={selectedYear && selectedMonth ? new Date(`${selectedYear}-${selectedMonth}-01`) : new Date()}
                view="year"
                onClickMonth={handleCalendarChange}
                maxDetail="year"
                minDetail="decade"
                locale="es-ES"
              />
              <div className="text-xs text-gray-500 mt-2">Selecciona un mes y año</div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Número</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Monto Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Proyecto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-6">No hay facturas registradas.</td></tr>
              ) : (
                facturasFiltradas.map((factura) => (
                  <tr key={factura.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{factura.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.date ? new Date(factura.date).toLocaleDateString('es-CO') : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{factura.total_amount ? factura.total_amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.supplier?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.project?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <button onClick={() => handleView(factura)} className="text-blue-600 hover:text-blue-800 underline" title="Ver detalles">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 inline">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C2.25 12 5.25 6.75 12 6.75C18.75 6.75 21.75 12 21.75 12C21.75 12 18.75 17.25 12 17.25C5.25 17.25 2.25 12 2.25 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de detalles */}
      {showModal && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">Detalles de la Factura</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Información de la Factura</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Número:</span> {selectedFactura.invoice_number}</div>
                  <div><span className="font-semibold">Fecha:</span> {selectedFactura.date ? new Date(selectedFactura.date).toLocaleDateString('es-CO') : ''}</div>
                  <div><span className="font-semibold">Monto Total:</span> {selectedFactura.total_amount ? selectedFactura.total_amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : ''}</div>
                  <div><span className="font-semibold">Estado:</span> {selectedFactura.status}</div>
                  <div><span className="font-semibold">Método de Pago:</span> {selectedFactura.payment_method || 'N/A'}</div>
                  <div><span className="font-semibold">Descripción:</span> {selectedFactura.description || 'N/A'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Centro de Costos</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Código:</span> {selectedFactura.cost_center?.code || 'N/A'}</div>
                  <div><span className="font-semibold">Nombre:</span> {selectedFactura.cost_center?.name || 'N/A'}</div>
                  <div><span className="font-semibold">Descripción:</span> {selectedFactura.cost_center?.description || 'N/A'}</div>
                  <div><span className="font-semibold">Estado:</span> {selectedFactura.cost_center?.status || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Información del Proveedor</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Nombre:</span> {selectedFactura.supplier?.name || 'N/A'}</div>
                  <div><span className="font-semibold">NIT:</span> {selectedFactura.supplier?.tax_id || 'N/A'}</div>
                  <div><span className="font-semibold">Dirección:</span> {selectedFactura.supplier?.address || 'N/A'}</div>
                  <div><span className="font-semibold">Teléfono:</span> {selectedFactura.supplier?.phone || 'N/A'}</div>
                  <div><span className="font-semibold">Email:</span> {selectedFactura.supplier?.email || 'N/A'}</div>
                  <div><span className="font-semibold">Contacto:</span> {selectedFactura.supplier?.contact_name || 'N/A'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Información del Proyecto</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Código:</span> {selectedFactura.project?.code || 'N/A'}</div>
                  <div><span className="font-semibold">Nombre:</span> {selectedFactura.project?.name || 'N/A'}</div>
                  <div><span className="font-semibold">Estado:</span> {selectedFactura.project?.status || 'N/A'}</div>
                  <div><span className="font-semibold">Fecha de Inicio:</span> {selectedFactura.project?.start_date ? new Date(selectedFactura.project.start_date).toLocaleDateString('es-CO') : 'N/A'}</div>
                  <div><span className="font-semibold">Fecha de Fin:</span> {selectedFactura.project?.end_date ? new Date(selectedFactura.project.end_date).toLocaleDateString('es-CO') : 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Usuario Responsable</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Nombre:</span> {selectedFactura.user?.name || 'N/A'}</div>
                  <div><span className="font-semibold">Email:</span> {selectedFactura.user?.email || 'N/A'}</div>
                  <div><span className="font-semibold">Teléfono:</span> {selectedFactura.user?.phone || 'N/A'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-gray-700">Fechas del Sistema</div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Creado:</span> {selectedFactura.created_at ? new Date(selectedFactura.created_at).toLocaleDateString('es-CO') : 'N/A'}</div>
                  <div><span className="font-semibold">Actualizado:</span> {selectedFactura.updated_at ? new Date(selectedFactura.updated_at).toLocaleDateString('es-CO') : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;