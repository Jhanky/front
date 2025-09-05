# Endpoints de Cotizaciones

## Descripción General
API para gestionar las cotizaciones de sistemas de energía solar. Las cotizaciones incluyen productos (paneles, inversores, baterías), items adicionales (materiales, mano de obra, servicios) y cálculos automáticos de costos con porcentajes de ganancia.

## Estructura de Cotización
- **Información General**: Cliente, usuario, nombre del proyecto, tipo de sistema
- **Especificaciones Técnicas**: Potencia (kWp), número de paneles, financiamiento
- **Porcentajes**: Ganancia, IVA, gestión comercial, administración, contingencia, retenciones
- **Productos**: Paneles, inversores, baterías con cantidades y precios
- **Items Adicionales**: Materiales, mano de obra, servicios
- **Cálculos Automáticos**: Subtotales, totales con porcentajes aplicados

---

## 1. Listar Cotizaciones

### GET `/api/quotations`

Obtiene la lista de cotizaciones con filtros, ordenamiento y paginación.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros de Query:**
- `page` (integer, opcional): Número de página
- `per_page` (integer, opcional): Elementos por página (default: 15)
- `search` (string, opcional): Búsqueda por nombre del proyecto
- `status_id` (integer, opcional): Filtrar por estado
- `system_type` (string, opcional): Filtrar por tipo de sistema
- `client_id` (integer, opcional): Filtrar por cliente
- `sort_by` (string, opcional): Campo para ordenar
- `sort_order` (string, opcional): ASC o DESC

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "quotation_id": 1,
                "client_id": 1,
                "user_id": 1,
                "project_name": "Sistema Residencial San Salvador",
                "system_type": "On-grid",
                "power_kwp": "5.00",
                "panel_count": 12,
                "requires_financing": false,
                "profit_percentage": "0.150",
                "iva_profit_percentage": "0.130",
                "commercial_management_percentage": "0.050",
                "administration_percentage": "0.030",
                "contingency_percentage": "0.020",
                "withholding_percentage": "0.020",
                "subtotal": 33605000,
                "profit": 1680250,
                "profit_iva": 218432.5,
                "commercial_management": 1680250,
                "administration": 1008150,
                "contingency": 672100,
                "withholdings": 877819.39,
                "total_value": 43890969.62,
                "subtotal2": 35285250,
                "subtotal3": 43013182.5,
                "status_id": 2,
                "created_at": "2025-09-01T14:37:43.000000Z",
                "updated_at": "2025-09-01T14:37:44.000000Z",
                "quotation_number": "COT-000001",
                "client": {
                    "client_id": 1,
                    "name": "Juan Pérez",
                    "nic": "12345678-9"
                },
                "status": {
                    "status_id": 2,
                    "name": "Diseñada",
                    "color": "#3B82F6"
                }
            }
        ],
        "total": 3,
        "per_page": 15
    },
    "message": "Cotizaciones obtenidas exitosamente"
}
```

---

## 2. Obtener Más Información de Cotización

### GET `/api/quotations/{id}`

Obtiene una cotización específica con todos sus detalles completos.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (integer, requerido): ID de la cotización

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "quotation_id": 1,
        "client_id": 1,
        "user_id": 1,
        "project_name": "Sistema Residencial San Salvador",
        "system_type": "On-grid",
        "power_kwp": "5.00",
        "panel_count": 12,
        "requires_financing": false,
        "profit_percentage": "0.150",
        "iva_profit_percentage": "0.130",
        "commercial_management_percentage": "0.050",
        "administration_percentage": "0.030",
        "contingency_percentage": "0.020",
        "withholding_percentage": "0.020",
        "subtotal": 33605000,
        "profit": 1680250,
        "profit_iva": 218432.5,
        "commercial_management": 1680250,
        "administration": 1008150,
        "contingency": 672100,
        "withholdings": 877819.39,
        "total_value": 43890969.62,
        "subtotal2": 35285250,
        "subtotal3": 43013182.5,
        "status_id": 2,
        "created_at": "2025-09-01T14:37:43.000000Z",
        "updated_at": "2025-09-01T14:37:44.000000Z",
        "quotation_number": "COT-000001",
        "client": {
            "client_id": 1,
            "name": "Juan Pérez",
            "nic": "12345678-9",
            "client_type": "Residencial",
            "department": "San Salvador",
            "city": "San Salvador",
            "address": "Calle Principal #123",
            "monthly_consumption_kwh": "500.00",
            "energy_rate": "0.1500",
            "network_type": "Monofásico 110V"
        },
        "status": {
            "status_id": 2,
            "name": "Diseñada",
            "description": "Cotización con diseño técnico completo y especificaciones definidas",
            "color": "#3B82F6"
        },
        "used_products": [
            {
                "used_product_id": 1,
                "product_type": "panel",
                "product_id": 1,
                "quantity": 12,
                "unit_price": "850000.00",
                "partial_value": "10200000.00",
                "profit_percentage": "0.150",
                "profit": "1530000.00",
                "total_value": "11730000.00",
                "product_brand": "Canadian Solar",
                "product_model": "CS6K-300MS",
                "product_power": "300 W",
                "product": {
                    "panel_id": 1,
                    "brand": "Canadian Solar",
                    "model": "CS6K-300MS",
                    "power": "300.00",
                    "type": "Monocristalino",
                    "price": "850000.00"
                }
            },
            {
                "used_product_id": 2,
                "product_type": "inverter",
                "product_id": 1,
                "quantity": 1,
                "unit_price": "4500000.00",
                "partial_value": "4500000.00",
                "profit_percentage": "0.200",
                "profit": "900000.00",
                "total_value": "5400000.00",
                "product_brand": "SMA",
                "product_model": "Sunny Boy 3.0",
                "product_power": "3000 W",
                "product": {
                    "inverter_id": 1,
                    "brand": "SMA",
                    "model": "Sunny Boy 3.0",
                    "power": "3000.00",
                    "system_type": "On-grid",
                    "grid_type": "Monofásico 110V",
                    "price": "4500000.00"
                }
            }
        ],
        "items": [
            {
                "item_id": 1,
                "description": "Estructura de montaje para paneles solares",
                "item_type": "Materiales",
                "quantity": "12.00",
                "unit": "Unidades",
                "unit_price": "150000.00",
                "partial_value": "1800000.00",
                "profit_percentage": "0.150",
                "profit": "270000.00",
                "total_value": "2070000.00"
            },
            {
                "item_id": 2,
                "description": "Cableado DC y AC para sistema solar",
                "item_type": "Materiales",
                "quantity": "250.00",
                "unit": "Metros",
                "unit_price": "2500.00",
                "partial_value": "625000.00",
                "profit_percentage": "0.200",
                "profit": "125000.00",
                "total_value": "750000.00"
            },
            {
                "item_id": 3,
                "description": "Instalación y montaje del sistema",
                "item_type": "Mano de obra",
                "quantity": "40.00",
                "unit": "Horas",
                "unit_price": "25000.00",
                "partial_value": "1000000.00",
                "profit_percentage": "0.300",
                "profit": "300000.00",
                "total_value": "1300000.00"
            }
        ]
    },
    "message": "Cotización obtenida exitosamente"
}
```

