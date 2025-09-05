# Panel Endpoints

Documentación de los endpoints para el servicio de gestión de paneles solares.

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Paneles

**GET** `/api/panels`

Obtiene una lista paginada de todos los paneles solares disponibles.

#### Parámetros de Consulta (Opcionales)

- `search` (string): Buscar por marca o modelo
- `type` (string): Filtrar por tipo de panel (Monocristalino, Policristalino, etc.)
- `power_min` (numeric): Potencia mínima en W
- `power_max` (numeric): Potencia máxima en W
- `price_min` (numeric): Precio mínimo en COP
- `price_max` (numeric): Precio máximo en COP
- `sort_by` (string): Campo para ordenar (brand, model, power, price, created_at)
- `sort_order` (string): Orden (asc, desc)
- `per_page` (integer): Elementos por página (default: 15)

#### Ejemplo de Request

```bash
GET /api/panels?search=solar&type=Monocristalino&power_min=300&sort_by=power&sort_order=desc
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "panel_id": 1,
                "brand": "SolarTech",
                "model": "ST-400W",
                "power": 400.00,
                "type": "Monocristalino",
                "technical_sheet_url": "https://example.com/tech-sheet.pdf",
                "price": 850000.00,
                "created_at": "2025-09-01T10:00:00.000000Z",
                "updated_at": "2025-09-01T10:00:00.000000Z"
            }
        ],
        "total": 25,
        "per_page": 15,
        "last_page": 2
    },
    "message": "Paneles obtenidos exitosamente"
}
```

### 2. Obtener Panel por ID

**GET** `/api/panels/{id}`

Obtiene la información detallada de un panel específico.

#### Parámetros de Ruta

- `id` (integer): ID del panel

#### Ejemplo de Request

```bash
GET /api/panels/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "panel_id": 1,
        "brand": "SolarTech",
        "model": "ST-400W",
        "power": 400.00,
        "type": "Monocristalino",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 850000.00,
        "created_at": "2025-09-01T10:00:00.000000Z",
        "updated_at": "2025-09-01T10:00:00.000000Z"
    },
    "message": "Panel obtenido exitosamente"
}
```

### 3. Crear Nuevo Panel

**POST** `/api/panels`

Crea un nuevo panel solar.

#### Parámetros del Body

- `brand` (string, required): Marca del panel
- `model` (string, required): Modelo del panel
- `power` (numeric, required): Potencia en W
- `type` (string, required): Tipo de panel
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, required): Precio en COP

#### Ejemplo de Request

```bash
POST /api/panels
Content-Type: application/json

{
    "brand": "SolarTech",
    "model": "ST-500W",
    "power": 500.00,
    "type": "Monocristalino",
    "technical_sheet_url": "https://example.com/tech-sheet-500w.pdf",
    "price": 950000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "panel_id": 26,
        "brand": "SolarTech",
        "model": "ST-500W",
        "power": 500.00,
        "type": "Monocristalino",
        "technical_sheet_url": "https://example.com/tech-sheet-500w.pdf",
        "price": 950000.00,
        "created_at": "2025-09-01T15:30:00.000000Z",
        "updated_at": "2025-09-01T15:30:00.000000Z"
    },
    "message": "Panel creado exitosamente"
}
```

### 4. Actualizar Panel

**PUT** `/api/panels/{id}`

Actualiza la información de un panel existente.

#### Parámetros de Ruta

- `id` (integer): ID del panel

#### Parámetros del Body

- `brand` (string, optional): Marca del panel
- `model` (string, optional): Modelo del panel
- `power` (numeric, optional): Potencia en W
- `type` (string, optional): Tipo de panel
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, optional): Precio en COP

#### Ejemplo de Request

```bash
PUT /api/panels/1
Content-Type: application/json

{
    "power": 450.00,
    "price": 900000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "panel_id": 1,
        "brand": "SolarTech",
        "model": "ST-400W",
        "power": 450.00,
        "type": "Monocristalino",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 900000.00,
        "updated_at": "2025-09-01T16:00:00.000000Z"
    },
    "message": "Panel actualizado exitosamente"
}
```

### 5. Eliminar Panel

**DELETE** `/api/panels/{id}`

Elimina un panel solar.

#### Parámetros de Ruta

- `id` (integer): ID del panel

#### Ejemplo de Request

```bash
DELETE /api/panels/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "message": "Panel eliminado exitosamente"
}
```

### 6. Obtener Estadísticas de Paneles

**GET** `/api/panels/stats`

Obtiene estadísticas generales de los paneles.

#### Ejemplo de Request

```bash
GET /api/panels/stats
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "total_panels": 25,
        "total_brands": 8,
        "average_power": 385.50,
        "average_price": 875000.00,
        "power_range": {
            "min": 250.00,
            "max": 600.00
        },
        "price_range": {
            "min": 650000.00,
            "max": 1200000.00
        },
        "types_distribution": {
            "Monocristalino": 15,
            "Policristalino": 8,
            "Thin Film": 2
        }
    },
    "message": "Estadísticas obtenidas exitosamente"
}
```

## Códigos de Error Comunes

### 400 - Bad Request
- Datos de entrada inválidos
- Validación fallida

### 401 - Unauthorized
- Token de autenticación faltante o inválido

### 404 - Not Found
- Panel no encontrado

### 422 - Unprocessable Entity
- Error de validación en los datos enviados

### 500 - Internal Server Error
- Error interno del servidor

## Validaciones

### Crear/Actualizar Panel
- `brand`: Requerido, máximo 100 caracteres
- `model`: Requerido, máximo 100 caracteres
- `power`: Requerido, numérico, mínimo 0.1
- `type`: Requerido, máximo 50 caracteres
- `technical_sheet_url`: Opcional, URL válida
- `price`: Requerido, numérico, mínimo 0

## Notas Importantes

- Todos los precios están en Pesos Colombianos (COP)
- La potencia se maneja en Watts (W)
- Los tipos de panel comunes incluyen: Monocristalino, Policristalino, Thin Film
- Las URLs de fichas técnicas deben ser válidas
- Los paneles eliminados no pueden ser recuperados
- Las estadísticas se calculan en tiempo real
