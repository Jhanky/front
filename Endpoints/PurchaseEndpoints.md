# Endpoints de Facturas (Purchases)

## Descripción General

El sistema de facturas proporciona endpoints de consulta para obtener información detallada de todas las facturas registradas en el sistema, incluyendo información completa de proveedores, proyectos, clientes, centros de costo y usuarios responsables.

## Base URL

```
/api/purchases
```

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Facturas

**GET** `/api/purchases`

Obtiene una lista de todas las facturas con información completa incluyendo todas las relaciones (proveedor, proyecto, cliente, centro de costo, usuario, cotización, etc.).

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "invoice_number": "FAC-2025-001",
            "invoice_date": "25/08/2025",
            "due_date": "09/09/2025",
            "total_amount": 14280000.00,
            "subtotal": 12000000.00,
            "tax_amount": 2280000.00,
            "paid_amount": 0.00,
            "balance": 14280000.00,
            "status": "pendiente",
            "payment_method": "transferencia",
            "payment_reference": "REF-001-2025",
            "description": "Compra de paneles solares para proyecto residencial",
            "notes": null,
            "paid_at": null,
            "cancelled_at": null,
            "created_at": "04/09/2025 18:08",
            "updated_at": "04/09/2025 18:08",
            "supplier": {
                "id": 1,
                "name": "Jinko Solar Colombia",
                "tax_id": "900123456-7",
                "phone": "+57 1 234 5678",
                "email": "ventas@jinkosolar.co",
                "contact_name": "María González"
            },
            "project": {
                "id": 1,
                "name": "Sistema Solar Residencial Norte",
                "start_date": "15/08/2025",
                "estimated_end_date": "19/09/2025",
                "status_id": 1,
                "client": {
                    "id": 1,
                    "name": "Empresa Solar del Norte S.A.S.",
                    "type": "residencial",
                    "nic": "900123456-7"
                },
                "quotation": {
                    "id": 1,
                    "name": "Sistema Solar Residencial Norte",
                    "power_kwp": 5.0
                }
            },
            "cost_center": {
                "id": 1,
                "name": "Proyectos Residenciales",
                "description": "Centro de costo para proyectos residenciales"
            },
            "user": {
                "id": 1,
                "name": "Usuario Prueba",
                "email": "test@energy4cero.com",
                "phone": "3001234567"
            }
        }
    ]
}
```

### 2. Ver Detalles de Factura

**GET** `/api/purchases/{id}`

Obtiene información detallada de una factura específica incluyendo todos los datos del proveedor, proyecto, usuario responsable y fechas del sistema.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "number": "FAC-001-2025",
            "supplier": "Proveedor ABC",
            "project": "Proyecto Solar Norte",
            "amount": 1500000.00,
            "status": "Pagado",
            "date": "2025-09-03",
            "payment_method": "Transferencia"
        }
    ]
}
```

### 3. Ver Detalles de Factura

**GET** `/api/purchases/{id}`