---

## 3. Crear Cotización

### POST `/api/quotations`

Crea una nueva cotización. **El backend realiza TODOS los cálculos automáticamente** basándose en los productos, items y porcentajes enviados.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (el frontend solo envía datos básicos, el backend calcula todo automáticamente):**
```json
{
  "client_id": 1,
  "user_id": 1,
  "project_name": "Instalación Solar Residencial V2", 
  "system_type": "Interconectado",
  "power_kwp": 36, // kW a instalar
  "panel_count": 12,
  "requires_financing": 0,
  "profit_percentage": 0.05,
  "iva_profit_percentage": 0.19,
  "commercial_management_percentage": 0.05,
  "administration_percentage": 0.03,
  "contingency_percentage": 0.02,
  "withholding_percentage": 0.025,
  "products": [
    {
      "product_type": "panel",
      "product_id": 2,
      "quantity": 64, 
      "unit_price": 350000,
      "profit_percentage": 0.25
    },
    {
      "product_type": "inverter",
      "product_id": 3,
      "quantity": 1,
      "unit_price": 14900000,
      "profit_percentage": 0.25
    },
        {
      "product_type": "battery",
      "product_id": 1,
      "quantity": 2,
      "unit_price": 4100000,
      "profit_percentage": 0.25
    }
  ],
  "items": [
    {
    "description": "Conductor fotovoltaico",
    "item_type": "conductor_fotovoltaico",
    "quantity": 432, // Es igual al valor de (power_kwp * 12) 
    "unit": "metro",
    "unit_price": 4047, //valor fijo
    "profit_percentage": 0.25
    },
    {
      "description": "Cableado fotovoltaico",
      "item_type": "material_electrico",
      "quantity": 50, //igual al numero de paneles
      "unit": "metros",
      "unit_price": 170000,
      "profit_percentage": 0.25
    },
    {
      "description": "Estructura de soporte",
      "item_type": "estructura",
      "quantity": 50, //igual al numero de paneles
      "unit": "kit",
      "unit_price": 85000,
      "profit_percentage": 0.25
    },
    {
      "description": "Mano de obra instalación",
      "item_type": "mano_obra",
      "quantity": 50, //igual al numero de paneles
      "unit": "servicio",
      "unit_price": 185000,
      "profit_percentage": 0.25
    },
        {
      "description": "Costo de legalización",
      "item_type": "legalization",
      "quantity": 1,
      "unit": "servicio",
      "unit_price": 7000000,
      "profit_percentage": 0.25
    }
  ]
}
```

