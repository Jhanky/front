import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdCancel } from 'react-icons/md';
import { catalogosService } from 'services/catalogosService';

const EditFacturaModal = ({ isOpen, onClose, factura, onUpdate }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    date: '',
    total_amount: '',
    payment_method: '',
    status: '',
    description: '',
    supplier_id: '',
    cost_center_id: '',
    project_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proveedores, setProveedores] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Opciones para los selectores
  const paymentMethods = [
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Crédito', label: 'Crédito' }
  ];

  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Pagado', label: 'Pagado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  // Cargar catálogos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setLoadingCatalogos(true);
      Promise.all([
        catalogosService.getProveedores(),
        catalogosService.getCentrosCosto(),
        catalogosService.getProyectos()
      ]).then(([proveedores, centros, proyectos]) => {
        setProveedores(proveedores);
        setCentrosCosto(centros);
        setProyectos(proyectos);
      }).catch((err) => {
        setError('Error al cargar catálogos');
      }).finally(() => setLoadingCatalogos(false));
    }
  }, [isOpen]);

  // Cargar datos de la factura cuando se abre el modal
  useEffect(() => {
    if (factura && isOpen) {
      setFormData({
        invoice_number: factura.invoice_number || '',
        date: factura.date ? factura.date.split('T')[0] : '',
        total_amount: factura.total_amount || '',
        payment_method: factura.payment_method || '',
        status: factura.status || '',
        description: factura.description || '',
        supplier_id: factura.supplier_id || factura.Supplier?.id || '',
        cost_center_id: factura.cost_center_id || factura.CostCenter?.id || '',
        project_id: factura.project_id || factura.Project?.id || ''
      });
      setError('');
    }
  }, [factura, isOpen]);

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
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.invoice_number || !formData.date || !formData.total_amount) {
        throw new Error('Los campos Número de Factura, Fecha y Monto Total son obligatorios');
      }

      // Validar que el monto sea un número válido
      if (isNaN(formData.total_amount) || parseFloat(formData.total_amount) <= 0) {
        throw new Error('El monto total debe ser un número válido mayor a 0');
      }

      // Preparar datos para enviar
      const updateData = {
        invoice_number: formData.invoice_number,
        date: formData.date,
        total_amount: parseFloat(formData.total_amount),
        payment_method: formData.payment_method,
        status: formData.status,
        description: formData.description,
        supplier_id: parseInt(formData.supplier_id) || null,
        cost_center_id: parseInt(formData.cost_center_id) || null,
        project_id: parseInt(formData.project_id) || null
      };

      // Llamar a la función de actualización
      await onUpdate(factura.id, updateData);
      
      // Cerrar modal
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      invoice_number: '',
      date: '',
      total_amount: '',
      payment_method: '',
      status: '',
      description: '',
      supplier_id: '',
      cost_center_id: '',
      project_id: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdSave className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Editar Factura
              </h2>
              <p className="text-sm text-gray-600">{factura?.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {loadingCatalogos ? (
            <div className="text-center py-8 text-gray-600">Cargando catálogos...</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Principal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información Principal
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Factura *
                </label>
                <input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto Total *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar método de pago</option>
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar estado</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información Adicional
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de la factura..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(prov => (
                    <option key={prov.id} value={prov.id}>{prov.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Centro de Costos
                </label>
                <select
                  name="cost_center_id"
                  value={formData.cost_center_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar centro de costos</option>
                  {centrosCosto.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proyecto
                </label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar proyecto</option>
                  {proyectos.map(proj => (
                    <option key={proj.id} value={proj.id}>{proj.nombre || proj.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <MdCancel className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <MdSave className="h-4 w-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFacturaModal; 