# Battery Endpoints

Documentación de los endpoints para el servicio de gestión de baterías solares.

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer.

## Endpoints Disponibles

### 1. Listar Baterías

**GET** `/api/batteries`

Obtiene una lista paginada de todas las baterías solares disponibles.

#### Parámetros de Consulta (Opcionales)

- `search` (string): Buscar por marca o modelo
- `type` (string): Filtrar por tipo de batería (GEL, LITIO)
- `capacity_min` (numeric): Capacidad mínima en Ah
- `capacity_max` (numeric): Capacidad máxima en Ah
- `voltage_min` (numeric): Voltaje mínimo en V
- `voltage_max` (numeric): Voltaje máximo en V
- `price_min` (numeric): Precio mínimo en COP
- `price_max` (numeric): Precio máximo en COP
- `sort_by` (string): Campo para ordenar (brand, model, capacity, voltage, price, created_at)
- `sort_order` (string): Orden (asc, desc)
- `per_page` (integer): Elementos por página (default: 15)

#### Ejemplo de Request

```bash
GET /api/batteries?type=LITIO&capacity_min=100&voltage_min=12&sort_by=capacity&sort_order=desc
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "battery_id": 1,
                "brand": "Victron",
                "model": "BlueSolar 200Ah",
                "capacity": 200.00,
                "voltage": 12.00,
                "type": "LITIO",
                "technical_sheet_url": "https://example.com/tech-sheet.pdf",
                "price": 3500000.00,
                "created_at": "2025-09-01T10:00:00.000000Z",
                "updated_at": "2025-09-01T10:00:00.000000Z"
            }
        ],
        "total": 15,
        "per_page": 15,
        "last_page": 1
    },
    "message": "Baterías obtenidas exitosamente"
}
```

### 2. Obtener Batería por ID

**GET** `/api/batteries/{id}`

Obtiene la información detallada de una batería específica.

#### Parámetros de Ruta

- `id` (integer): ID de la batería

#### Ejemplo de Request

```bash
GET /api/batteries/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "battery_id": 1,
        "brand": "Victron",
        "model": "BlueSolar 200Ah",
        "capacity": 200.00,
        "voltage": 12.00,
        "type": "LITIO",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 3500000.00,
        "created_at": "2025-09-01T10:00:00.000000Z",
        "updated_at": "2025-09-01T10:00:00.000000Z"
    },
    "message": "Batería obtenida exitosamente"
}
```

### 3. Crear Nueva Batería

**POST** `/api/batteries`

Crea una nueva batería solar.

#### Parámetros del Body

- `brand` (string, required): Marca de la batería
- `model` (string, required): Modelo de la batería
- `capacity` (numeric, required): Capacidad en Ah
- `voltage` (numeric, required): Voltaje en V
- `type` (string, required): Tipo de batería (GEL, LITIO)
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, required): Precio en COP

#### Ejemplo de Request

```bash
POST /api/batteries
Content-Type: application/json

{
    "brand": "Victron",
    "model": "BlueSolar 300Ah",
    "capacity": 300.00,
    "voltage": 12.00,
    "type": "LITIO",
    "technical_sheet_url": "https://example.com/tech-sheet-300ah.pdf",
    "price": 4800000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "battery_id": 16,
        "brand": "Victron",
        "model": "BlueSolar 300Ah",
        "capacity": 300.00,
        "voltage": 12.00,
        "type": "LITIO",
        "technical_sheet_url": "https://example.com/tech-sheet-300ah.pdf",
        "price": 4800000.00,
        "created_at": "2025-09-01T15:30:00.000000Z",
        "updated_at": "2025-09-01T15:30:00.000000Z"
    },
    "message": "Batería creada exitosamente"
}
```

### 4. Actualizar Batería

**PUT** `/api/batteries/{id}`

Actualiza la información de una batería existente.

#### Parámetros de Ruta

- `id` (integer): ID de la batería

#### Parámetros del Body

- `brand` (string, optional): Marca de la batería
- `model` (string, optional): Modelo de la batería
- `capacity` (numeric, optional): Capacidad en Ah
- `voltage` (numeric, optional): Voltaje en V
- `type` (string, optional): Tipo de batería
- `technical_sheet_url` (string, optional): URL de la ficha técnica
- `price` (numeric, optional): Precio en COP

#### Ejemplo de Request

```bash
PUT /api/batteries/1
Content-Type: application/json

{
    "capacity": 250.00,
    "price": 4000000.00
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "battery_id": 1,
        "brand": "Victron",
        "model": "BlueSolar 200Ah",
        "capacity": 250.00,
        "voltage": 12.00,
        "type": "LITIO",
        "technical_sheet_url": "https://example.com/tech-sheet.pdf",
        "price": 4000000.00,
        "updated_at": "2025-09-01T16:00:00.000000Z"
    },
    "message": "Batería actualizada exitosamente"
}
```