**Validaciones:**
- `client_id` (integer, requerido, debe existir en la tabla clients)
- `user_id` (integer, requerido, debe existir en la tabla users)
- `project_name` (string, requerido, máximo 200 caracteres)
- `system_type` (string, requerido): On-grid, Off-grid, Híbrido, Interconectado
- `power_kwp` (decimal, requerido, mínimo 0.1)
- `panel_count` (integer, requerido, mínimo 1)
- `requires_financing` (boolean, opcional)
- `profit_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `iva_profit_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `commercial_management_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `administration_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `contingency_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `withholding_percentage` (decimal, requerido, máximo 1.0 = 100%)
- `status_id` (integer, opcional, debe existir en la tabla quotation_statuses)

**Nota Importante:** El backend calcula automáticamente todos los valores monetarios basándose en los productos e items enviados.

**Productos (`products`):**
- `products` (array, opcional): Lista de productos a incluir
- `products.*.product_type` (string, requerido con products): panel, inverter, battery
- `products.*.product_id` (integer, requerido con products): ID del producto
- `products.*.quantity` (integer, requerido con products, mínimo 1)
- `products.*.unit_price` (decimal, requerido con products, mínimo 0)
- `products.*.profit_percentage` (decimal, requerido con products, máximo 1.0 = 100%)

**Items Adicionales (`items`):**
- `items` (array, opcional): Lista de items a incluir
- `items.*.description` (string, requerido con items, máximo 500 caracteres)
- `items.*.item_type` (string, requerido con items, máximo 50 caracteres)
- `items.*.quantity` (decimal, requerido con items, mínimo 0.01)
- `items.*.unit` (string, requerido con items, máximo 20 caracteres)
- `items.*.unit_price` (decimal, requerido con items, mínimo 0)
- `items.*.profit_percentage` (decimal, requerido con items, máximo 1.0 = 100%)


**Respuesta Exitosa (201):**
```json
{
    "success": true,
    "data": {
        "quotation_id": 2,
        "client_id": 1,
        "user_id": 1,
        "project_name": "Instalación Solar Residencial V2",
        "system_type": "Interconectado",
        "power_kwp": "36.00",
        "panel_count": 64,
        "requires_financing": false,
        "profit_percentage": "0.150",
        "iva_profit_percentage": "0.190",
        "commercial_management_percentage": "0.050",
        "administration_percentage": "0.030",
        "contingency_percentage": "0.020",
        "withholding_percentage": "0.025",
        "subtotal": 0,
        "profit": 0,
        "profit_iva": 0,
        "commercial_management": 0,
        "administration": 0,
        "contingency": 0,
        "withholdings": 0,
        "total_value": 0,
        "subtotal2": 0,
        "subtotal3": 0,
        "status_id": 1,
        "created_at": "2025-09-01T16:00:00.000000Z",
        "updated_at": "2025-09-01T16:00:00.000000Z",
        "quotation_number": "COT-000002",
        "client": {
            "client_id": 1,
            "name": "Juan Pérez",
            "nic": "12345678-9"
        },
        "status": {
            "status_id": 1,
            "name": "Borrador",
            "color": "#6B7280"
        },
        "used_products": [...],
        "items": [...]
    },
    "message": "Cotización creada exitosamente con todos los cálculos realizados"
}
```

---

## 4. Editar Cotización

### PUT `/api/quotations/{id}`

Actualiza una cotización existente. Permite editar cualquier campo de la cotización por separado.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (integer, requerido): ID de la cotización

**Body (campos opcionales - solo enviar los que se quieren editar):**
```json
{
    "client_id": 2,
    "user_id": 3,
    "project_name": "Sistema Residencial Actualizado",
    "system_type": "Híbrido",
    "power_kwp": 4.5,
    "panel_count": 15,
    "requires_financing": true,
    "profit_percentage": 0.180,
    "iva_profit_percentage": 0.130,
    "commercial_management_percentage": 0.060,
    "administration_percentage": 0.040,
    "contingency_percentage": 0.030,
    "withholding_percentage": 0.025,
    "status_id": 3,
    "subtotal": 45678901.23,
    "profit": 4567890.12,
    "profit_iva": 593825.72,
    "commercial_management": 2283945.06,
    "administration": 1370367.04,
    "contingency": 1027775.28,
    "withholdings": 1141972.53,
    "total_value": 52345678.90,
    "subtotal2": 50246791.35,
    "subtotal3": 52345678.90,
    "used_products": [
        {
            "used_product_id": 1,
            "quantity": 15,
            "unit_price": 900000.00,
            "profit_percentage": 0.180,
            "partial_value": 13500000.00,
            "profit": 2430000.00,
            "total_value": 15930000.00
        }
    ],
    "items": [
        {
            "item_id": 1,
            "description": "Estructura de montaje actualizada",
            "quantity": 15.00,
            "unit_price": 180000.00,
            "profit_percentage": 0.180,
            "partial_value": 2700000.00,
            "profit": 486000.00,
            "total_value": 3186000.00
        }
    ]
}
```

**Validaciones:**
- `client_id` (integer, opcional, debe existir en la tabla clients)
- `user_id` (integer, opcional, debe existir en la tabla users)
- `project_name` (string, opcional, máximo 200 caracteres)
- `system_type` (string, opcional): On-grid, Off-grid, Híbrido
- `power_kwp` (decimal, opcional, mínimo 0.1)
- `panel_count` (integer, opcional, mínimo 1)
- `requires_financing` (boolean, opcional)
- `profit_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `iva_profit_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `commercial_management_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `administration_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `contingency_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `withholding_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `status_id` (integer, opcional, debe existir en la tabla quotation_statuses)

**Valores Calculados (requeridos cuando se editan productos/items):**
- `subtotal` (decimal, opcional, mínimo 0): Suma de todos los productos e items
- `profit` (decimal, opcional, mínimo 0): Ganancia total calculada
- `profit_iva` (decimal, opcional, mínimo 0): IVA sobre la ganancia
- `commercial_management` (decimal, opcional, mínimo 0): Gestión comercial calculada
- `administration` (decimal, opcional, mínimo 0): Administración calculada
- `contingency` (decimal, opcional, mínimo 0): Contingencia calculada
- `withholdings` (decimal, opcional, mínimo 0): Retenciones calculadas
- `total_value` (decimal, opcional, mínimo 0): Valor total final
- `subtotal2` (decimal, opcional, mínimo 0): Subtotal intermedio
- `subtotal3` (decimal, opcional, mínimo 0): Subtotal final

**Productos Utilizados (`used_products`):**
- `used_products` (array, opcional): Lista de productos a actualizar
- `used_products.*.used_product_id` (integer, opcional, debe existir en used_products)
- `used_products.*.quantity` (integer, opcional, mínimo 1)
- `used_products.*.unit_price` (decimal, opcional, mínimo 0)
- `used_products.*.profit_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `used_products.*.partial_value` (decimal, opcional, mínimo 0): Valor parcial calculado (cantidad × precio unitario)
- `used_products.*.profit` (decimal, opcional, mínimo 0): Ganancia calculada del producto
- `used_products.*.total_value` (decimal, opcional, mínimo 0): Valor total del producto (parcial + ganancia)

