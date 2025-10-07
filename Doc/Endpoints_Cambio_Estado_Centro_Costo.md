# 🔄 Documentación de Endpoints - Cambio de Estado y Centro de Costo

## 📋 Resumen

Esta documentación explica cómo consumir los endpoints de **cambio de estado** y **cambio de centro de costo** de facturas desde una aplicación React. Estos endpoints permiten modificar dinámicamente el estado de las facturas y reasignar centros de costo sin necesidad de editar toda la factura.

---

## 🎯 **Endpoint 1: Cambio de Estado de Factura**

### **Información General**
- **Método:** `PATCH`
- **URL:** `/api/invoices/{id}/status`
- **Autenticación:** Bearer Token requerido
- **Propósito:** Cambiar el estado de una factura entre `PENDIENTE` y `PAGADA`

### **Parámetros de Request**

| Campo | Tipo | Requerido | Descripción | Valores Permitidos |
|-------|------|-----------|-------------|-------------------|
| `status` | string | ✅ Sí | Nuevo estado de la factura | `PENDIENTE`, `PAGADA` |

### **Ejemplo de Request**

```javascript
// Función para cambiar estado de factura
const changeInvoiceStatus = async (invoiceId, newStatus) => {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        status: newStatus
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Estado actualizado:', data.data);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw error;
  }
};

// Uso de la función
changeInvoiceStatus(123, 'PAGADA');
```

### **Ejemplo de Response (Éxito)**

```json
{
  "success": true,
  "message": "Estado de factura actualizado exitosamente",
  "data": {
    "id": 123,
    "invoice_number": "FAC-2024-001",
    "status": "PAGADA",
    "sale_type": "CONTADO",
    "total_amount": 1500000,
    "subtotal": 1260504,
    "iva_amount": 239496,
    "provider": {
      "id": 1,
      "provider_name": "Proveedor ABC",
      "email": "proveedor@abc.com"
    },
    "costCenter": {
      "id": 2,
      "cost_center_name": "Centro de Costo XYZ",
      "description": "Centro de costo principal"
    },
    "paymentMethod": {
      "id": 1,
      "name": "Transferencia desde cuenta Davivienda E4(TCD)",
      "code": "TCD"
    }
  }
}
```

### **Manejo de Errores**

```javascript
// Manejo completo de errores
const changeInvoiceStatusWithErrorHandling = async (invoiceId, newStatus) => {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error('Factura no encontrada');
        case 422:
          throw new Error(`Error de validación: ${data.errors?.status?.[0] || data.message}`);
        case 500:
          throw new Error(`Error del servidor: ${data.error || data.message}`);
        default:
          throw new Error(data.message || 'Error desconocido');
      }
    }

    return data;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw error;
  }
};
```

---

## 🏢 **Endpoint 2: Cambio de Centro de Costo**

### **Información General**
- **Método:** `PATCH`
- **URL:** `/api/invoices/{id}/cost-center`
- **Autenticación:** Bearer Token requerido
- **Propósito:** Cambiar el centro de costo asignado a una factura

### **Parámetros de Request**

| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| `cost_center_id` | integer | ✅ Sí | ID del nuevo centro de costo | Debe existir en la tabla `cost_centers` |

### **Ejemplo de Request**

```javascript
// Función para cambiar centro de costo
const changeInvoiceCostCenter = async (invoiceId, newCostCenterId) => {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/cost-center`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        cost_center_id: newCostCenterId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Centro de costo actualizado:', data.data);
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al cambiar centro de costo:', error);
    throw error;
  }
};

// Uso de la función
changeInvoiceCostCenter(123, 5);
```

### **Ejemplo de Response (Éxito)**

```json
{
  "success": true,
  "message": "Centro de costo actualizado exitosamente",
  "data": {
    "invoice": {
      "id": 123,
      "invoice_number": "FAC-2024-001",
      "cost_center_id": 5,
      "status": "PENDIENTE",
      "total_amount": 1500000,
      "provider": {
        "id": 1,
        "provider_name": "Proveedor ABC"
      },
      "costCenter": {
        "id": 5,
        "cost_center_name": "Nuevo Centro de Costo",
        "description": "Centro de costo reasignado"
      },
      "paymentMethod": {
        "id": 1,
        "name": "Transferencia desde cuenta Davivienda E4(TCD)"
      }
    },
    "old_cost_center": {
      "id": 2,
      "cost_center_name": "Centro Anterior",
      "description": "Centro de costo original"
    },
    "new_cost_center": {
      "id": 5,
      "cost_center_name": "Nuevo Centro de Costo",
      "description": "Centro de costo reasignado"
    }
  }
}
```

---

## 🎨 **Componente React Completo**

### **Hook Personalizado para Cambio de Estado**

```javascript
// hooks/useInvoiceStatus.js
import { useState } from 'react';

