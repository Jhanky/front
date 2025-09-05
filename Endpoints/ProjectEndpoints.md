# Endpoints de Proyectos

## Descripción General

Los proyectos se crean automáticamente cuando una cotización cambia su estado a "Contratada". Cada proyecto mantiene una relación directa con la cotización original, el cliente y la ubicación.

## Base URL

```
/api/projects
```

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Proyectos

**GET** `/api/projects`

Obtiene una lista paginada de todos los proyectos con sus relaciones.

#### Parámetros de Query (opcionales):
- `status` (string): Filtrar por nombre del estado
- `client_id` (integer): Filtrar por ID del cliente
- `search` (string): Búsqueda por nombre del proyecto o nombre del cliente
- `page` (integer): Número de página para paginación

#### Ejemplo de Request:
```bash
GET /api/projects?status=Activo&client_id=1&search=solar&page=1
```

#### Ejemplo de Response:
```json
[
 {
        "id": 2,
        "nombre_proyecto": "Jhanky",
        "codigo_proyecto": "PROY-000002",
        "estado": {
            "status_id": 1,
            "name": "Activo",
            "description": "Proyecto en funcionamiento",
            "color": "#1BF51A",
            "is_active": true,
            "created_at": "2025-09-03T13:35:35.000000Z",
            "updated_at": "2025-09-03T13:35:35.000000Z"
        },
        "fecha_inicio": "2025-09-03",
        "fecha_fin": null,
        "cotizacion_id": 8,
        "cliente": {
            "client_id": 1,
            "nombre": "Jhan Martinez",
            "nic": "1007795243",
            "departamento": "Atlántico",
            "ciudad": "Galapa",
            "telefono": null,
            "email": null
        },
        "ubicacion": {
            "location_id": 2,
            "departamento": "Antioquia",
            "municipio": "Medellín",
            "radiacion": 1307
        },
        "paneles": {
            "Jinko Solar": {
                "cantidad": 45,
                "modelo": "JKM450M-72",
                "potencia": "450 W",
                "tipo": "Bifacial",
                "ficha_tecnica": null,
                "precio_unitario": "1150000.00",
                "valor_total": "54337500.00"
            }
        },
        "inversores": {
            "Fronius": {
                "cantidad": 2,
                "modelo": "Primo 8.0-1",
                "potencia": "8000 W",
                "ficha_tecnica": null,
                "precio_unitario": "9800000.00",
                "valor_total": "20580000.00"
            }
        },
        "baterias": [],
        "informacion_tecnica": {
            "tipo_sistema": "On-grid",
            "potencia_total": "20.00",
            "cantidad_paneles": 45,
            "presupuesto": 130016052.99,
            "notas": "Proyecto creado automáticamente al contratar la cotización #8. Pendiente visita técnica para geolocalización."
        }
    }
]
```

#### Estructura de la Respuesta:

**Campos Principales:**
- `id` (integer): ID único del proyecto
- `nombre_proyecto` (string): Nombre del proyecto (heredado de la cotización)
- `codigo_proyecto` (string): Código único en formato "PROY-000002"
- `estado` (object): Información completa del estado del proyecto
- `fecha_inicio` (string): Fecha de inicio del proyecto (YYYY-MM-DD)
- `fecha_fin` (string|null): Fecha de finalización real del proyecto
- `cotizacion_id` (integer): ID de la cotización asociada

**Información del Cliente:**
- `cliente` (object): Datos completos del cliente del proyecto
  - `client_id` (integer): ID único del cliente
  - `nombre` (string): Nombre completo del cliente
  - `nic` (string): Número de identidad del cliente
  - `departamento` (string): Departamento del cliente
  - `ciudad` (string): Ciudad del cliente
  - `telefono` (string|null): Teléfono de contacto (opcional)
  - `email` (string|null): Correo electrónico (opcional)

**Información de Ubicación:**
- `ubicacion` (object): Datos de la ubicación del proyecto
  - `location_id` (integer): ID único de la ubicación
  - `departamento` (string): Departamento de la ubicación
  - `municipio` (string): Municipio de la ubicación
  - `radiacion` (decimal): Radiación solar en kWh/m²/día

