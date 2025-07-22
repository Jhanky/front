import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { MdOutlineCalendarToday } from "react-icons/md";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
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
        const response = await fetch(`${API_BASE_URL}/api/purchases`, {
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

  if (loading) return <div className="p-8 text-center">Cargando facturas...</div>;
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
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.Supplier?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{factura.Project?.name || 'N/A'}</td>
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div><span className="font-semibold">Número:</span> {selectedFactura.invoice_number}</div>
                <div><span className="font-semibold">Fecha:</span> {selectedFactura.date ? new Date(selectedFactura.date).toLocaleDateString('es-CO') : ''}</div>
                <div><span className="font-semibold">Monto Total:</span> {selectedFactura.total_amount ? selectedFactura.total_amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : ''}</div>
                <div><span className="font-semibold">Estado:</span> {selectedFactura.status}</div>
                <div><span className="font-semibold">Método de Pago:</span> {selectedFactura.payment_method || 'N/A'}</div>
                <div><span className="font-semibold">Descripción:</span> {selectedFactura.description || 'N/A'}</div>
              </div>
              <div>
                <div className="font-semibold mb-1">Proveedor</div>
                <div><span className="font-semibold">Nombre:</span> {selectedFactura.Supplier?.name || 'N/A'}</div>
                <div><span className="font-semibold">NIT:</span> {selectedFactura.Supplier?.tax_id || 'N/A'}</div>
                <div><span className="font-semibold">Dirección:</span> {selectedFactura.Supplier?.address || 'N/A'}</div>
                <div><span className="font-semibold">Teléfono:</span> {selectedFactura.Supplier?.phone || 'N/A'}</div>
                <div><span className="font-semibold">Email:</span> {selectedFactura.Supplier?.email || 'N/A'}</div>
                <div><span className="font-semibold">Contacto:</span> {selectedFactura.Supplier?.contact_name || 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="font-semibold mb-1">Proyecto</div>
                <div><span className="font-semibold">Código:</span> {selectedFactura.Project?.code || 'N/A'}</div>
                <div><span className="font-semibold">Nombre:</span> {selectedFactura.Project?.name || 'N/A'}</div>
                <div><span className="font-semibold">Descripción:</span> {selectedFactura.Project?.description || 'N/A'}</div>
                <div><span className="font-semibold">Estado:</span> {selectedFactura.Project?.status || 'N/A'}</div>
              </div>
              <div>
                <div className="font-semibold mb-1">Centro de Costos</div>
                <div><span className="font-semibold">Código:</span> {selectedFactura.CostCenter?.code || 'N/A'}</div>
                <div><span className="font-semibold">Nombre:</span> {selectedFactura.CostCenter?.name || 'N/A'}</div>
                <div><span className="font-semibold">Descripción:</span> {selectedFactura.CostCenter?.description || 'N/A'}</div>
                <div><span className="font-semibold">Estado:</span> {selectedFactura.CostCenter?.status || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Usuario Responsable</div>
              <div><span className="font-semibold">Usuario:</span> {selectedFactura.User?.username || 'N/A'}</div>
              <div><span className="font-semibold">Rol:</span> {selectedFactura.User?.role || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="font-semibold mb-1">Fechas</div>
                <div><span className="font-semibold">Creado:</span> {selectedFactura.created_at ? new Date(selectedFactura.created_at).toLocaleDateString('es-CO') : 'N/A'}</div>
                <div><span className="font-semibold">Actualizado:</span> {selectedFactura.updated_at ? new Date(selectedFactura.updated_at).toLocaleDateString('es-CO') : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas; 