**Items Adicionales (`items`):**
- `items` (array, opcional): Lista de items a actualizar
- `items.*.item_id` (integer, opcional, debe existir en quotation_items)
- `items.*.description` (string, opcional, máximo 500 caracteres)
- `items.*.item_type` (string, opcional, máximo 50 caracteres)
- `items.*.quantity` (decimal, opcional, mínimo 0.01)
- `items.*.unit` (string, opcional, máximo 20 caracteres)
- `items.*.unit_price` (decimal, opcional, mínimo 0)
- `items.*.profit_percentage` (decimal, opcional, máximo 1.0 = 100%)
- `items.*.partial_value` (decimal, opcional, mínimo 0): Valor parcial calculado (cantidad × precio unitario)
- `items.*.profit` (decimal, opcional, mínimo 0): Ganancia calculada del item
- `items.*.total_value` (decimal, opcional, mínimo 0): Valor total del item (parcial + ganancia)

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "quotation_id": 1,
        "client_id": 2,
        "user_id": 3,
        "project_name": "Sistema Residencial Actualizado",
        "system_type": "Híbrido",
        "power_kwp": "4.50",
        "panel_count": 15,
        "requires_financing": true,
        "profit_percentage": "0.180",
        "iva_profit_percentage": "0.130",
        "commercial_management_percentage": "0.060",
        "administration_percentage": "0.040",
        "contingency_percentage": "0.030",
        "withholding_percentage": "0.025",
        "status_id": 3,
        "subtotal": 45678901.23,
        "total_value": 52345678.90,
        "updated_at": "2025-09-01T15:30:00.000000Z",
        "used_products_count": 2,
        "items_count": 3
    },
    "message": "Cotización actualizada exitosamente"
}
```

---

## 5. Eliminar Cotización

### DELETE `/api/quotations/{id}`

Elimina una cotización y todos sus productos e items asociados.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (integer, requerido): ID de la cotización

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Cotización eliminada exitosamente"
}
```

