# Endpoints de Proveedores

## Descripción General

Los proveedores son entidades que suministran productos, materiales o servicios para los proyectos solares. El sistema permite gestionar información completa de proveedores incluyendo datos de contacto, ubicación, categorías y términos comerciales.

## Base URL

```
/api/suppliers
```

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Proveedores

**GET** `/api/suppliers`

Obtiene una lista paginada de todos los proveedores con filtros y búsqueda.

#### Parámetros de Query (opcionales):
- `status` (string): Filtrar por estado (activo, inactivo, suspendido)
- `category` (string): Filtrar por categoría (equipos, materiales, servicios, general)
- `city` (string): Filtrar por ciudad
- `department` (string): Filtrar por departamento
- `search` (string): Búsqueda en nombre, tax_id, contacto o ciudad
- `order_by` (string): Campo para ordenar (default: name)
- `order_direction` (string): Dirección del orden (asc, desc, default: asc)
- `per_page` (integer): Resultados por página (default: 15)

#### Ejemplo de Request:
```bash
GET /api/suppliers?status=activo&category=equipos&search=jinko&per_page=10
```

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "supplier_id": 1,
                "name": "Jinko Solar Colombia",
                "tax_id": "900123456-7",
                "address": "Calle 123 #45-67, Zona Industrial",
                "phone": "+57 1 234 5678",
                "email": "ventas@jinkosolar.co",
                "contact_name": "María González",
                "contact_phone": "+57 300 123 4567",
                "contact_email": "mgonzalez@jinkosolar.co",
                "city": "Bogotá",
                "department": "Cundinamarca",
                "country": "Colombia",
                "postal_code": null,
                "description": "Distribuidor oficial de paneles solares Jinko Solar",
                "website": "www.jinkosolar.co",
                "status": "activo",
                "category": "equipos",
                "credit_limit": "500000000.00",
                "payment_terms": 30,
                "notes": null,
                "created_at": "2025-09-03T15:22:25.000000Z",
                "updated_at": "2025-09-03T15:22:25.000000Z"
            }
        ],
        "per_page": 10,
        "total": 1
    }
}
```

### 2. Crear Proveedor

**POST** `/api/suppliers`

Crea un nuevo proveedor en el sistema.

#### Campos Requeridos:
- `name` (string): Nombre del proveedor
- `tax_id` (string): NIT/RUT/Identificación fiscal (único)

#### Campos Opcionales:
- `address` (string): Dirección completa
- `phone` (string): Teléfono principal
- `email` (string): Email principal
- `contact_name` (string): Nombre del contacto principal
- `contact_phone` (string): Teléfono del contacto
- `contact_email` (string): Email del contacto
- `city` (string): Ciudad
- `department` (string): Departamento/Estado
- `country` (string): País (default: Colombia)
- `postal_code` (string): Código postal
- `description` (string): Descripción del proveedor
- `website` (string): Sitio web
- `status` (string): Estado (activo, inactivo, suspendido, default: activo)
- `category` (string): Categoría (equipos, materiales, servicios, general, default: general)
- `credit_limit` (numeric): Límite de crédito
- `payment_terms` (integer): Términos de pago en días
- `notes` (string): Notas adicionales

#### Ejemplo de Request:
```json
{
    "name": "Nuevo Proveedor Solar",
    "tax_id": "900111222-3",
    "address": "Calle Principal #123",
    "phone": "+57 1 111 1111",
    "email": "info@nuevoproveedor.co",
    "contact_name": "Juan Pérez",
    "contact_phone": "+57 300 111 1111",
    "city": "Bogotá",
    "department": "Cundinamarca",
    "category": "equipos",
    "credit_limit": 100000000,
    "payment_terms": 30
}
```

#### Ejemplo de Response:
```json
{
    "message": "Proveedor creado",
    "supplier": {
        "supplier_id": 6,
        "name": "Nuevo Proveedor Solar",
        "tax_id": "900111222-3",
        "address": "Calle Principal #123",
        "phone": "+57 1 111 1111",
        "email": "info@nuevoproveedor.co",
        "contact_name": "Juan Pérez",
        "contact_phone": "+57 300 111 1111",
        "city": "Bogotá",
        "department": "Cundinamarca",
        "country": "Colombia",
        "category": "equipos",
        "credit_limit": "100000000.00",
        "payment_terms": 30,
        "created_at": "2025-09-03T15:30:00.000000Z",
        "updated_at": "2025-09-03T15:30:00.000000Z"
    }
}
```

### 3. Ver Proveedor Específico

**GET** `/api/suppliers/{supplier_id}`

Obtiene la información detallada de un proveedor específico.

#### Ejemplo de Response:
```json
{
    "supplier_id": 1,
    "name": "Jinko Solar Colombia",
    "tax_id": "900123456-7",
    "address": "Calle 123 #45-67, Zona Industrial",
    "phone": "+57 1 234 5678",
    "email": "ventas@jinkosolar.co",
    "contact_name": "María González",
    "contact_phone": "+57 300 123 4567",
    "contact_email": "mgonzalez@jinkosolar.co",
    "city": "Bogotá",
    "department": "Cundinamarca",
    "country": "Colombia",
    "postal_code": null,
    "description": "Distribuidor oficial de paneles solares Jinko Solar",
    "website": "www.jinkosolar.co",
    "status": "activo",
    "category": "equipos",
    "credit_limit": "500000000.00",
    "payment_terms": 30,
    "notes": null,
    "created_at": "2025-09-03T15:22:25.000000Z",
    "updated_at": "2025-09-03T15:22:25.000000Z"
}
```

### 4. Actualizar Proveedor

**PUT** `/api/suppliers/{supplier_id}`

Actualiza la información de un proveedor existente.

#### Campos Actualizables:
Todos los campos son opcionales, solo se actualizan los enviados.

#### Ejemplo de Request:
```json
{
    "status": "suspendido",
    "notes": "Proveedor suspendido temporalmente por problemas de calidad"
}
```

#### Ejemplo de Response:
```json
{
    "message": "Proveedor actualizado",
    "supplier": {
        "supplier_id": 1,
        "name": "Jinko Solar Colombia",
        "status": "suspendido",
        "notes": "Proveedor suspendido temporalmente por problemas de calidad",
        "updated_at": "2025-09-03T15:35:00.000000Z"
    }
}
```

### 5. Eliminar Proveedor

**DELETE** `/api/suppliers/{supplier_id}`

Elimina un proveedor del sistema.

#### Restricciones:
- Solo se pueden eliminar proveedores que no tengan facturas asociadas
- Si tiene facturas, se debe eliminar primero las facturas

#### Ejemplo de Response (Éxito):
```json
{
    "message": "Proveedor eliminado"
}

