# Inverter Endpoints

Documentación de los endpoints para el servicio de gestión de inversores solares.

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Inversores

**GET** `/api/inverters`

Obtiene una lista paginada de todos los inversores solares disponibles.

#### Parámetros de Consulta (Opcionales)

- `search` (string): Buscar por marca o modelo
- `system_type` (string): Filtrar por tipo de sistema (On-grid, Off-grid, Híbrido)
- `grid_type` (string): Filtrar por tipo de red (Monofásico 110V, Bifásico 220V, Trifásico 220V, Trifásico 440V)
- `sort_by` (string): Campo para ordenar (brand, model, power, price, created_at)
- `sort_order` (string): Orden (asc, desc)
- `per_page` (integer): Elementos por página (default: 15)

#### Ejemplo de Request

```bash
GET /api/inverters?system_type=On-grid&grid_type=Monofásico 110V&power_min=3000&sort_by=power&sort_order=desc
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "inverter_id": 1,
                "brand": "SMA",
                "model": "Sunny Boy 3.0",
                "power": 3000.00,
                "system_type": "On-grid",
                "grid_type": "Monofásico 110V",
                "technical_sheet_url": "https://example.com/tech-sheet.pdf",
                "price": 4500000.00,
                "created_at": "2025-09-01T10:00:00.000000Z",
                "updated_at": "2025-09-01T10:00:00.000000Z"
            }
        ],
        "total": 20,
        "per_page": 15,
        "last_page": 2
    },
    "message": "Inversores obtenidos exitosamente"
}
```

### 2. Obtener Inversor por ID

**GET** `/api/inverters/{id}`

Obtiene la información detallada de un inversor específico.

#### Parámetros de Ruta

- `id` (integer): ID del inversor

#### Ejemplo de Request

```bash
GET /api/inverters/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "inverter_id": 1,
        "brand": "SMA",
        "model": "Sunny Boy 3.0",
        "power": 3000.00,
        "system_type": "On-grid",
        "grid_type": "Monofásico 110V",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 4500000.00,
        "created_at": "2025-09-01T10:00:00.000000Z",
        "updated_at": "2025-09-01T10:00:00.000000Z"
    },
    "message": "Inversor obtenido exitosamente"
}
```

### 3. Crear Nuevo Inversor

**POST** `/api/inverters`

Crea un nuevo inversor solar.

#### Parámetros del Body

- `brand` (string, required): Marca del inversor
- `model` (string, required): Modelo del inversor
- `power` (numeric, required): Potencia en W
- `system_type` (string, required): Tipo de sistema (On-grid, Off-grid, Híbrido)
- `grid_type` (string, required): Tipo de red (Monofásico 110V, Bifásico 220V, Trifásico 220V, Trifásico 440V)
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, required): Precio en COP

#### Ejemplo de Request

```bash
POST /api/inverters
Content-Type: application/json

{
    "brand": "SMA",
    "model": "Sunny Boy 5.0",
    "power": 5000.00,
    "system_type": "On-grid",
    "grid_type": "Bifásico 220V",
    "technical_sheet_url": "https://example.com/tech-sheet-5kw.pdf",
    "price": 6500000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "inverter_id": 21,
        "brand": "SMA",
        "model": "Sunny Boy 5.0",
        "power": 5000.00,
        "system_type": "On-grid",
        "grid_type": "Bifásico 220V",
        "technical_sheet_url": "https://example.com/tech-sheet-5kw.pdf",
        "price": 6500000.00,
        "created_at": "2025-09-01T15:30:00.000000Z",
        "updated_at": "2025-09-01T15:30:00.000000Z"
    },
    "message": "Inversor creado exitosamente"
}
```

### 4. Actualizar Inversor

**PUT** `/api/inverters/{id}`

Actualiza la información de un inversor existente.

#### Parámetros de Ruta

- `id` (integer): ID del inversor

#### Parámetros del Body

- `brand` (string, optional): Marca del inversor
- `model` (string, optional): Modelo del inversor
- `power` (numeric, optional): Potencia en W
- `system_type` (string, optional): Tipo de sistema
- `grid_type` (string, optional): Tipo de red
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, optional): Precio en COP