**Respuesta de Error (404):**
```json
{
    "success": false,
    "message": "Cotización no encontrada"
}
```

---

## 5. Cambiar Estado de Cotización

### PATCH `/api/quotations/{id}/status`

Cambia el estado de una cotización.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros de URL:**
- `id` (integer, requerido): ID de la cotización

**Body:**
```json
{
    "status_id": 3
}
```

**Validaciones:**
- `status_id` (integer, requerido): ID del estado válido

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "quotation_id": 1,
        "status": {
            "status_id": 3,
            "name": "Enviada",
            "description": "Cotización enviada al cliente para su revisión y consideración",
            "color": "#10B981"
        },
        "updated_at": "2025-09-01T15:30:00.000000Z"
    },
    "message": "Estado de cotización actualizado exitosamente"
}
```

**Respuesta de Error (422):**
```json
{
    "success": false,
    "message": "Error de validación",
    "errors": {
        "status_id": ["El estado seleccionado no es válido."]
    }
}
```

---

## Códigos de Error Comunes

### 401 Unauthorized
```json
{
    "success": false,
    "message": "No autorizado"
}
```

### 403 Forbidden
```json
{
    "success": false,
    "message": "Acceso denegado"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "Cotización no encontrada"
}
```

### 422 Validation Error
```json
{
    "success": false,
    "message": "Error de validación",
    "errors": {
        "project_name": ["El nombre del proyecto es requerido."],
        "power_kwp": ["La potencia debe ser mayor a 0."]
    }
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Error interno del servidor"
}
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación mediante token Bearer.
2. **Permisos**: Algunos endpoints pueden requerir permisos específicos según el rol del usuario.
3. **Edición Completa**: El endpoint de edición permite modificar cualquier campo de la cotización, incluyendo:
    - **Información Principal**: Cliente (`client_id`), usuario (`user_id`), estado (`status_id`)
    - **Datos del Proyecto**: Nombre, tipo de sistema, potencia, paneles, financiamiento
    - **Porcentajes**: Ganancia, IVA, gestión comercial, administración, contingencia, retenciones
    - **Productos Utilizados**: Cantidad, precio unitario, porcentaje de ganancia, valores parciales y totales
    - **Items Adicionales**: Descripción, tipo, cantidad, unidad, precio unitario, porcentaje de ganancia, valores parciales y totales
    - **Valores Monetarios**: El frontend debe enviar todos los valores calculados (no hay cálculos automáticos)
    - **IMPORTANTE**: Si se editan productos o items, enviar TODOS los valores recalculados (subtotales, ganancias, totales)
    - Solo enviar los campos que se quieren modificar
