import React from 'react';
import { MdClose, MdReceipt, MdAttachMoney, MdCalendarToday, MdBusiness } from 'react-icons/md';

const ProjectInvoicesModal = ({ isOpen, onClose, project, invoices, loading = false }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' COP';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Usar el total_gastado del proyecto en lugar de calcular desde las facturas
  const totalAmount = project?.total_gastado || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MdReceipt className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Facturas del Proyecto
              </h2>
              <p className="text-sm text-gray-600">{project?.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MdClose className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Project Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MdBusiness className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Proyecto</p>
                <p className="font-medium text-gray-800">{project?.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MdAttachMoney className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Total Gastado</p>
                <p className="font-medium text-gray-800">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MdReceipt className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Total Facturas</p>
                <p className="font-medium text-gray-800">{invoices?.length || 0}</p>
              </div>
            </div>
          </div>
          {project?.descripcion && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="text-gray-800">{project.descripcion}</p>
            </div>
          )}
        </div>

        {/* Invoices Table */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando facturas...</span>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Número</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Proveedor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Monto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Método de Pago</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{invoice.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{invoice.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{formatCurrency(invoice.monto)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(invoice.estado)}`}>
                          {invoice.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{invoice.metodo_pago}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {new Date(invoice.fecha).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MdReceipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay facturas registradas para este proyecto</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInvoicesModal; 