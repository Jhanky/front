# 📚 Documentación del Sistema de Facturas

## 🎯 Bienvenido

Esta es la documentación completa del **Sistema de Facturas** que ha sido diseñado para manejar de manera profesional y contablemente correcta todos los tipos de ventas y sus estados de pago.

---

## 📋 Índice de Documentación

### 📖 **Documentación Principal**
- **[Sistema de Facturas - Documentación Completa](./Sistema_Facturas_Documentacion.md)**
  - Introducción al sistema
  - Estructura de la base de datos
  - Tipos de venta y estados
  - Modelo Invoice
  - Scopes y métodos
  - Ejemplos de uso
  - Casos de uso comunes

### 🆕 **Actualizaciones Recientes**
- **[Actualización de Documentación](./Actualizacion_Documentacion_Facturas.md)**
  - Nueva tabla de métodos de pago
  - Relaciones foreign key
  - 9 servicios de API
  - Exportación Excel mejorada
  - Migración de datos
  - Ejemplos actualizados

### 💰 **Guía de Tipos de Venta**
- **[Tipos de Venta y Estados - Guía](./Tipos_Venta_Estados_Guia.md)**
  - Conceptos básicos
  - Tipos de venta (Contado/Crédito)
  - Estados de pago (Pendiente/Pagada)
  - Combinaciones y casos de uso
  - Ejemplos prácticos
  - Preguntas frecuentes

### 🔍 **Guía de Scopes y Métodos**
- **[Scopes y Métodos - Guía](./Scopes_Metodos_Guia.md)**
  - Introducción a scopes
  - Scopes básicos
  - Scopes por tipo de venta
  - Scopes contables
  - Métodos de verificación
  - Métodos de cálculo
  - Ejemplos avanzados
  - Combinación de scopes

### 🗄️ **Estructura de Base de Datos**
- **[Estructura de Base de Datos](./Estructura_Base_Datos.md)**
  - Tabla principal: invoices
  - Relaciones
  - Índices y optimización
  - Migraciones
  - Diagrama de relaciones
  - Consultas de ejemplo

---

## 🚀 Inicio Rápido

### 📝 **Crear una Factura**

#### Venta de Contado
```php
$invoice = Invoice::create([
    'invoice_number' => 'FAC-001-2024',
    'invoice_date' => now(),
    'due_date' => now(),
    'subtotal' => 1000.00,
    'status' => 'PAGADA',
    'sale_type' => 'CONTADO',
    'payment_method' => 'EFECTIVO',
    'provider_id' => 1,
    'cost_center_id' => 1
]);
// El IVA y total se calculan automáticamente
```

#### Venta a Crédito
```php
$invoice = Invoice::create([
    'invoice_number' => 'FAC-002-2024',
    'invoice_date' => now(),
    'due_date' => now()->addDays(30),
    'subtotal' => 2000.00,
    'status' => 'PENDIENTE',
    'sale_type' => 'CREDITO',
    'provider_id' => 1,
    'cost_center_id' => 1
]);
```

### 🔍 **Consultas Comunes**

#### Obtener Facturas Pendientes
```php
$pendientes = Invoice::pending()->get();
```

#### Obtener Créditos Pendientes
```php
$creditosPendientes = Invoice::creditPending()->get();
```

#### Obtener Facturas Vencidas
```php
$vencidas = Invoice::overdue()->get();
```

#### Dashboard de Ventas
```php
$dashboard = [
    'total_contado' => Invoice::cashSales()->sum('total_amount'),
    'total_credito' => Invoice::creditSales()->sum('total_amount'),
    'pendientes' => Invoice::pending()->count(),
    'vencidas' => Invoice::overdue()->count()
];
```

---

## 💡 Conceptos Clave

### 🏷️ **Tipos de Venta**
- **CONTADO**: Se paga inmediatamente
- **CREDITO**: Se paga posteriormente

### 📊 **Estados de Pago**
- **PENDIENTE**: Aún no se ha pagado
- **PAGADA**: Ya se pagó

### 🔄 **Combinaciones Posibles**
| Tipo | Estado | Descripción |
|------|--------|-------------|
| CONTADO | PAGADA | Venta de contado pagada |
| CONTADO | PENDIENTE | Venta de contado pendiente |
| CREDITO | PENDIENTE | Venta a crédito pendiente |
| CREDITO | PAGADA | Venta a crédito pagada |

