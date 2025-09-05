import React, { useState, useEffect } from "react";
import Modal from "components/modal";
import { getApiUrl } from '../../../config/api';
import { cotizacionesService } from '../../../services/cotizacionesService';

const EditCotizacionModal = ({
  isOpen,
  onClose,
  selectedCotizacion,
  paneles,
  inversores,
  fetchCotizaciones,
  setMensajes,
  user
}) => {
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [statusId, setStatusId] = useState("");
  const [panelProduct, setPanelProduct] = useState({ product_id: "", quantity: "" });
  const [inverterProduct, setInverterProduct] = useState({ product_id: "", quantity: "" });
  const [batteryProduct, setBatteryProduct] = useState({ product_id: "", quantity: "" });
  const [baterias, setBaterias] = useState([]);

  // Utilidad para mapear tipos de producto de forma robusta
  function getProductByType(products, type) {
    if (!Array.isArray(products)) return null;
    if (type === "panel") {
      // Buscar por type: 'panel', 'Policristalino', 'Monocristalino', etc.
      return products.find(p => {
        const t = (p.type || p.product_type || "").toString().toLowerCase();
        return ["panel", "policristalino", "monocristalino"].includes(t);
      });
    }
    if (type === "inverter") {
      return products.find(p => ((p.type || p.product_type || "").toString().toLowerCase() === "inverter"));
    }
    if (type === "battery") {
      return products.find(p => ((p.type || p.product_type || "").toString().toLowerCase() === "battery"));
    }
    return null;
  }

  useEffect(() => {
    if (isOpen && selectedCotizacion) {
      setLoading(true);
      Promise.all([
        fetch(getApiUrl("/api/quotation-statuses"), {
          headers: { "Authorization": `Bearer ${user?.token}` }
        }).then(res => res.json()),
        fetch(getApiUrl(`/api/quotations/${selectedCotizacion.id}`), {
          headers: { "Authorization": `Bearer ${user?.token}` }
        }).then(res => res.json()),
        fetch(getApiUrl("/api/batteries"), {
          headers: { "Authorization": `Bearer ${user?.token}` }
        }).then(res => res.json()).then(data => {
          // Extraer las baterías de la estructura de respuesta correcta
          const bateriasData = data.success && data.data && data.data.data ? data.data.data : [];
          return Array.isArray(bateriasData) ? bateriasData : [];
        })
      ]).then(([statusesData, cotizacionData, bateriasData]) => {
        setStatuses(Array.isArray(statusesData) ? statusesData : []);
        setProjectName(cotizacionData.project_name || "");
        setStatusId(cotizacionData.status_id ? cotizacionData.status_id.toString() : "");
        // Panel
        const panel = getProductByType(cotizacionData.products, "panel");
        setPanelProduct({
          product_id: panel ? (panel.id || panel.product_id || "").toString() : "",
          quantity: panel && panel.quantity ? panel.quantity.toString() : ""
        });
        // Inversor
        const inverter = getProductByType(cotizacionData.products, "inverter");
        setInverterProduct({
          product_id: inverter ? (inverter.id || inverter.product_id || "").toString() : "",
          quantity: inverter && inverter.quantity ? inverter.quantity.toString() : ""
        });
        // Batería
        const battery = getProductByType(cotizacionData.products, "battery");
        setBatteryProduct({
          product_id: battery ? (battery.id || battery.product_id || "").toString() : "",
          quantity: battery && battery.quantity ? battery.quantity.toString() : ""
        });
        setBaterias(bateriasData);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, selectedCotizacion]);

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const products = [];
      if (panelProduct.product_id && panelProduct.quantity) {
        const panel = paneles.find(p => p.panel_id === parseInt(panelProduct.product_id));
        products.push({
          product_type: "panel",
          product_id: parseInt(panelProduct.product_id),
          quantity: parseInt(panelProduct.quantity),
          unit_price: panel ? parseFloat(panel.price) : 0,
          profit_percentage: 0.25
        });
      }
      if (inverterProduct.product_id && inverterProduct.quantity) {
        const inverter = inversores.find(i => i.inverter_id === parseInt(inverterProduct.product_id));
        products.push({
          product_type: "inverter",
          product_id: parseInt(inverterProduct.product_id),
          quantity: parseInt(inverterProduct.quantity),
          unit_price: inverter ? parseFloat(inverter.price) : 0,
          profit_percentage: 0.25
        });
      }
      if (batteryProduct.product_id && batteryProduct.quantity) {
        const battery = baterias.find(b => b.battery_id === parseInt(batteryProduct.product_id));
        products.push({
          product_type: "battery",
          product_id: parseInt(batteryProduct.product_id),
          quantity: parseInt(batteryProduct.quantity),
          unit_price: battery ? parseFloat(battery.price) : 0,
          profit_percentage: 0.25
        });
      }

      const updateData = {
        project_name: projectName,
        status_id: parseInt(statusId),
        panel_count: panelProduct.quantity ? parseInt(panelProduct.quantity) : 0,
        used_products: products
      };

      const response = await cotizacionesService.updateCotizacion(selectedCotizacion.quotation_id, updateData, token);
      
      if (response.success) {
        setMensajes([{ contenido: "Cotización editada exitosamente", tipo: "success" }]);
        onClose();
        fetchCotizaciones();
      } else {
        throw new Error(response.message || "Error al guardar cambios");
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cotización">
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSave}>
            <h3 className="text-lg font-semibold text-text-primary">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">Nombre del Proyecto</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={projectName} onChange={e => setProjectName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Estado</label>
                <select className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={statusId} onChange={e => setStatusId(e.target.value)} required>
                  <option value="">Seleccione un estado</option>
                  {Array.isArray(statuses) && statuses.map(s => (
                    <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mt-6">Productos</h3>
            <div className="space-y-4">
              {/* Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-primary-card rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Panel</label>
                  <select className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={panelProduct.product_id} onChange={e => setPanelProduct(p => ({ ...p, product_id: e.target.value }))} required>
                    <option value="">Seleccione un panel</option>
                    {paneles.map(panel => (
                      <option key={panel.panel_id} value={panel.panel_id}>{panel.brand} - {panel.model} - {panel.power}W</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Cantidad de Paneles</label>
                  <input type="number" className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={panelProduct.quantity} onChange={e => setPanelProduct(p => ({ ...p, quantity: e.target.value }))} min="1" required />
                </div>
              </div>
              {/* Inversor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-primary-card rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Inversor</label>
                  <select className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={inverterProduct.product_id} onChange={e => setInverterProduct(p => ({ ...p, product_id: e.target.value }))} required>
                    <option value="">Seleccione un inversor</option>
                    {inversores.map(inverter => (
                      <option key={inverter.inverter_id} value={inverter.inverter_id}>{inverter.brand} - {inverter.model} - {inverter.power}W</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Cantidad de Inversores</label>
                  <input type="number" className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={inverterProduct.quantity} onChange={e => setInverterProduct(p => ({ ...p, quantity: e.target.value }))} min="1" required />
                </div>
              </div>
              {/* Batería */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-primary-card rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Batería</label>
                  <select className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={batteryProduct.product_id} onChange={e => setBatteryProduct(p => ({ ...p, product_id: e.target.value }))}>
                    <option value="">Seleccione una batería (opcional)</option>
                    {baterias.map(bateria => (
                      <option key={bateria.battery_id} value={bateria.battery_id}>{bateria.brand} - {bateria.model} - {bateria.capacity}Ah</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary">Cantidad de Baterías</label>
                  <input type="number" className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary" value={batteryProduct.quantity} onChange={e => setBatteryProduct(p => ({ ...p, quantity: e.target.value }))} min="1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors">
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default EditCotizacionModal;
