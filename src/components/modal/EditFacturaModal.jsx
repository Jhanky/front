import React, { useState, useEffect } from 'react';
import { MdClose, MdSave, MdCancel } from 'react-icons/md';
import { catalogosService } from 'services/catalogosService';

const EditFacturaModal = ({ isOpen, onClose, factura, onUpdate }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    date: '',
    due_date: '',
    subtotal: '',
    iva_amount: '',
    retention: '',
    total_amount: '',
    payment_method: '',
    status: '',
    sale_type: '',
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
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'PAGADA', label: 'Pagada' }
  ];

  const saleTypeOptions = [
    { value: 'CONTADO', label: 'Contado' },
    { value: 'CREDITO', label: 'Crédito' }
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
        due_date: factura.due_date ? factura.due_date.split('T')[0] : '',
        subtotal: factura.subtotal || '',
        iva_amount: factura.iva_amount || '',
        retention: factura.retention || '',
        total_amount: factura.total_amount || '',
        payment_method: factura.payment_method || '',
        status: factura.status || '',
        sale_type: factura.sale_type || '',
        description: factura.description || '',
        supplier_id: factura.supplier_id || factura.Supplier?.id || '',
        cost_center_id: factura.cost_center_id || factura.CostCenter?.id || '',
        project_id: factura.project_id || factura.Project?.id || ''
      });
      setError('');
    }
  }, [factura, isOpen]);

  // Función para calcular IVA automáticamente (19%)
  const calculateIVA = (subtotal) => {
    if (!subtotal || isNaN(subtotal)) return 0;
    return parseFloat(subtotal) * 0.19;
  };

  // Función para calcular total automáticamente
  const calculateTotal = (subtotal, iva, retention = 0) => {
    if (!subtotal || isNaN(subtotal)) return 0;
    const subtotalNum = parseFloat(subtotal);
    const ivaNum = iva || calculateIVA(subtotal);
    const retentionNum = parseFloat(retention) || 0;
    return subtotalNum + ivaNum - retentionNum;
  };

  // Función para manejar cambios en el subtotal
  const handleSubtotalChange = (value) => {
    const subtotal = parseFloat(value) || 0;
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal, iva, formData.retention);
    
    setFormData(prev => ({
      ...prev,
      subtotal: value,
      iva_amount: iva.toFixed(2),
      total_amount: total.toFixed(2)
    }));
  };

  // Función para manejar cambios en la retención
  const handleRetentionChange = (value) => {
    const retention = parseFloat(value) || 0;
    const subtotal = parseFloat(formData.subtotal) || 0;
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal, iva, retention);
    
    setFormData(prev => ({
      ...prev,
      retention: value,
      total_amount: total.toFixed(2)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subtotal') {
      handleSubtotalChange(value);
    } else if (name === 'retention') {
      handleRetentionChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.invoice_number || !formData.date || !formData.subtotal) {
        throw new Error('Los campos Número de Factura, Fecha y Subtotal son obligatorios');
      }

      // Validar que el subtotal sea un número válido
      if (isNaN(formData.subtotal) || parseFloat(formData.subtotal) <= 0) {
        throw new Error('El subtotal debe ser un número válido mayor a 0');
      }

      // Preparar datos para enviar
      const updateData = {
        invoice_number: formData.invoice_number,
        date: formData.date,
        due_date: formData.due_date,
        subtotal: parseFloat(formData.subtotal),
        iva_amount: parseFloat(formData.iva_amount) || 0,
        retention: parseFloat(formData.retention) || 0,
        total_amount: parseFloat(formData.total_amount),
        payment_method: formData.payment_method,
        status: formData.status,
        sale_type: formData.sale_type,
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
      due_date: '',
      subtotal: '',
      iva_amount: '',
      retention: '',
      total_amount: '',
      payment_method: '',
      status: '',
      sale_type: '',
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
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Venta
                </label>
                <select
                  name="sale_type"
                  value={formData.sale_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo de venta</option>
                  {saleTypeOptions.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
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

            {/* Información Financiera */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Información Financiera
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal *
                  </label>
                  <input
                    type="number"
                    name="subtotal"
                    value={formData.subtotal}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IVA (19%)
                  </label>
                  <input
                    type="number"
                    name="iva_amount"
                    value={formData.iva_amount}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retención
                  </label>
                  <input
                    type="number"
                    name="retention"
                    value={formData.retention}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold"
                  step="0.01"
                />
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