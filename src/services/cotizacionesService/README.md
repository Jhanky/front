# Servicio de Cotizaciones - Cambios Dinámicos

## Descripción
Servicio actualizado para gestionar cotizaciones con soporte completo para cambios dinámicos en tiempo real, cálculos automáticos y sincronización entre frontend y backend.

## Características Principales

### 🔄 **Cambios Dinámicos en Tiempo Real**
- **Edición Inline**: Modificación directa de valores en las tablas
- **Cálculos Automáticos**: Recalculación instantánea de totales y subtotales
- **Validación en Tiempo Real**: Verificación de datos antes de enviar al backend
- **Sincronización Inteligente**: Solo se envían los campos modificados

### 📊 **Sistema de Cálculos Automáticos**
- **Productos**: Cantidad × Precio Unitario + Utilidad = Total
- **Items Adicionales**: Cantidad × Precio Unitario + Utilidad = Total
- **Porcentajes Aplicados**: Gestión comercial, administración, imprevistos, utilidad, IVA, retenciones
- **Subtotales Progresivos**: Subtotal → Subtotal2 → Subtotal3 → Total Final

### 🎯 **Funciones del Servicio**

#### **1. Gestión Básica de Cotizaciones**
```javascript
// Obtener cotizaciones con paginación y filtros
const cotizaciones = await cotizacionesService.getCotizaciones(params, token);

// Obtener cotización específica con todos los detalles
const cotizacion = await cotizacionesService.getCotizacionById(id, token);

// Crear nueva cotización
const nuevaCotizacion = await cotizacionesService.createCotizacion(data, token);

// Eliminar cotización
await cotizacionesService.deleteCotizacion(id, token);
```

#### **2. Actualización Inteligente (NUEVA)**
```javascript
// Solo se envían los campos modificados
const updateData = {
  used_products: productosModificados,
  items: itemsModificados,
  profit_percentage: 0.18, // Solo si cambió
  commercial_management_percentage: 0.06 // Solo si cambió
};

const resultado = await cotizacionesService.updateCotizacion(id, updateData, token);
```

#### **3. Sincronización de Cambios del Frontend (NUEVA)**
```javascript
// Para cambios dinámicos como edición inline
const cambios = {
  used_products: productosActualizados,
  items: itemsActualizados,
  percentages: {
    profit_percentage: 0.18,
    commercial_management_percentage: 0.06
  }
};

await cotizacionesService.syncFrontendChanges(id, cambios, token);
```

#### **4. Gestión de Estados y Productos**
```javascript
// Cambiar estado de cotización
await cotizacionesService.changeCotizacionStatus(id, nuevoEstadoId, token);

// Agregar producto a cotización
await cotizacionesService.addProductToCotizacion(id, datosProducto, token);

// Agregar item a cotización
await cotizacionesService.addItemToCotizacion(id, datosItem, token);
```

#### **5. Recalculación y Estadísticas**
```javascript
// Recalcular totales (para sincronización con frontend)
await cotizacionesService.recalculateTotals(id, token);

// Obtener estadísticas
const estadisticas = await cotizacionesService.getStatistics(token);
```

## 🔧 **Funciones de Validación**

### **Validación de Datos Básicos**
```javascript
const validacion = cotizacionesService.validateCotizacionData(datos);
if (!validacion.isValid) {
  console.error('Errores:', validacion.errors);
}
```

### **Validación de Cambios Dinámicos (NUEVA)**
```javascript
const validacionCambios = cotizacionesService.validateDynamicChanges({
  used_products: productosModificados,
  items: itemsModificados,
  percentages: porcentajesModificados
});

if (!validacionCambios.isValid) {
  console.error('Errores en cambios:', validacionCambios.errors);
}
```

## 📋 **Estructura de Datos para Actualizaciones**

### **Actualización de Productos**
```javascript
{
  "used_products": [
    {
      "used_product_id": 1,
      "quantity": 15, // Modificado
      "unit_price": 850000, // Modificado
      "profit_percentage": 0.15, // Modificado
      "partial_value": 12750000, // Calculado automáticamente
      "profit": 1912500, // Calculado automáticamente
      "total_value": 14662500 // Calculado automáticamente
    }
  ]
}
```

### **Actualización de Items**
```javascript
{
  "items": [
    {
      "item_id": 1,
      "quantity": 50, // Modificado
      "unit_price": 2500, // Modificado
      "profit_percentage": 0.20, // Modificado
      "partial_value": 125000, // Calculado automáticamente
      "profit": 25000, // Calculado automáticamente
      "total_value": 150000 // Calculado automáticamente
    }
  ]
}
```

### **Actualización de Porcentajes**
```javascript
{
  "profit_percentage": 0.18, // 18%
  "commercial_management_percentage": 0.06, // 6%
  "administration_percentage": 0.04, // 4%
  "contingency_percentage": 0.03, // 3%
  "withholding_percentage": 0.025 // 2.5%
}
```

## 🚀 **Flujo de Trabajo para Cambios Dinámicos**