**Productos del Sistema:**
- `paneles` (object): Paneles solares con detalles técnicos y precios
- `inversores` (object): Inversores con especificaciones y costos
- `baterias` (object): Baterías del sistema (si aplica)

**Información Técnica:**
- `tipo_sistema` (string): Tipo de sistema (On-grid, Off-grid, Híbrido)
- `potencia_total` (string): Potencia total en kWp
- `cantidad_paneles` (integer): Número total de paneles
- `presupuesto` (string): **Valor total de la cotización** (campo `total_value` de la cotización asociada)
- `notas` (string): Notas adicionales del proyecto

**Detalles de Productos:**
Cada producto incluye:
- `cantidad` (integer): Cantidad del producto
- `modelo` (string): Modelo específico
- `potencia`/`capacidad` (string): Potencia en W o capacidad en Ah
- `tipo`/`voltaje` (string): Tipo de panel o voltaje de batería
- `ficha_tecnica` (string|null): URL de la ficha técnica
- `precio_unitario` (string): Precio por unidad
- `valor_total` (string): Valor total del producto

#### Notas Importantes:

- **Creación Automática**: Los proyectos se crean automáticamente cuando una cotización cambia su estado a "Contratada"
- **Presupuesto**: El campo `presupuesto` corresponde al valor total de la cotización (`total_value`), no al campo `budget` del proyecto
- **Fichas Técnicas**: Las URLs de las fichas técnicas se obtienen de los productos asociados a la cotización
- **Relaciones**: Cada proyecto mantiene la relación completa con su cotización, productos y estado



### 2. Ver Proyecto Específico

**GET** `/api/projects/{project_id}`

Obtiene la información detallada de un proyecto específico.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "project_id": 1,
        "quotation_id": 5,
        "client_id": 3,
        "location_id": 2,
        "status_id": 2,
        "project_name": "Instalación Solar Residencial",
        "start_date": "2025-09-03",
        "estimated_end_date": "2025-10-15",
        "actual_end_date": null,
        "project_manager_id": 1,
        "budget": 45000000,
        "notes": "Proyecto creado automáticamente al contratar la cotización #5",
        "latitude": 13.6920,
        "longitude": -89.2182,
        "installation_address": "Colonia Escalón, San Salvador",
        "created_at": "2025-09-03T13:32:45.000000Z",
        "updated_at": "2025-09-03T13:32:45.000000Z",
        "quotation": {
            "quotation_id": 5,
            "project_name": "Instalación Solar Residencial",
            "system_type": "On-grid",
            "power_kwp": 5.0,
            "panel_count": 12,
            "total_value": 45000000
        },
        "client": {
            "client_id": 3,
            "name": "María González",
            "nic": "12345678-9",
            "department": "San Salvador",
            "city": "San Salvador"
        },
        "location": {
            "location_id": 2,
            "department": "San Salvador",
            "municipality": "San Salvador",
            "radiation": 1450.50
        },
        "status": {
            "status_id": 1,
            "name": "Activo",
            "color": "#10B981"
        },
        "project_manager": {
            "id": 1,
            "name": "Juan Pérez",
            "email": "juan@energy4cero.com"
        }
    }
}
```

### 3. Actualizar Proyecto

**PUT** `/api/projects/{project_id}`

Actualiza la información de un proyecto existente.

#### Request Body:
```json
{
    "status_id": 3,
    "start_date": "2025-09-05",
    "estimated_end_date": "2025-10-20",
    "project_manager_id": 2,
    "budget": 48000000,
    "notes": "Proyecto actualizado con nueva fecha de inicio",
    "latitude": 13.6920,
    "longitude": -89.2182,
    "installation_address": "Colonia Escalón, San Salvador"
}
```

#### Validaciones:
- `status_id` (integer, opcional): Debe existir en la tabla project_statuses
- `start_date` (date, opcional): Fecha de inicio
- `estimated_end_date` (date, opcional): Debe ser posterior a start_date
- `actual_end_date` (date, opcional): Debe ser posterior a start_date
- `project_manager_id` (integer, opcional): Debe existir en la tabla users
- `budget` (numeric, opcional, mínimo 0): Presupuesto del proyecto
- `notes` (string, opcional): Notas adicionales
- `latitude` (numeric, opcional, entre -90 y 90): Coordenada de latitud
- `longitude` (numeric, opcional, entre -180 y 180): Coordenada de longitud
- `installation_address` (string, opcional): Dirección específica de instalación

### 4. Eliminar Proyecto

**DELETE** `/api/projects/{project_id}`

Elimina un proyecto (solo si está en estado "Iniciado" o "Cancelado").

#### Restricciones:
- Solo se pueden eliminar proyectos en estado "Iniciado" o "Cancelado"
- Los proyectos en otros estados no pueden ser eliminados

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Proyecto eliminado exitosamente"
}
```