export const useInvoiceStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeStatus = async (invoiceId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeStatus, loading, error };
};
```

### **Hook Personalizado para Cambio de Centro de Costo**

```javascript
// hooks/useInvoiceCostCenter.js
import { useState } from 'react';

export const useInvoiceCostCenter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changeCostCenter = async (invoiceId, newCostCenterId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/cost-center`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cost_center_id: newCostCenterId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar centro de costo');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeCostCenter, loading, error };
};
```

### **Componente de Botones de Acción**

```javascript
// components/InvoiceActions.jsx
import React, { useState } from 'react';
import { useInvoiceStatus } from '../hooks/useInvoiceStatus';
import { useInvoiceCostCenter } from '../hooks/useInvoiceCostCenter';

const InvoiceActions = ({ invoice, onUpdate }) => {
  const [showCostCenterModal, setShowCostCenterModal] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  
  const { changeStatus, loading: statusLoading } = useInvoiceStatus();
  const { changeCostCenter, loading: costCenterLoading } = useInvoiceCostCenter();

  const handleStatusChange = async (newStatus) => {
    try {
      const result = await changeStatus(invoice.id, newStatus);
      onUpdate(result.data);
      alert(`Estado cambiado a: ${newStatus}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCostCenterChange = async () => {
    if (!selectedCostCenter) {
      alert('Selecciona un centro de costo');
      return;
    }

    try {
      const result = await changeCostCenter(invoice.id, selectedCostCenter);
      onUpdate(result.data.invoice);
      setShowCostCenterModal(false);
      alert(`Centro de costo cambiado exitosamente`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="invoice-actions">
      {/* Botones de cambio de estado */}
      <div className="status-buttons">
        <h4>Cambiar Estado:</h4>
        <button
          onClick={() => handleStatusChange('PENDIENTE')}
          disabled={statusLoading || invoice.status === 'PENDIENTE'}
          className={`btn ${invoice.status === 'PENDIENTE' ? 'btn-warning' : 'btn-outline-warning'}`}
        >
          {statusLoading ? 'Cambiando...' : 'Marcar como Pendiente'}
        </button>
        
        <button
          onClick={() => handleStatusChange('PAGADA')}
          disabled={statusLoading || invoice.status === 'PAGADA'}
          className={`btn ${invoice.status === 'PAGADA' ? 'btn-success' : 'btn-outline-success'}`}
        >
          {statusLoading ? 'Cambiando...' : 'Marcar como Pagada'}
        </button>
      </div>

      {/* Botón de cambio de centro de costo */}
      <div className="cost-center-section">
        <h4>Centro de Costo Actual: {invoice.costCenter?.cost_center_name}</h4>
        <button
          onClick={() => setShowCostCenterModal(true)}
          disabled={costCenterLoading}
          className="btn btn-primary"
        >
          {costCenterLoading ? 'Cambiando...' : 'Cambiar Centro de Costo'}
        </button>
      </div>

      {/* Modal para seleccionar centro de costo */}
      {showCostCenterModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Seleccionar Nuevo Centro de Costo</h3>
            <select
              value={selectedCostCenter}
              onChange={(e) => setSelectedCostCenter(e.target.value)}
              className="form-control"
            >
              <option value="">Selecciona un centro de costo</option>
              {/* Aquí cargarías la lista de centros de costo disponibles */}
              <option value="1">Centro de Costo 1</option>
              <option value="2">Centro de Costo 2</option>
              <option value="3">Centro de Costo 3</option>
            </select>
            <div className="modal-actions">
              <button
                onClick={handleCostCenterChange}
                disabled={!selectedCostCenter || costCenterLoading}
                className="btn btn-primary"
              >
                {costCenterLoading ? 'Cambiando...' : 'Confirmar Cambio'}
              </button>
              <button
                onClick={() => setShowCostCenterModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceActions;
```

### **Componente de Lista de Facturas con Acciones**

```javascript
// components/InvoiceList.jsx
import React, { useState, useEffect } from 'react';
import InvoiceActions from './InvoiceActions';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setInvoices(data.data || []);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceUpdate = (updatedInvoice) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice =>
        invoice.id === updatedInvoice.id ? updatedInvoice : invoice
      )
    );
  };

  if (loading) return <div>Cargando facturas...</div>;

  return (
    <div className="invoice-list">
      <h2>Lista de Facturas</h2>
      {invoices.map(invoice => (
        <div key={invoice.id} className="invoice-card">
          <div className="invoice-info">
            <h3>Factura #{invoice.invoice_number}</h3>
            <p><strong>Estado:</strong> {invoice.status}</p>
            <p><strong>Centro de Costo:</strong> {invoice.costCenter?.cost_center_name}</p>
            <p><strong>Proveedor:</strong> {invoice.provider?.provider_name}</p>
            <p><strong>Total:</strong> ${invoice.total_amount?.toLocaleString()}</p>
          </div>
          
          <InvoiceActions 
            invoice={invoice} 
            onUpdate={handleInvoiceUpdate}
          />
        </div>
      ))}
    </div>
  );
};

export default InvoiceList;
```

---

## 🎨 **Estilos CSS**

```css
/* styles/InvoiceActions.css */
.invoice-actions {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.status-buttons, .cost-center-section {
  margin-bottom: 1rem;
}

.status-buttons h4, .cost-center-section h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

.btn {
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-outline-success {
  background-color: transparent;
  color: #28a745;
  border: 1px solid #28a745;
}

.btn-outline-warning {
  background-color: transparent;
  color: #ffc107;
  border: 1px solid #ffc107;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
}

.modal h3 {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.invoice-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

.invoice-info {
  margin-bottom: 1rem;
}

.invoice-info h3 {
  color: #333;
  margin-bottom: 0.5rem;
}

.invoice-info p {
  margin: 0.25rem 0;
  color: #666;
}
```

---

## 📋 **Casos de Uso Comunes**

### **1. Marcar Factura como Pagada**
```javascript
// Cuando el usuario confirma el pago
const markAsPaid = async (invoiceId) => {
  try {
    await changeInvoiceStatus(invoiceId, 'PAGADA');
    // Actualizar UI
    // Mostrar notificación de éxito
  } catch (error) {
    // Mostrar error al usuario
  }
};
```

### **2. Revertir Pago**
```javascript
// Cuando se necesita revertir un pago
const revertPayment = async (invoiceId) => {
  try {
    await changeInvoiceStatus(invoiceId, 'PENDIENTE');
    // Actualizar UI
  } catch (error) {
    // Manejar error
  }
};
```

### **3. Reasignar Centro de Costo**
```javascript
// Cuando se necesita cambiar el centro de costo
const reassignCostCenter = async (invoiceId, newCostCenterId) => {
  try {
    const result = await changeInvoiceCostCenter(invoiceId, newCostCenterId);
    // Mostrar información del cambio
    console.log('Centro anterior:', result.data.old_cost_center);
    console.log('Centro nuevo:', result.data.new_cost_center);
  } catch (error) {
    // Manejar error
  }
};
```

---

## ⚠️ **Consideraciones Importantes**

### **Autenticación**
- Todos los endpoints requieren autenticación Bearer Token
- El token debe estar en el header `Authorization`
- Verificar que el token no haya expirado

### **Validación de Datos**
- El estado solo acepta `PENDIENTE` o `PAGADA`
- El `cost_center_id` debe existir en la base de datos
- Manejar errores de validación apropiadamente

### **Actualización de UI**
- Actualizar la lista de facturas después de cambios exitosos
- Mostrar estados de carga durante las operaciones
- Proporcionar feedback visual al usuario

### **Manejo de Errores**
- Implementar try-catch en todas las llamadas
- Mostrar mensajes de error claros al usuario
- Logear errores para debugging

---

## 🚀 **Ejemplo de Implementación Completa**

```javascript
// App.jsx - Implementación completa
import React, { useState, useEffect } from 'react';
import InvoiceList from './components/InvoiceList';
import './styles/InvoiceActions.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Verificar autenticación
    if (!token) {
      // Redirigir a login
      window.location.href = '/login';
    }
  }, [token]);

  if (!token) {
    return <div>Redirigiendo al login...</div>;
  }

  return (
    <div className="App">
      <header>
        <h1>Sistema de Gestión de Facturas</h1>
      </header>
      <main>
        <InvoiceList />
      </main>
    </div>
  );
}

export default App;
```

---

**📅 Última actualización:** Enero 2025  
**📚 Versión:** 1.0  
**👨‍💻 Documentado por:** Equipo de Desarrollo Backend