---

## 🎯 Casos de Uso Principales

### 1. **Gestión de Créditos**
- Seguimiento de facturas a crédito
- Control de vencimientos
- Gestión de cobros

### 2. **Reportes Contables**
- Ventas por tipo
- Análisis de cartera
- Estados financieros

### 3. **Dashboard Ejecutivo**
- Resumen de ventas
- Facturas pendientes
- Análisis de vencimientos

### 4. **Control de Pagos**
- Seguimiento de pagos
- Archivo de soportes
- Confirmación de cobros

---

## 🔧 Características Técnicas

### ✨ **Funcionalidades**
- ✅ Cálculo automático de IVA (19%)
- ✅ Cálculo automático de totales
- ✅ Gestión de retenciones
- ✅ Control de vencimientos
- ✅ Documentos de soporte
- ✅ Filtros avanzados
- ✅ Reportes contables

### 🏗️ **Arquitectura**
- **Modelo**: Invoice con scopes especializados
- **Base de Datos**: Estructura optimizada para consultas
- **Relaciones**: Integración con proveedores y centros de costos
- **Índices**: Optimización para performance

### 📊 **Campos Principales**
- **Identificación**: invoice_id, invoice_number
- **Fechas**: invoice_date, due_date
- **Relaciones**: provider_id, cost_center_id
- **Contables**: subtotal, iva_amount, retention, total_amount
- **Estado**: status, sale_type
- **Pago**: payment_method, payment_support
- **Documentos**: invoice_file, description

---

## 📈 Beneficios del Sistema

### 🎯 **Para Contadores**
- Estructura contable clara
- Cálculos automáticos
- Reportes especializados
- Control de vencimientos

### 🎯 **Para Gerentes**
- Dashboard ejecutivo
- Análisis de ventas
- Control de cartera
- Toma de decisiones

### 🎯 **Para Desarrolladores**
- Código limpio y mantenible
- Scopes reutilizables
- Documentación completa
- Ejemplos prácticos

---

## 🚀 Próximos Pasos

### 📚 **Para Empezar**
1. Lee la [Documentación Principal](./Sistema_Facturas_Documentacion.md)
2. Entiende los [Tipos de Venta](./Tipos_Venta_Estados_Guia.md)
3. Aprende los [Scopes y Métodos](./Scopes_Metodos_Guia.md)
4. Revisa la [Estructura de Base de Datos](./Estructura_Base_Datos.md)

### 🔧 **Para Desarrollar**
1. Usa los scopes predefinidos
2. Combina filtros según necesidades
3. Implementa reportes personalizados
4. Optimiza consultas con índices

### 📊 **Para Reportes**
1. Crea dashboards con scopes
2. Genera reportes por período
3. Analiza tendencias de ventas
4. Controla vencimientos

---

## 📞 Soporte

### ❓ **Preguntas Frecuentes**
- Revisa la sección de [Preguntas Frecuentes](./Tipos_Venta_Estados_Guia.md#preguntas-frecuentes)
- Consulta los [Ejemplos Prácticos](./Sistema_Facturas_Documentacion.md#ejemplos-de-uso)
- Revisa los [Casos de Uso](./Sistema_Facturas_Documentacion.md#casos-de-uso-comunes)

### 🔧 **Solución de Problemas**
- Verifica la estructura de la base de datos
- Revisa los índices y relaciones
- Consulta los logs de la aplicación
- Valida los datos de entrada

---

## 📝 Notas de Versión

### 🆕 **Versión 2.1** (6 de Octubre de 2025)
- ✅ Nueva tabla `payment_methods` normalizada
- ✅ Métodos de pago específicos (TCD, CP, EF)
- ✅ Relaciones foreign key en facturas
- ✅ 10 servicios de API completos
- ✅ Exportación Excel mejorada con URLs
- ✅ Migración de datos preservada
- ✅ Documentación actualizada

### 🆕 **Versión 2.0**
- ✅ Tipos de venta (Contado/Crédito)
- ✅ Estados de pago mejorados
- ✅ Cálculos automáticos
- ✅ Scopes especializados
- ✅ Documentación completa

### 🔄 **Mejoras Futuras**
- 📊 Reportes avanzados
- 📈 Analytics de ventas
- 🔔 Notificaciones automáticas
- 📱 API móvil

---

*Documentación del Sistema de Facturas v2.0 - Generada automáticamente*
