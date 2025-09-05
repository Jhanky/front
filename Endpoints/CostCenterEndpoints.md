# Endpoints de Centros de Costo y Categorías

## Descripción General

Los centros de costo son entidades organizacionales que permiten agrupar y categorizar gastos para un mejor control financiero. El sistema incluye categorías para organizar lógicamente los centros de costo y facilitar la gestión presupuestaria.

## Base URL

```
/api/cost-centers
/api/cost-center-categories
```

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints de Categorías

### 1. Listar Categorías

**GET** `/api/cost-center-categories`

Obtiene una lista paginada de todas las categorías de centros de costo.

#### Parámetros de Query (opcionales):
- `status` (string): Filtrar por estado (activo, inactivo)
- `search` (string): Búsqueda en nombre o descripción
- `order_by` (string): Campo para ordenar (default: name)
- `order_direction` (string): Dirección del orden (asc, desc, default: asc)
- `per_page` (integer): Resultados por página (default: 15)

#### Ejemplo de Request:
```bash
GET /api/cost-center-categories?status=activo&search=transporte&per_page=10
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "category_id": 1,
                "name": "Transporte",
                "description": "Gastos relacionados con transporte y movilidad",
                "status": "activo",
                "color": "#3B82F6",
                "icon": "car",
                "cost_centers_count": 6,
                "created_at": "2025-09-03T16:44:53.000000Z",
                "updated_at": "2025-09-03T16:44:53.000000Z"
            }
        ],
        "per_page": 10,
        "total": 1
    }
}
```

### 2. Crear Categoría

**POST** `/api/cost-center-categories`

Crea una nueva categoría de centro de costo.

#### Campos Requeridos:
- `name` (string): Nombre de la categoría

#### Campos Opcionales:
- `description` (string): Descripción de la categoría
- `status` (string): Estado (activo, inactivo, default: activo)
- `color` (string): Color hexadecimal (ej: #3B82F6)
- `icon` (string): Nombre del ícono

#### Ejemplo de Request:
```json
{
    "name": "Nueva Categoría",
    "description": "Descripción de la nueva categoría",
    "color": "#EF4444",
    "icon": "star"
}
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Categoría creada exitosamente",
    "data": {
        "category_id": 7,
        "name": "Nueva Categoría",
        "description": "Descripción de la nueva categoría",
        "status": "activo",
        "color": "#EF4444",
        "icon": "star",
        "created_at": "2025-09-03T17:00:00.000000Z",
        "updated_at": "2025-09-03T17:00:00.000000Z"
    }
}
```

### 3. Ver Categoría Específica

**GET** `/api/cost-center-categories/{category_id}`

Obtiene la información detallada de una categoría específica con sus centros de costo asociados.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "category_id": 1,
        "name": "Transporte",
        "description": "Gastos relacionados con transporte y movilidad",
        "status": "activo",
        "color": "#3B82F6",
        "icon": "car",
        "created_at": "2025-09-03T16:44:53.000000Z",
        "updated_at": "2025-09-03T16:44:53.000000Z",
        "cost_centers": [
            {
                "cost_center_id": 1,
                "name": "Peaje",
                "status": "activo",
                "category_id": 1
            },
            {
                "cost_center_id": 2,
                "name": "Gasolina",
                "status": "activo",
                "category_id": 1
            }
        ]
    }
}
```

### 4. Actualizar Categoría

**PUT** `/api/cost-center-categories/{category_id}`

Actualiza la información de una categoría existente.

#### Ejemplo de Request:
```json
{
    "color": "#10B981",
    "icon": "truck"
}
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Categoría actualizada exitosamente",
    "data": {
        "category_id": 1,
        "name": "Transporte",
        "color": "#10B981",
        "icon": "truck",
        "updated_at": "2025-09-03T17:05:00.000000Z"
    }
}
```

### 5. Eliminar Categoría

**DELETE** `/api/cost-center-categories/{category_id}`

Elimina una categoría del sistema.

#### Restricciones:
- Solo se pueden eliminar categorías que no tengan centros de costo asociados

#### Ejemplo de Response (Éxito):
```json
{
    "success": true,
    "message": "Categoría eliminada exitosamente"
}
```

#### Ejemplo de Response (Error):
```json
{
    "success": false,
    "message": "No se puede eliminar la categoría",
    "error": "La categoría tiene 6 centro(s) de costo asociado(s). Elimine los centros de costo primero o contacte al administrador."
}
```

### 6. Estadísticas de Categorías

**GET** `/api/cost-center-categories-statistics`

Obtiene estadísticas generales de todas las categorías.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "total": 6,
        "by_status": [
            {
                "status": "activo",
                "count": 6
            }
        ],
        "top_categories": [
            {
                "category_id": 1,
                "name": "Transporte",
                "color": "#3B82F6",
                "cost_centers_count": 6
            },
            {
                "category_id": 2,
                "name": "Infraestructura",
                "color": "#10B981",
                "cost_centers_count": 5
            }
        ],
        "recent": [
            {
                "category_id": 6,
                "name": "Tecnología",
                "color": "#06B6D4",
                "status": "activo",
                "created_at": "2025-09-03T16:44:53.000000Z"
            }
        ]
    }
}
```