### 5. Cambiar Estado del Proyecto

**PATCH** `/api/projects/{project_id}/status`

Cambia el estado de un proyecto específico.

#### Request Body:
```json
{
    "status_id": 2
}
```

#### Validaciones:
- `status_id` (integer, requerido): Debe existir en la tabla project_statuses

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Estado del proyecto cambiado de 'Activo' a 'Desactivo'",
    "data": {
        "project_id": 1,
        "status_id": 2,
        "status": {
            "status_id": 2,
            "name": "Desactivo",
            "color": "#EF4444"
        }
    }
}
```

### 6. Actualizar Geolocalización (Visita Técnica)

**PATCH** `/api/projects/{project_id}/geolocation`

Actualiza la geolocalización del proyecto después de realizar una visita técnica.

#### Request Body:
```json
{
    "latitude": 13.6920,
    "longitude": -89.2182,
    "installation_address": "Colonia Escalón, Calle Principal #123, San Salvador",
    "notes": "Visita técnica realizada. Ubicación exacta confirmada. Acceso vehicular disponible. Techo en buen estado para instalación.",
    "visit_date": "2025-09-05"
}
```

#### Validaciones:
- `latitude` (numeric, requerido, entre -90 y 90): Coordenada de latitud
- `longitude` (numeric, requerido, entre -180 y 180): Coordenada de longitud
- `installation_address` (string, requerido, máximo 500 caracteres): Dirección específica de instalación
- `notes` (string, opcional): Notas de la visita técnica
- `visit_date` (date, opcional): Fecha de la visita técnica

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Geolocalización del proyecto actualizada exitosamente después de la visita técnica",
    "data": {
        "project_id": 1,
        "latitude": 13.6920,
        "longitude": -89.2182,
        "installation_address": "Colonia Escalón, Calle Principal #123, San Salvador",
        "updated_at": "2025-09-05T15:30:00.000000Z"
    }
}
```

**Nota:** Las notas de la visita técnica se agregan automáticamente al historial del proyecto con timestamp.

### 7. Estadísticas de Proyectos

**GET** `/api/projects-statistics`