### 5. Eliminar Batería

**DELETE** `/api/batteries/{id}`

Elimina una batería solar.

#### Parámetros de Ruta

- `id` (integer): ID de la batería

#### Ejemplo de Request

```bash
DELETE /api/batteries/1
```

#### Ejemplo de Response

```json
{
    "success": true,
    "message": "Batería eliminada exitosamente"
}
```

### 6. Obtener Estadísticas de Baterías

**GET** `/api/batteries/stats`

Obtiene estadísticas generales de las baterías.

#### Ejemplo de Request

```bash
GET /api/batteries/stats
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "total_batteries": 15,
        "total_brands": 4,
        "average_capacity": 185.50,
        "average_voltage": 12.80,
        "average_price": 3200000.00,
        "capacity_range": {
            "min": 50.00,
            "max": 500.00
        },
        "voltage_range": {
            "min": 6.00,
            "max": 48.00
        },
        "price_range": {
            "min": 800000.00,
            "max": 8000000.00
        },
        "types_distribution": {
            "GEL": 8,
            "LITIO": 7
        }
    },
    "message": "Estadísticas obtenidas exitosamente"
}
```

### 7. Obtener Tipos de Batería Disponibles

**GET** `/api/batteries/types`

Obtiene la lista de tipos de batería disponibles.

#### Ejemplo de Request

```bash
GET /api/batteries/types
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": [
        "GEL",
        "LITIO"
    ],
    "message": "Tipos de batería obtenidos exitosamente"
}
```

### 8. Calcular Capacidad Total del Sistema

**POST** `/api/batteries/calculate-system-capacity`

Calcula la capacidad total del sistema basado en múltiples baterías.

#### Parámetros del Body

- `batteries` (array, required): Array de objetos con battery_id y quantity

#### Ejemplo de Request

```bash
POST /api/batteries/calculate-system-capacity
Content-Type: application/json

{
    "batteries": [
        {"battery_id": 1, "quantity": 2},
        {"battery_id": 3, "quantity": 1}
    ]
}
```

#### Ejemplo de Response

```json
{
    "success": true,
    "data": {
        "total_capacity_ah": 450.00,
        "total_capacity_kwh": 5.40,
        "total_voltage": 12.00,
        "batteries_used": [
            {
                "battery_id": 1,
                "brand": "Victron",
                "model": "BlueSolar 200Ah",
                "capacity": 200.00,
                "voltage": 12.00,
                "type": "LITIO",
                "quantity": 2,
                "subtotal_capacity": 400.00
            },
            {
                "battery_id": 3,
                "brand": "Trojan",
                "model": "T-105",
                "capacity": 50.00,
                "voltage": 12.00,
                "type": "GEL",
                "quantity": 1,
                "subtotal_capacity": 50.00
            }
        ]
    },
    "message": "Capacidad del sistema calculada exitosamente"
}
```

## Códigos de Error Comunes

### 400 - Bad Request
- Datos de entrada inválidos
- Validación fallida

### 401 - Unauthorized
- Token de autenticación faltante o inválido

### 404 - Not Found
- Batería no encontrada

### 422 - Unprocessable Entity
- Error de validación en los datos enviados

### 500 - Internal Server Error
- Error interno del servidor

## Validaciones

### Crear/Actualizar Batería
- `brand`: Requerido, máximo 100 caracteres
- `model`: Requerido, máximo 100 caracteres
- `capacity`: Requerido, numérico, mínimo 0.1
- `voltage`: Requerido, numérico, mínimo 0.1
- `type`: Requerido, debe ser uno de: GEL, LITIO
- `technical_sheet_url`: Opcional, URL válida
- `price`: Requerido, numérico, mínimo 0

### Calcular Capacidad del Sistema
- `batteries`: Requerido, array no vacío
- `battery_id`: Requerido, debe existir en la base de datos
- `quantity`: Requerido, entero positivo

## Notas Importantes

- Todos los precios están en Pesos Colombianos (COP)
- La capacidad se maneja en Amperios-hora (Ah)
- El voltaje se maneja en Voltios (V)
- Los tipos de batería disponibles son: GEL, LITIO
- Las URLs de fichas técnicas deben ser válidas
- Las baterías eliminadas no pueden ser recuperadas
- Las estadísticas se calculan en tiempo real
- Los tipos de batería son valores fijos que no pueden ser modificados
- El cálculo de capacidad del sistema considera la capacidad total en serie/paralelo
- La capacidad en kWh se calcula como: (Ah × V) / 1000