## Endpoints de Centros de Costo

### 1. Listar Centros de Costo

**GET** `/api/cost-centers`

Obtiene una lista paginada de todos los centros de costo con sus categorías.

#### Parámetros de Query (opcionales):
- `status` (string): Filtrar por estado (activo, inactivo)
- `category_id` (integer): Filtrar por categoría específica
- `search` (string): Búsqueda en nombre o descripción
- `order_by` (string): Campo para ordenar (default: name)
- `order_direction` (string): Dirección del orden (asc, desc, default: asc)
- `per_page` (integer): Resultados por página (default: 15)

#### Ejemplo de Request:
```bash
GET /api/cost-centers?category_id=1&status=activo&search=peaje
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "cost_center_id": 1,
                "name": "Peaje",
                "description": "Gastos de peajes en carreteras",
                "status": "activo",
                "category_id": 1,
                "created_at": "2025-09-03T16:47:57.000000Z",
                "updated_at": "2025-09-03T16:47:57.000000Z",
                "category": {
                    "category_id": 1,
                    "name": "Transporte",
                    "color": "#3B82F6",
                    "icon": "car"
                }
            }
        ],
        "per_page": 15,
        "total": 1
    }
}
```

### 2. Crear Centro de Costo

**POST** `/api/cost-centers`

Crea un nuevo centro de costo en el sistema.

#### Campos Requeridos:
- `name` (string): Nombre del centro de costo
- `category_id` (integer): ID de la categoría (debe existir)

#### Campos Opcionales:
- `description` (string): Descripción del centro de costo
- `status` (string): Estado (activo, inactivo, default: activo)

#### Ejemplo de Request:
```json
{
    "name": "Nuevo Centro de Costo",
    "description": "Descripción del nuevo centro de costo",
    "category_id": 1,
    "status": "activo"
}
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Centro de costo creado exitosamente",
    "data": {
        "cost_center_id": 30,
        "name": "Nuevo Centro de Costo",
        "description": "Descripción del nuevo centro de costo",
        "status": "activo",
        "category_id": 1,
        "created_at": "2025-09-03T17:10:00.000000Z",
        "updated_at": "2025-09-03T17:10:00.000000Z",
        "category": {
            "category_id": 1,
            "name": "Transporte",
            "color": "#3B82F6",
            "icon": "car"
        }
    }
}
```

### 3. Ver Centro de Costo Específico

**GET** `/api/cost-centers/{cost_center_id}`

Obtiene la información detallada de un centro de costo específico con su categoría.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "cost_center_id": 1,
        "name": "Peaje",
        "description": "Gastos de peajes en carreteras",
        "status": "activo",
        "category_id": 1,
        "created_at": "2025-09-03T16:47:57.000000Z",
        "updated_at": "2025-09-03T16:47:57.000000Z",
        "category": {
            "category_id": 1,
            "name": "Transporte",
            "color": "#3B82F6",
            "icon": "car"
        }
    }
}
```

### 4. Actualizar Centro de Costo

**PUT** `/api/cost-centers/{cost_center_id}`

Actualiza la información de un centro de costo existente.

#### Ejemplo de Request:
```json
{
    "description": "Descripción actualizada del centro de costo",
    "status": "inactivo"
}
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "message": "Centro de costo actualizado exitosamente",
    "data": {
        "cost_center_id": 1,
        "name": "Peaje",
        "description": "Descripción actualizada del centro de costo",
        "status": "inactivo",
        "category_id": 1,
        "updated_at": "2025-09-03T17:15:00.000000Z",
        "category": {
            "category_id": 1,
            "name": "Transporte",
            "color": "#3B82F6",
            "icon": "car"
        }
    }
}
```

### 5. Eliminar Centro de Costo

**DELETE** `/api/cost-centers/{cost_center_id}`

Elimina un centro de costo del sistema.

#### Restricciones:
- Solo se pueden eliminar centros de costo que no tengan facturas asociadas

#### Ejemplo de Response (Éxito):
```json
{
    "success": true,
    "message": "Centro de costo eliminado exitosamente"
}
```

#### Ejemplo de Response (Error):
```json
{
    "success": false,
    "message": "No se puede eliminar el centro de costo",
    "error": "El centro de costo tiene 3 factura(s) asociada(s). Elimine las facturas primero o contacte al administrador."
}
```

### 6. Estadísticas de Centros de Costo

**GET** `/api/cost-centers-statistics`

Obtiene estadísticas generales de todos los centros de costo.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "total": 30,
        "by_status": [
            {
                "status": "activo",
                "count": 28
            },
            {
                "status": "inactivo",
                "count": 2
            }
        ],
        "by_category": [
            {
                "category_id": 1,
                "count": 6,
                "category": {
                    "id": 1,
                    "name": "Transporte",
                    "color": "#3B82F6"
                }
            },
            {
                "category_id": 2,
                "count": 5,
                "category": {
                    "id": 2,
                    "name": "Infraestructura",
                    "color": "#10B981"
                }
            }
        ],
        "recent": [
            {
                "cost_center_id": 30,
                "name": "Nuevo Centro de Costo",
                "category_id": 1,
                "status": "activo",
                "created_at": "2025-09-03T17:10:00.000000Z",
                "category": {
                    "id": 1,
                    "name": "Transporte",
                    "color": "#3B82F6"
                }
            }
        ]
    }
}
```

