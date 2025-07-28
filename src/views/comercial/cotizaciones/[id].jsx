import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Card from "components/card";
import Loading from "components/loading";
import Mensaje from "components/mensaje";
import { MdArrowBack } from "react-icons/md";
import Modal from "components/modal";

const DetalleCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await fetch(`http://localhost:3000/api/cotizaciones/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener los detalles de la cotización");
        }

        const data = await response.json();
        setCotizacion(data);
      } catch (error) {
        console.error("Error al obtener detalles:", error);
        setError(error.message);
        setMensajes([{
          contenido: error.message,
          tipo: "error"
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchCotizacion();
  }, [id, user?.token]);

  // Cargar estados posibles al abrir modal
  useEffect(() => {
    if (isEditModalOpen) {
      fetch("http://localhost:3000/api/quotation-statuses")
        .then(res => res.json())
        .then(setStatuses)
        .catch(() => setStatuses([]));
    }
  }, [isEditModalOpen]);

  // Preparar datos para edición
  const handleEdit = () => {
    setFormData({
      nombre_proyecto: cotizacion.nombre_proyecto,
      tipo_sistema: cotizacion.tipo_sistema,
      potencia_kwp: cotizacion.potencia_kwp,
      numero_paneles: cotizacion.numero_paneles,
      status_id: cotizacion.status_id,
      productos: cotizacion.productos.map(p => ({ ...p })),
      items: cotizacion.items.map(i => ({ ...i })),
      // Agrega aquí otros campos editables si es necesario
    });
    setIsEditModalOpen(true);
    setEditError(null);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar cambios en productos/items
  const handleArrayChange = (type, idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((el, i) => i === idx ? { ...el, [field]: value } : el)
    }));
  };

  // Guardar cambios
  const handleSave = async () => {
    setSaving(true);
    setEditError(null);
    try {
      const token = user?.token;
      if (!token) throw new Error("No autenticado");
      const body = {
        ...formData,
        status_id: parseInt(formData.status_id),
        productos: formData.productos.map(p => ({
          ...p,
          cantidad: parseInt(p.cantidad),
          precio_unitario: parseFloat(p.precio_unitario),
          porcentaje_ganancia: parseFloat(p.porcentaje_ganancia || p.profit_percentage || 0.25)
        })),
        items: formData.items.map(i => ({
          ...i,
          cantidad: parseInt(i.cantidad),
          precio_unitario: parseFloat(i.precio_unitario),
          porcentaje_ganancia: parseFloat(i.porcentaje_ganancia || i.profit_percentage || 0.2)
        }))
      };
      const res = await fetch(`http://localhost:3000/api/cotizaciones/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al guardar cambios");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (e) {
      setEditError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="mt-3">
        <Mensaje mensajes={mensajes} />
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="mt-3">
        <Mensaje mensajes={[{
          contenido: "No se encontró la cotización",
          tipo: "error"
        }]} />
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => navigate('/admin/cotizaciones')}
          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
        >
          <MdArrowBack className="h-5 w-5" />
          Volver
        </button>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-yellow-700 hover:bg-yellow-200"
        >
          Editar
        </button>
      </div>

      <Card extra="w-full p-4">
        <div className="space-y-8">
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Cotización #{cotizacion.id_cotizacion}
              </h1>
              <p className="text-gray-600">
                Creada el {formatDate(cotizacion.fecha_creacion)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatNumber(cotizacion.valor_total)}
              </p>
            </div>
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Información del Proyecto</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nombre del Proyecto</p>
                  <p className="font-medium">{cotizacion.nombre_proyecto}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Sistema</p>
                  <p className="font-medium">{cotizacion.tipo_sistema}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Potencia (kWp)</p>
                  <p className="font-medium">{cotizacion.potencia_kwp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Número de Paneles</p>
                  <p className="font-medium">{cotizacion.numero_paneles}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Información del Cliente</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{cotizacion.Cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ciudad</p>
                  <p className="font-medium">{cotizacion.Cliente.ciudad}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendedor</p>
                  <p className="font-medium">{cotizacion.Usuario.nombre}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Productos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Tipo</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Cantidad</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Precio Unitario</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Valor Parcial</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Ganancia</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizacion.productos.map((producto) => (
                    <tr key={producto.id} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-sm">{producto.tipo_producto}</td>
                      <td className="px-4 py-2 text-sm">{producto.cantidad}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(producto.precio_unitario)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(producto.valor_parcial)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(producto.ganancia)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(producto.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Items */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Items Adicionales</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Descripción</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Cantidad</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Unidad</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Precio Unitario</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Valor Parcial</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Ganancia</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cotizacion.items.map((item) => (
                    <tr key={item.id_item} className="border-b border-gray-200">
                      <td className="px-4 py-2 text-sm">{item.descripcion}</td>
                      <td className="px-4 py-2 text-sm">{item.cantidad}</td>
                      <td className="px-4 py-2 text-sm">{item.unidad}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(item.precio_unitario)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(item.valor_parcial)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(item.ganancia)}</td>
                      <td className="px-4 py-2 text-sm">{formatNumber(item.valor_total_item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de Costos */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Resumen de Costos</h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatNumber(cotizacion.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal 2</span>
                  <span className="font-medium">{formatNumber(cotizacion.subtotal2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal 3</span>
                  <span className="font-medium">{formatNumber(cotizacion.subtotal3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilidad</span>
                  <span className="font-medium">{formatNumber(cotizacion.utilidad)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA Utilidad</span>
                  <span className="font-medium">{formatNumber(cotizacion.iva_utilidad)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gestión Comercial</span>
                  <span className="font-medium">{formatNumber(cotizacion.gestion_comercial)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Administración</span>
                  <span className="font-medium">{formatNumber(cotizacion.administracion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Imprevistos</span>
                  <span className="font-medium">{formatNumber(cotizacion.imprevistos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retenciones</span>
                  <span className="font-medium">{formatNumber(cotizacion.retenciones)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-lg font-semibold text-gray-800">Valor Total</span>
                  <span className="text-lg font-bold text-gray-800">{formatNumber(cotizacion.valor_total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Modal de edición */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Cotización">
        {formData && (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-medium">Nombre del Proyecto</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={formData.nombre_proyecto} onChange={e => handleFormChange('nombre_proyecto', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo de Sistema</label>
              <input type="text" className="w-full border rounded px-2 py-1" value={formData.tipo_sistema} onChange={e => handleFormChange('tipo_sistema', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Potencia (kWp)</label>
              <input type="number" className="w-full border rounded px-2 py-1" value={formData.potencia_kwp} onChange={e => handleFormChange('potencia_kwp', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Número de Paneles</label>
              <input type="number" className="w-full border rounded px-2 py-1" value={formData.numero_paneles} onChange={e => handleFormChange('numero_paneles', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Estado</label>
              <select className="w-full border rounded px-2 py-1" value={formData.status_id} onChange={e => handleFormChange('status_id', e.target.value)}>
                {statuses.map(s => (
                  <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Productos</label>
              {formData.productos.map((p, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" className="border rounded px-2 py-1" value={p.tipo_producto} onChange={e => handleArrayChange('productos', idx, 'tipo_producto', e.target.value)} placeholder="Tipo" />
                  <input type="number" className="border rounded px-2 py-1" value={p.cantidad} onChange={e => handleArrayChange('productos', idx, 'cantidad', e.target.value)} placeholder="Cantidad" />
                  <input type="number" className="border rounded px-2 py-1" value={p.precio_unitario} onChange={e => handleArrayChange('productos', idx, 'precio_unitario', e.target.value)} placeholder="Precio Unitario" />
                  <input type="number" step="0.01" className="border rounded px-2 py-1" value={p.porcentaje_ganancia || p.profit_percentage || 0.25} onChange={e => handleArrayChange('productos', idx, 'porcentaje_ganancia', e.target.value)} placeholder="% Ganancia" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium">Items</label>
              {formData.items.map((i, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input type="text" className="border rounded px-2 py-1" value={i.descripcion} onChange={e => handleArrayChange('items', idx, 'descripcion', e.target.value)} placeholder="Descripción" />
                  <input type="text" className="border rounded px-2 py-1" value={i.tipo_item || i.item_type} onChange={e => handleArrayChange('items', idx, 'tipo_item', e.target.value)} placeholder="Tipo" />
                  <input type="number" className="border rounded px-2 py-1" value={i.cantidad} onChange={e => handleArrayChange('items', idx, 'cantidad', e.target.value)} placeholder="Cantidad" />
                  <input type="text" className="border rounded px-2 py-1" value={i.unidad || i.unit} onChange={e => handleArrayChange('items', idx, 'unidad', e.target.value)} placeholder="Unidad" />
                  <input type="number" className="border rounded px-2 py-1" value={i.precio_unitario} onChange={e => handleArrayChange('items', idx, 'precio_unitario', e.target.value)} placeholder="Precio Unitario" />
                  <input type="number" step="0.01" className="border rounded px-2 py-1" value={i.porcentaje_ganancia || i.profit_percentage || 0.2} onChange={e => handleArrayChange('items', idx, 'porcentaje_ganancia', e.target.value)} placeholder="% Ganancia" />
                </div>
              ))}
            </div>
            {editError && <div className="text-red-600">{editError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setIsEditModalOpen(false)} disabled={saving}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DetalleCotizacion; 