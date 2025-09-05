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
        return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'Pendiente':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30';
      case 'Cancelado':
        return 'bg-red-900/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  // Usar el total_gastado del proyecto en lugar de calcular desde las facturas
  const totalAmount = project?.total_gastado || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-primary-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent-primary/20 rounded-lg">
              <MdReceipt className="h-6 w-6 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Facturas del Proyecto
              </h2>
              <p className="text-sm text-text-secondary">{project?.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        {/* Project Info */}
        <div className="p-6 bg-gray-800/30 border-b border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MdBusiness className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Proyecto</p>
                <p className="font-medium text-text-primary">{project?.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MdAttachMoney className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Total Gastado</p>
                <p className="font-medium text-text-primary">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MdReceipt className="h-5 w-5 text-text-secondary" />
              <div>
                <p className="text-sm text-text-secondary">Total Facturas</p>
                <p className="font-medium text-text-primary">{invoices?.length || 0}</p>
              </div>
            </div>
          </div>
          {project?.descripcion && (
            <div className="mt-4">
              <p className="text-sm text-text-secondary">Descripción</p>
              <p className="text-text-primary">{project.descripcion}</p>
            </div>
          )}
        </div>

        {/* Invoices Table */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
              <span className="ml-3 text-text-secondary">Cargando facturas...</span>
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50 bg-gray-800/30">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Número</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Proveedor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Monto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Método de Pago</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-700/30 hover:bg-accent-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{invoice.numero}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{invoice.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{formatCurrency(invoice.monto)}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(invoice.estado)}`}>
                          {invoice.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{invoice.metodo_pago}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {new Date(invoice.fecha).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MdReceipt className="h-12 w-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No hay facturas registradas para este proyecto</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInvoicesModal; 