## Estructura de Datos

### Campos de la Categoría:

**Información Básica:**
- `category_id` (integer): ID único de la categoría
- `name` (string): Nombre de la categoría
- `description` (text): Descripción de la categoría
- `status` (enum): Estado (activo, inactivo)

**Identificación Visual:**
- `color` (string): Color hexadecimal para identificación visual
- `icon` (string): Nombre del ícono para la interfaz

### Campos del Centro de Costo:

**Información Básica:**
- `cost_center_id` (integer): ID único del centro de costo
- `name` (string): Nombre del centro de costo
- `description` (text): Descripción del centro de costo
- `status` (enum): Estado (activo, inactivo)

**Relaciones:**
- `category_id` (integer): ID de la categoría asociada
- `category` (object): Objeto de la categoría (cuando se carga la relación)

## Categorías Predefinidas

### 1. 🚗 Transporte (#3B82F6)
- Peaje, Gasolina, Buses, Indrive, Mantenimiento Vehículos, Seguros Vehículos

### 2. 🏢 Infraestructura (#10B981)
- Electricidad, Agua, Internet, Alquiler, Limpieza

### 3. 👥 Recursos Humanos (#F59E0B)
- Salarios, Capacitación, Beneficios, Equipos de Trabajo

### 4. 🛠️ Operaciones (#8B5CF6)
- Herramientas, Materiales, Equipos de Seguridad, Mantenimiento Equipos

### 5. 📢 Marketing (#EC4899)
- Publicidad, Material Promocional

### 6. 💻 Tecnología (#06B6D4)
- Software, Hardware, Servicios Cloud

## Filtros y Búsquedas

### Filtros Disponibles:
- **Por estado**: `?status=activo`
- **Por categoría**: `?category_id=1`
- **Búsqueda general**: `?search=peaje`

### Búsqueda Inteligente:
La búsqueda incluye:
- Nombre del centro de costo
- Descripción del centro de costo
- Nombre de la categoría

### Ordenamiento:
- **Campo**: `?order_by=name` (default: name)
- **Dirección**: `?order_by=desc` (default: asc)

## Paginación

Por defecto, los endpoints de listado devuelven 15 resultados por página. Se puede personalizar con el parámetro `per_page`.

## Códigos de Error

### Errores Comunes:
- **400**: Validación fallida o restricción de negocio
- **404**: Recurso no encontrado
- **422**: Datos de entrada inválidos
- **500**: Error interno del servidor

### Ejemplo de Error de Validación:
```json
{
    "success": false,
    "message": "Error al crear centro de costo",
    "error": "The category id field is required."
}
```

## Relaciones

### Relaciones Principales:
- **Categoría → Centros de Costo**: Una categoría puede tener muchos centros de costo
- **Centro de Costo → Categoría**: Cada centro de costo pertenece a una categoría
- **Centro de Costo → Facturas**: Los centros de costo pueden tener facturas asociadas

### Relaciones Heredadas:
- **Facturas → Proyectos**: A través de las facturas se pueden rastrear proyectos
- **Facturas → Proveedores**: A través de las facturas se pueden rastrear proveedores

## Notas Importantes

1. **Campos Requeridos**: Para crear un centro de costo se requiere `name` y `category_id`
2. **Categoría Obligatoria**: Todo centro de costo debe pertenecer a una categoría
3. **Eliminación Restrictiva**: No se pueden eliminar categorías o centros de costo con dependencias
4. **Estados**: Las categorías y centros de costo pueden estar activos o inactivos
5. **Identificación Visual**: Cada categoría tiene un color e ícono único
6. **Búsqueda Avanzada**: Filtros por múltiples criterios
7. **Estadísticas**: Información agregada para análisis y reportes
8. **Paginación**: Control de resultados para mejor rendimiento

## Casos de Uso

### Crear Centro de Costo Básico:
```bash
POST /api/cost-centers
{
    "name": "Centro Simple",
    "category_id": 1
}
```

### Crear Centro de Costo Completo:
```bash
POST /api/cost-centers
{
    "name": "Centro Completo",
    "description": "Descripción detallada",
    "category_id": 2,
    "status": "activo"
}
```

### Filtrar Centros de Costo por Categoría:
```bash
GET /api/cost-centers?category_id=1&status=activo
```

### Buscar Centros de Costo:
```bash
GET /api/cost-centers?search=peaje&per_page=10
```

### Obtener Estadísticas:
```bash
GET /api/cost-centers-statistics
GET /api/cost-center-categories-statistics
```