Obtiene estadísticas generales de todos los proyectos.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "total": 15,
        "by_status": [
            {
                "status_id": 1,
                "name": "Activo",
                "color": "#10B981",
                "projects_count": 8
            },
            {
                "status_id": 2,
                "name": "Desactivo",
                "color": "#EF4444",
                "projects_count": 2
            }
        ],
        "recent": [
            {
                "project_id": 15,
                "project_name": "Proyecto Solar Comercial",
                "client": {
                    "client_id": 8,
                    "name": "Empresa ABC"
                },
                "status": {
                    "status_id": 1,
                    "name": "Activo",
                    "color": "#10B981"
                },
                "created_at": "2025-09-03T10:30:00.000000Z"
            }
        ]
    }
}
```

## Estados de Proyecto

### Estados Disponibles:
1. **Activo** (ID: 1) - Proyecto en ejecución o activo
2. **Desactivo** (ID: 2) - Proyecto pausado, cancelado o inactivo

## Creación Automática

Los proyectos se crean automáticamente cuando:
- Una cotización cambia su estado a "Contratada" (status_id = 5)
- Se ejecuta el método `updateStatus` del `QuotationController`
- Se heredan automáticamente los datos de la cotización:
  - `project_name` (nombre del proyecto)
  - `client_id` (cliente)
  - `quotation_id` (cotización original)
  - `project_manager_id` (usuario que creó la cotización)
  - `start_date` (fecha actual)
  - `notes` (nota automática indicando pendiente visita técnica)

**Nota:** Al momento de la creación, los campos de geolocalización (`latitude`, `longitude`, `installation_address`) quedan vacíos y se actualizan posteriormente mediante el endpoint de visita técnica.

**Endpoint de Activación:** `PATCH /api/quotations/{id}/status` con `status_id: 5`

## Campos de Georreferenciación

### Coordenadas:
- `latitude`: Latitud del proyecto (decimal, precisión 8,6) - **Se actualiza en visita técnica**
- `longitude`: Longitud del proyecto (decimal, precisión 9,6) - **Se actualiza en visita técnica**

### Dirección:
- `installation_address`: Dirección específica de instalación (puede ser diferente a la del cliente) - **Se actualiza en visita técnica**

### Flujo de Actualización:
1. **Creación del proyecto**: Los campos de geolocalización quedan vacíos
2. **Visita técnica**: Se obtienen coordenadas exactas y dirección específica
3. **Actualización**: Se usa el endpoint `/api/projects/{project_id}/geolocation`
4. **Historial**: Las notas de la visita se agregan automáticamente al proyecto

## Relaciones

### Relaciones Principales:
- **quotation**: Cotización original del proyecto
- **client**: Cliente del proyecto
- **location**: Ubicación geográfica (departamento, municipio, radiación)
- **status**: Estado actual del proyecto
- **project_manager**: Usuario responsable del proyecto

### Relaciones Heredadas:
- **quotation.usedProducts**: Productos utilizados (paneles, inversores, baterías)
- **quotation.items**: Items adicionales (materiales, mano de obra, etc.)
- **client.quotations**: Todas las cotizaciones del cliente
- **location.projects**: Todos los proyectos en esa ubicación

## Filtros y Búsquedas

### Filtros Disponibles:
- **Por estado**: `?status=En%20Progreso`
- **Por cliente**: `?client_id=3`
- **Por búsqueda**: `?search=solar`
- **Paginación**: `?page=1`

### Búsqueda Inteligente:
La búsqueda incluye:
- Nombre del proyecto
- Nombre del cliente
- NIC del cliente

## Paginación

Por defecto, los endpoints de listado devuelven 15 resultados por página. Se puede personalizar con el parámetro `page`.

## Códigos de Error

### Errores Comunes:
- **400**: Validación fallida o restricción de negocio
- **404**: Proyecto no encontrado
- **422**: Datos de entrada inválidos
- **500**: Error interno del servidor

### Ejemplo de Error:
```json
{
    "success": false,
    "message": "Solo se pueden crear proyectos de cotizaciones contratadas"
}
```

## Notas Importantes

1. **Creación Automática**: Los proyectos se crean automáticamente al cambiar cotización a estado "Contratada"
2. **Sin Duplicación**: No puede existir más de un proyecto por cotización
3. **Estados Restrictivos**: Solo se pueden eliminar proyectos en estado "Desactivo"
4. **Georreferenciación**: Las coordenadas se actualizan mediante visita técnica usando endpoint específico
5. **Trazabilidad**: Mantiene relación completa con cotización original
6. **Flexibilidad**: Permite ubicación específica diferente a la del cliente
7. **Historial de Visitas**: Las notas de visitas técnicas se agregan automáticamente con timestamp
8. **Flujo de Trabajo**: Cotización → Estado "Contratada" → Proyecto → Visita Técnica → Geolocalización
9. **Activación Directa**: Se activa mediante `PATCH /api/quotations/{id}/status` con `status_id: 5`