Obtiene la información detallada completa de una factura específica, incluyendo datos del proveedor, proyecto y usuario responsable.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "invoice_details": {
            "number": "FAC-001-2025",
            "date": "01/09/2025",
            "due_date": "15/09/2025",
            "total_amount": "$1.500.000",
            "subtotal": "$1.363.636",
            "tax_amount": "$136.364",
            "paid_amount": "$1.500.000",
            "balance": "$0",
            "status": "pagada",
            "payment_method": "transferencia",
            "payment_reference": "N/A",
            "description": "Compra de paneles solares para proyecto residencial",
            "notes": "N/A",
            "document_url": "N/A",
            "paid_at": "02/09/2025 10:30",
            "cancelled_at": "N/A"
        },
        "supplier_info": {
            "name": "Jinko Solar Colombia",
            "nit": "900123456-7",
            "address": "Calle 123 #45-67, Zona Industrial",
            "phone": "+57 1 234 5678",
            "email": "ventas@jinkosolar.co",
            "contact_person": "María González"
        },
        "project_info": {
            "code": 2,
            "name": "Proyecto Solar Norte",
            "status": "Activo",
            "start_date": "03/09/2025",
            "estimated_end_date": "N/A",
            "actual_end_date": "N/A"
        },
        "responsible_user": {
            "name": "Jhan Martinez",
            "email": "jhanky@energy4cero.com",
            "phone": "+573015843357"
        },
        "system_dates": {
            "created_at": "04/09/2025 17:03",
            "updated_at": "04/09/2025 17:03"
        }
    }
}
```





## Estructura de Datos

### Campos de la Factura:

**Información Básica:**
- `id` (integer): ID único de la factura
- `invoice_number` (string): Número de factura (único)
- `date` (date): Fecha de la factura
- `total_amount` (decimal): Monto total de la factura
- `status` (enum): Estado (pendiente, pagada, cancelada)
- `payment_method` (enum): Método de pago
- `description` (text): Descripción de la factura

**Relaciones:**
- `supplier_id` (integer): ID del proveedor
- `cost_center_id` (integer): ID del centro de costo
- `project_id` (integer): ID del proyecto (opcional)
- `user_id` (integer): ID del usuario que registró la factura

**Metadatos:**
- `created_at` (datetime): Fecha de creación
- `updated_at` (datetime): Fecha de última actualización

## Validaciones

### Validaciones de Datos:
- `invoice_number`: Único, máximo 50 caracteres
- `date`: Formato de fecha válido
- `total_amount`: Numérico, mínimo 0
- `payment_method`: Debe ser uno de los valores permitidos
- `supplier_id`: Debe existir en la tabla suppliers
- `cost_center_id`: Debe existir en la tabla cost_centers
- `user_id`: Debe existir en la tabla users

## Estados de Factura

### 1. 🟡 Pendiente
- Factura registrada pero no pagada
- Requiere seguimiento y pago

### 2. 🟢 Pagado
- Factura completamente pagada
- Estado final positivo

### 3. 🔴 Cancelado
- Factura cancelada o anulada
- No requiere pago

## Métodos de Pago

### 1. 💵 Efectivo
- Pago en efectivo
- Registro inmediato

### 2. 🏦 Transferencia
- Transferencia bancaria
- Requiere comprobante

### 3. 💳 Tarjeta
- Pago con tarjeta de crédito/débito
- Procesamiento bancario

### 4. 📄 Cheque
- Pago con cheque
- Requiere compensación bancaria

### 5. 📋 Crédito
- Pago a crédito
- Requiere seguimiento de vencimiento

## Relaciones

### Relaciones Principales:
- **Factura → Proveedor**: Cada factura pertenece a un proveedor
- **Factura → Centro de Costo**: Cada factura se asocia a un centro de costo
- **Factura → Proyecto**: Las facturas pueden asociarse a proyectos específicos
- **Factura → Usuario**: Cada factura es registrada por un usuario

### Relaciones Heredadas:
- **Proveedor → Facturas**: Un proveedor puede tener múltiples facturas
- **Centro de Costo → Facturas**: Un centro de costo puede tener múltiples facturas
- **Proyecto → Facturas**: Un proyecto puede tener múltiples facturas asociadas

## Casos de Uso

### Listar Todas las Facturas:
```bash
GET /api/purchases
```

### Ver Detalles de una Factura:
```bash
GET /api/purchases/1
```

### Nota sobre Dashboard Financiero:
Para estadísticas, métricas y análisis financiero, consulta los endpoints del **Dashboard Financiero** en `/api/financial-dashboard/`.

## Códigos de Error

### Errores Comunes:
- **400**: Validación fallida o restricción de negocio
- **404**: Factura no encontrada
- **422**: Datos de entrada inválidos
- **500**: Error interno del servidor

### Ejemplo de Error de Validación:
```json
{
    "success": false,
    "message": "Error creating purchase",
    "error": "The invoice number has already been taken."
}
```

### Ejemplo de Error de Recurso No Encontrado:
```json
{
    "success": false,
    "message": "Error updating purchase",
    "error": "No query results for model [App\\Models\\Purchase] 999"
}
```

## Notas Importantes

1. **Número de Factura Único**: Cada factura debe tener un número único
2. **Proveedor Obligatorio**: Toda factura debe estar asociada a un proveedor
3. **Centro de Costo Obligatorio**: Toda factura debe estar asociada a un centro de costo
4. **Usuario Obligatorio**: Toda factura debe tener un usuario responsable
5. **Proyecto Opcional**: Las facturas pueden o no estar asociadas a un proyecto
6. **Estados**: Las facturas pueden estar pendientes, pagadas o canceladas
7. **Métodos de Pago**: Se admiten 5 métodos de pago diferentes
8. **Estadísticas**: Endpoint separado para obtener métricas generales

## Estados de Facturas

El sistema maneja únicamente 3 estados para las facturas:

### Estados Disponibles:
- **`pendiente`** (default): Factura creada pero no pagada
- **`pagada`**: Factura completamente pagada
- **`cancelada`**: Factura cancelada (no se procesará el pago)

### Transiciones de Estado:
- Una factura `pendiente` puede cambiar a `pagada` o `cancelada`
- Una factura `pagada` o `cancelada` no puede cambiar de estado
- El estado `pendiente` es el estado por defecto al crear una factura

## Integración con Otros Módulos

### Con Proveedores:
- Las facturas requieren un proveedor válido
- Se puede obtener información del proveedor en las consultas

### Con Centros de Costo:
- Las facturas se asocian a centros de costo para control presupuestario
- Permite seguimiento de gastos por categoría

### Con Proyectos:
- Las facturas pueden asociarse a proyectos específicos
- Facilita el control de costos por proyecto

### Con Usuarios:
- Cada factura tiene un usuario responsable
- Permite auditoría y seguimiento de responsabilidades

### Con Clientes:
- Las facturas pueden asociarse a clientes específicos a través de proyectos
- Permite seguimiento de gastos por cliente
- Tipos de clientes: Residencial, Comercial, Industrial