### **1. Edición en el Frontend**
```javascript
// Usuario modifica un valor (ej: cantidad de producto)
const handleProductChange = (index, field, value) => {
  const updatedProducts = [...editableProducts];
  updatedProducts[index][field] = value;
  
  // Recalcular totales automáticamente
  const calculated = calculateProductTotal(updatedProducts[index]);
  updatedProducts[index] = { ...updatedProducts[index], ...calculated };
  
  setEditableProducts(updatedProducts);
  setHasChanges(true); // Marcar que hay cambios pendientes
};
```

### **2. Validación Local**
```javascript
// Validar cambios antes de enviar
const validacion = cotizacionesService.validateDynamicChanges({
  used_products: editableProducts,
  items: editableItems
});

if (!validacion.isValid) {
  showError(`Errores de validación: ${validacion.errors.join(', ')}`);
  return;
}
```

### **3. Envío al Backend**
```javascript
// Solo enviar campos modificados
const updateData = {};
if (hasProductChanges) updateData.used_products = editableProducts;
if (hasItemChanges) updateData.items = editableItems;
if (hasPercentageChanges) {
  updateData.profit_percentage = cotizacion.profit_percentage;
  updateData.commercial_management_percentage = cotizacion.commercial_management_percentage;
  // ... otros porcentajes
}

const response = await cotizacionesService.updateCotizacion(id, updateData, token);
```

### **4. Sincronización de Respuesta**
```javascript
if (response.success) {
  // Actualizar estado local con datos del backend
  setCotizacion(response.data);
  setHasChanges(false);
  showSuccess('Cambios guardados exitosamente');
} else {
  showError(`Error al guardar: ${response.message}`);
}
```

## 🔍 **Logging y Debugging**

### **Logs de Desarrollo**
```javascript
// El servicio incluye logs detallados para debugging
console.log('Datos a enviar al backend:', updateData);
console.log('Respuesta del backend:', response);
```

### **Manejo de Errores**
```javascript
try {
  const resultado = await cotizacionesService.updateCotizacion(id, data, token);
  // Procesar resultado exitoso
} catch (error) {
  console.error('Error detallado:', error);
  // Manejar error apropiadamente
}
```

## 📱 **Integración con el Frontend**

### **Hook de Estado**
```javascript
const [hasChanges, setHasChanges] = useState(false);
const [editableProducts, setEditableProducts] = useState([]);
const [editableItems, setEditableItems] = useState([]);
```

### **Detección de Cambios**
```javascript
// Marcar cambios cuando se modifica cualquier valor
const handleAnyChange = () => {
  setHasChanges(true);
};

// Limpiar estado de cambios después de guardar
const handleSaveSuccess = () => {
  setHasChanges(false);
};
```

### **Indicadores Visuales**
```javascript
// Mostrar indicador de cambios pendientes
{hasChanges && (
  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded">
    Tienes cambios sin guardar
  </div>
)}

// Botón de guardar solo cuando hay cambios
{hasChanges && (
  <button onClick={handleSaveChanges} className="btn-primary">
    Guardar Cambios
  </button>
)}
```

## 🎯 **Ventajas del Sistema Actualizado**

### **1. Performance**
- ✅ **Envío Selectivo**: Solo se envían campos modificados
- ✅ **Validación Local**: Reducción de llamadas al backend
- ✅ **Cálculos en Tiempo Real**: Respuesta inmediata del usuario

### **2. Experiencia de Usuario**
- ✅ **Edición Inline**: Modificación directa en las tablas
- ✅ **Feedback Inmediato**: Cálculos automáticos en tiempo real
- ✅ **Indicadores Visuales**: Estado de cambios pendientes

### **3. Mantenibilidad**
- ✅ **Código Centralizado**: Lógica de validación en el servicio
- ✅ **Validaciones Consistentes**: Mismas reglas en toda la aplicación
- ✅ **Manejo de Errores**: Estructura uniforme para errores

### **4. Escalabilidad**
- ✅ **Arquitectura Modular**: Fácil agregar nuevas validaciones
- ✅ **Endpoints Flexibles**: Soporte para diferentes tipos de actualizaciones
- ✅ **Sincronización Inteligente**: Adaptable a diferentes flujos de trabajo

## 🔮 **Próximas Mejoras**

### **1. Funcionalidades Planificadas**
- [ ] **Historial de Cambios**: Tracking de modificaciones
- [ ] **Deshacer/Rehacer**: Revertir cambios específicos
- [ ] **Comparación de Versiones**: Diferencias entre estados
- [ ] **Backup Automático**: Guardado automático de cambios

### **2. Optimizaciones Técnicas**
- [ ] **Debouncing**: Reducir llamadas al backend
- [ ] **Cache Inteligente**: Almacenamiento local de datos
- [ ] **Sincronización Offline**: Trabajo sin conexión
- [ ] **WebSockets**: Actualizaciones en tiempo real

### **3. Validaciones Avanzadas**
- [ ] **Reglas de Negocio**: Validaciones específicas del dominio
- [ ] **Dependencias**: Validaciones entre campos relacionados
- [ ] **Formato de Datos**: Validaciones de formato y rango
- [ ] **Integridad Referencial**: Verificación de relaciones

Este servicio proporciona una base sólida para la gestión dinámica de cotizaciones, permitiendo una experiencia de usuario fluida y una arquitectura mantenible para futuras expansiones.