4. **Estados**: Las cotizaciones tienen estados que definen su flujo de trabajo.
5. **Integridad**: Al eliminar una cotización se eliminan todos sus productos e items asociados.
6. **Número de Cotización**: Se genera automáticamente con formato COT-XXXXXX.
7. **Cálculos Automáticos en Creación**: El backend realiza TODOS los cálculos automáticamente al crear cotizaciones. El frontend solo envía productos, items y porcentajes.
8. **Relaciones**: Los endpoints incluyen datos de clientes, estados y productos relacionados.
9. **Información de Productos**: En el endpoint de obtener cotización, cada producto incluye:
    - `product_brand`: Marca del producto (ej: "Canadian Solar", "SMA")
    - `product_model`: Modelo del producto (ej: "CS6K-300MS", "Sunny Boy 3.0")
    - `product_power`: Potencia del producto con unidad (ej: "300 W", "3000 W", "200 Ah / 12 V")
    - `product`: Objeto completo con todos los detalles del producto
10. **Unidades de Potencia**: 
    - Paneles e Inversores: Watts (W)
    - Baterías: Amperios-hora / Voltios (Ah / V)
11. **Edición de Productos e Items**: 
    - Se pueden editar cantidades, precios unitarios y porcentajes de ganancia
    - El frontend debe enviar todos los valores calculados (parcial_value, profit, total_value)
    - Solo enviar los productos/items que se quieren modificar
    - No hay cálculos automáticos en el backend
12. **Formato de Porcentajes**: 
    - **IMPORTANTE**: Todos los porcentajes se almacenan como decimales donde 1.0 = 100%
    - Ejemplos: 15% = 0.15, 25.5% = 0.255, 100% = 1.0
    - El frontend debe convertir los porcentajes de la interfaz (0-100) a decimales (0.0-1.0) antes de enviar
    - Al recibir datos del backend, convertir de decimales (0.0-1.0) a porcentajes (0-100) para mostrar en la interfaz
13. **Creación vs Edición de Cotizaciones**: 
    - **CREACIÓN**: El backend calcula automáticamente todos los valores. El frontend solo envía productos, items y porcentajes.
    - **EDICIÓN**: Cuando el frontend edita productos o items, debe recalcular y enviar TODOS los valores
    - Los cambios en productos/items afectan: subtotales, ganancias, IVA, gestión comercial, administración, contingencia, retenciones y total final
    - El frontend debe enviar: `subtotal`, `profit`, `profit_iva`, `commercial_management`, `administration`, `contingency`, `withholdings`, `total_value`, `subtotal2`, `subtotal3`
    - Ejemplo: Si se cambia la cantidad de un panel de 12 a 15, recalcular todo desde el subtotal hasta el total final
    - No enviar solo los productos modificados, enviar TODA la cotización con valores actualizados