```
#### Ejemplo de Response (Error):
```json
{
    "message": "No se puede eliminar el proveedor",
    "error": "El proveedor tiene 5 factura(s) asociada(s). Elimine las facturas primero o contacte al administrador."
}
```

### 6. Estadísticas de Proveedores

**GET** `/api/suppliers-statistics`

Obtiene estadísticas generales de todos los proveedores.

#### Ejemplo de Response:
```json
{
    "success": true,
    "data": {
        "total": 5,
        "by_status": [
            {
                "status": "activo",
                "count": 4
            },
            {
                "status": "suspendido",
                "count": 1
            }
        ],
        "by_category": [
            {
                "category": "equipos",
                "count": 2
            },
            {
                "category": "materiales",
                "count": 1
            },
            {
                "category": "servicios",
                "count": 1
            },
            {
                "category": "general",
                "count": 1
            }
        ],
        "by_location": [
            {
                "department": "Cundinamarca",
                "count": 2
            },
            {
                "department": "Antioquia",
                "count": 1
            },
            {
                "department": "Valle del Cauca",
                "count": 1
            },
            {
                "department": "Atlántico",
                "count": 1
            }
        ],
        "recent": [
            {
                "supplier_id": 5,
                "name": "Energía Verde Ltda",
                "category": "general",
                "status": "activo",
                "created_at": "2025-09-03T15:22:25.000000Z"
            }
        ]
    }
}
```

## Estructura de Datos

### Campos del Proveedor:

**Información Básica:**
- `supplier_id` (integer): ID único del proveedor
- `name` (string): Nombre del proveedor
- `tax_id` (string): NIT/RUT/Identificación fiscal (único)
- `status` (enum): Estado (activo, inactivo, suspendido)
- `category` (enum): Categoría (equipos, materiales, servicios, general)

**Información de Contacto:**
- `phone` (string): Teléfono principal
- `email` (string): Email principal
- `contact_name` (string): Nombre del contacto principal
- `contact_phone` (string): Teléfono del contacto
- `contact_email` (string): Email del contacto

**Ubicación:**
- `address` (string): Dirección completa
- `city` (string): Ciudad
- `department` (string): Departamento/Estado
- `country` (string): País
- `postal_code` (string): Código postal

**Información Comercial:**
- `description` (text): Descripción del proveedor
- `website` (string): Sitio web
- `credit_limit` (decimal): Límite de crédito
- `payment_terms` (integer): Términos de pago en días
- `notes` (text): Notas adicionales

## Filtros y Búsquedas

### Filtros Disponibles:
- **Por estado**: `?status=activo`
- **Por categoría**: `?category=equipos`
- **Por ciudad**: `?city=Bogotá`
- **Por departamento**: `?department=Cundinamarca`
- **Búsqueda general**: `?search=jinko`

### Búsqueda Inteligente:
La búsqueda incluye:
- Nombre del proveedor
- NIT/RUT
- Nombre del contacto
- Ciudad

### Ordenamiento:
- **Campo**: `?order_by=name` (default: name)
- **Dirección**: `?order_direction=desc` (default: asc)

## Paginación

Por defecto, los endpoints de listado devuelven 15 resultados por página. Se puede personalizar con el parámetro `per_page`.

## Códigos de Error

### Errores Comunes:
- **400**: Validación fallida o restricción de negocio
- **404**: Proveedor no encontrado
- **422**: Datos de entrada inválidos
- **500**: Error interno del servidor

### Ejemplo de Error de Validación:
```json
{
    "message": "Error al crear proveedor",
    "error": "The tax_id has already been taken."
}
```

## Relaciones

### Relaciones Principales:
- **purchases**: Facturas/compras asociadas al proveedor
- **cost_centers**: Centros de costo (si aplica)

### Relaciones Heredadas:
- **purchases.items**: Items de las facturas del proveedor
- **purchases.project**: Proyectos asociados a las compras

## Notas Importantes

1. **Campos Requeridos**: Solo `name` y `tax_id` son obligatorios para crear un proveedor
2. **Tax ID Único**: El NIT/RUT debe ser único en el sistema
3. **Eliminación Restrictiva**: No se pueden eliminar proveedores con facturas asociadas
4. **Estados**: Los proveedores pueden estar activos, inactivos o suspendidos
5. **Categorías**: Clasificación por tipo de suministro (equipos, materiales, servicios, general)
6. **Límites de Crédito**: Campo opcional para control financiero
7. **Términos de Pago**: Días para el pago de facturas
8. **Búsqueda Avanzada**: Filtros por múltiples criterios
9. **Estadísticas**: Información agregada para análisis y reportes
10. **Paginación**: Control de resultados para mejor rendimiento

## Casos de Uso

### Crear Proveedor Básico:
```bash
POST /api/suppliers
{
    "name": "Proveedor Simple",
    "tax_id": "900999888-7"
}
```

### Crear Proveedor Completo:
```bash
POST /api/suppliers
{
    "name": "Proveedor Completo",
    "tax_id": "900777666-5",
    "address": "Dirección completa",
    "phone": "+57 1 777 7777",
    "email": "info@completo.co",
    "contact_name": "Contacto Principal",
    "category": "equipos",
    "credit_limit": 50000000,
    "payment_terms": 30
}
```

### Filtrar Proveedores Activos de Equipos:
```bash
GET /api/suppliers?status=activo&category=equipos
```

### Buscar Proveedor por NIT:
```bash
GET /api/suppliers?search=900123456
```