#### Ejemplo de Request

```bash
PUT /api/inverters/1
Content-Type: application/json

{
    "power": 3500.00,
    "price": 5000000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "inverter_id": 1,
        "brand": "SMA",
        "model": "Sunny Boy 3.0",
        "power": 3500.00,
        "system_type": "On-grid",
        "grid_type": "Monofásico 110V",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 5000000.00,
        "updated_at": "2025-09-01T16:00:00.000000Z"
    },
    "message": "Inversor actualizado exitosamente"
}
```

### 5. Eliminar Inversor

**DELETE** `/api/inverters/{id}`

Elimina un inversor solar.

#### Parámetros de Ruta

- `id` (integer): ID del inversor

#### Ejemplo de Request

```bash
DELETE /api/inverters/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "message": "Inversor eliminado exitosamente"
}
```

### 6. Obtener Estadísticas de Inversores

**GET** `/api/inverters/stats`

Obtiene estadísticas generales de los inversores.

#### Ejemplo de Request

```bash
GET /api/inverters/stats
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "total_inverters": 20,
        "total_brands": 6,
        "average_power": 4250.00,
        "average_price": 5800000.00,
        "power_range": {
            "min": 1000.00,
            "max": 10000.00
        },
        "price_range": {
            "min": 2500000.00,
            "max": 12000000.00
        },
        "system_types_distribution": {
            "On-grid": 12,
            "Off-grid": 5,
            "Híbrido": 3
        },
        "grid_types_distribution": {
            "Monofásico 110V": 8,
            "Bifásico 220V": 6,
            "Trifásico 220V": 4,
            "Trifásico 440V": 2
        }
    },
    "message": "Estadísticas obtenidas exitosamente"
}
```

### 7. Obtener Tipos de Sistema Disponibles

**GET** `/api/inverters/system-types`

Obtiene la lista de tipos de sistema disponibles.

#### Ejemplo de Request

```bash
GET /api/inverters/system-types
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": [
        "On-grid",
        "Off-grid",
        "Híbrido"
    ],
    "message": "Tipos de sistema obtenidos exitosamente"
}
```

### 8. Obtener Tipos de Red Disponibles

**GET** `/api/inverters/grid-types`

Obtiene la lista de tipos de red disponibles.

#### Ejemplo de Request

```bash
GET /api/inverters/grid-types
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": [
        "Monofásico 110V",
        "Bifásico 220V",
        "Trifásico 220V",
        "Trifásico 440V"
    ],
    "message": "Tipos de red obtenidos exitosamente"
}
```

## Códigos de Error Comunes

### 400 - Bad Request
- Datos de entrada inválidos
- Validación fallida

### 401 - Unauthorized
- Token de autenticación faltante o inválido

### 404 - Not Found
- Inversor no encontrado

### 422 - Unprocessable Entity
- Error de validación en los datos enviados

### 500 - Internal Server Error
- Error interno del servidor

## Validaciones

### Crear/Actualizar Inversor
- `brand`: Requerido, máximo 100 caracteres
- `model`: Requerido, máximo 100 caracteres
- `power`: Requerido, numérico, mínimo 0.1
- `system_type`: Requerido, debe ser uno de: On-grid, Off-grid, Híbrido
- `grid_type`: Requerido, debe ser uno de: Monofásico 110V, Bifásico 220V, Trifásico 220V, Trifásico 440V
- `technical_sheet_url`: Opcional, URL válida
- `price`: Requerido, numérico, mínimo 0

## Notas Importantes

- Todos los precios están en Pesos Colombianos (COP)
- La potencia se maneja en Watts (W)
- Los tipos de sistema disponibles son: On-grid, Off-grid, Híbrido
- Los tipos de red disponibles son: Monofásico 110V, Bifásico 220V, Trifásico 220V, Trifásico 440V
- Las URLs de fichas técnicas deben ser válidas
- Los inversores eliminados no pueden ser recuperados
- Las estadísticas se calculan en tiempo real
- Los tipos de sistema y red son valores fijos que no pueden ser modificados
