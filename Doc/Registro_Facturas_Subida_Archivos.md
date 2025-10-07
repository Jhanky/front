# 📄 Registro de Facturas y Subida de Archivos - Documentación Completa

## 📋 Índice
1. [Información General](#información-general)
2. [Proceso de Registro](#proceso-de-registro)
3. [Subida de Archivos](#subida-de-archivos)
4. [Endpoints Específicos](#endpoints-específicos)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [Validaciones y Límites](#validaciones-y-límites)
7. [Estructura de Archivos](#estructura-de-archivos)

---

## 📊 Información General

### **Objetivo**
Documentar el proceso completo para registrar facturas y subir documentos de soporte (factura PDF/imagen y soporte de pago).

### **Archivos Soportados**
- **Soporte de Pago**: PDF, JPG, JPEG, PNG
- **Archivo de Factura**: PDF, JPG, JPEG, PNG
- **Tamaño máximo**: 10MB por archivo
- **Almacenamiento**: `storage/app/public/invoices/`

### **Tipos de Documentos**
1. **`payment_support`** - Soporte de pago (comprobante de transferencia, recibo, etc.)
2. **`invoice_file`** - Archivo de la factura (PDF original, imagen escaneada, etc.)

---

## 🎯 Proceso de Registro

### **Paso 1: Crear Factura Básica**
```http
POST /api/invoices
Content-Type: application/json
```

#### **Datos Requeridos:**
```json
{
    "invoice_number": "FAC-001-2024",
    "invoice_date": "2024-10-06",
    "due_date": "2024-10-13",
    "subtotal": 1000.00,
    "retention": 0,
    "has_retention": false,
    "status": "PENDIENTE",
    "sale_type": "CREDITO",
    "payment_method_id": 1,
    "provider_id": 1,
    "cost_center_id": 1,
    "description": "Descripción de la factura"
}
```

#### **Respuesta:**
```json
{
    "success": true,
    "message": "Factura creada exitosamente",
    "data": {
        "invoice_id": 1,
        "invoice_number": "FAC-001-2024",
        "subtotal": 1000.00,
        "iva_amount": 190.00,
        "total_amount": 1190.00,
        "status": "PENDIENTE",
        "sale_type": "CREDITO",
        "payment_support": null,
        "invoice_file": null,
        "provider": {
            "provider_id": 1,
            "name": "Proveedor ABC"
        },
        "cost_center": {
            "cost_center_id": 1,
            "name": "Centro de Costos A"
        },
        "payment_method": {
            "id": 1,
            "code": "TCD",
            "name": "Transferencia desde cuenta Davivienda E4(TCD)"
        }
    }
}
```

### **Paso 2: Subir Archivos (Opcional)**
```http
POST /api/invoices/{id}/upload-files
Content-Type: multipart/form-data
```

#### **Formulario de Datos:**
```
payment_support: [archivo] (opcional)
invoice_file: [archivo] (opcional)
```

#### **Respuesta:**
```json
{
    "success": true,
    "message": "Archivos subidos exitosamente",
    "data": {
        "invoice": {
            "invoice_id": 1,
            "payment_support": "invoices/payment_support/abc123.pdf",
            "invoice_file": "invoices/invoice_files/def456.pdf"
        },
        "uploaded_files": {
            "payment_support": {
                "path": "invoices/payment_support/abc123.pdf",
                "url": "http://localhost/storage/invoices/payment_support/abc123.pdf",
                "size": 245760,
                "original_name": "comprobante_pago.pdf"
            },
            "invoice_file": {
                "path": "invoices/invoice_files/def456.pdf",
                "url": "http://localhost/storage/invoices/invoice_files/def456.pdf",
                "size": 512000,
                "original_name": "factura_original.pdf"
            }
        },
        "file_urls": {
            "payment_support_url": "http://localhost/storage/invoices/payment_support/abc123.pdf",
            "invoice_file_url": "http://localhost/storage/invoices/invoice_files/def456.pdf"
        }
    }
}
```

---

## 📁 Subida de Archivos

### **Método 1: Crear Factura con Archivos (Todo en Uno)**
```http
POST /api/invoices
Content-Type: multipart/form-data
```

#### **Formulario de Datos:**
```
invoice_number: FAC-001-2024
invoice_date: 2024-10-06
due_date: 2024-10-13
subtotal: 1000.00
retention: 0
has_retention: false
status: PENDIENTE
sale_type: CREDITO
payment_method_id: 1
provider_id: 1
cost_center_id: 1
description: Descripción de la factura
payment_support: [archivo] (opcional)
invoice_file: [archivo] (opcional)
```

### **Método 2: Subir Archivos por Separado**
```http
POST /api/invoices/1/upload-files
Content-Type: multipart/form-data
```

#### **Solo Soporte de Pago:**
```
payment_support: [archivo]
```

#### **Solo Archivo de Factura:**
```
invoice_file: [archivo]
```

#### **Ambos Archivos:**
```
payment_support: [archivo]
invoice_file: [archivo]
```

---

## 🔗 Endpoints Específicos

### **1. Crear Factura con Archivos**
```http
POST /api/invoices
Content-Type: multipart/form-data
```

**Campos del Formulario:**
- `invoice_number` (requerido) - Número de factura
- `invoice_date` (requerido) - Fecha de emisión
- `due_date` (opcional) - Fecha de vencimiento
- `subtotal` (requerido) - Subtotal antes de impuestos
- `retention` (opcional) - Monto de retención
- `has_retention` (opcional) - Si aplica retención
- `status` (requerido) - Estado (PENDIENTE/PAGADA)
- `sale_type` (requerido) - Tipo de venta (CONTADO/CREDITO)
- `payment_method_id` (opcional) - ID del método de pago
- `provider_id` (requerido) - ID del proveedor
- `cost_center_id` (requerido) - ID del centro de costos
- `description` (opcional) - Descripción adicional
- `payment_support` (opcional) - Archivo de soporte de pago
- `invoice_file` (opcional) - Archivo de la factura

### **2. Subir Archivos a Factura Existente**
```http
POST /api/invoices/{id}/upload-files
Content-Type: multipart/form-data
```

**Campos del Formulario:**
- `payment_support` (opcional) - Archivo de soporte de pago
- `invoice_file` (opcional) - Archivo de la factura

### **3. Eliminar Archivos de Factura**
```http
DELETE /api/invoices/{id}/remove-files
Content-Type: application/json
```

**Cuerpo de la Solicitud:**
```json
{
    "file_type": "payment_support" // o "invoice_file" o "both"
}
```

### **4. Actualizar Factura con Archivos**
```http
PUT /api/invoices/{id}
PATCH /api/invoices/{id}
Content-Type: multipart/form-data
```

**Campos del Formulario:**
- Todos los campos de la factura
- `payment_support` (opcional) - Nuevo archivo de soporte
- `invoice_file` (opcional) - Nuevo archivo de factura

---

## 💡 Ejemplos Prácticos

### **Ejemplo 1: Factura de Contado con Comprobante**
```bash
curl -X POST http://localhost/api/invoices \
  -H "Authorization: Bearer {token}" \
  -F "invoice_number=FAC-CONTADO-001" \
  -F "invoice_date=2024-10-06" \
  -F "due_date=2024-10-06" \
  -F "subtotal=500.00" \
  -F "status=PAGADA" \
  -F "sale_type=CONTADO" \
  -F "payment_method_id=3" \
  -F "provider_id=1" \
  -F "cost_center_id=1" \
  -F "payment_support=@comprobante_pago.pdf" \
  -F "invoice_file=@factura_original.pdf"
```

### **Ejemplo 2: Factura a Crédito (Sin Archivos Inicialmente)**
```bash
curl -X POST http://localhost/api/invoices \
  -H "Authorization: Bearer {token}" \
  -F "invoice_number=FAC-CREDITO-001" \
  -F "invoice_date=2024-10-06" \
  -F "due_date=2024-10-13" \
  -F "subtotal=1000.00" \
  -F "status=PENDIENTE" \
  -F "sale_type=CREDITO" \
  -F "provider_id=1" \
  -F "cost_center_id=1"
```

### **Ejemplo 3: Subir Archivos Posteriormente**
```bash
curl -X POST http://localhost/api/invoices/1/upload-files \
  -H "Authorization: Bearer {token}" \
  -F "payment_support=@comprobante_transferencia.pdf" \
  -F "invoice_file=@factura_escaneada.jpg"
```

### **Ejemplo 4: Eliminar Solo Soporte de Pago**
```bash
curl -X DELETE http://localhost/api/invoices/1/remove-files \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"file_type": "payment_support"}'
```

### **Ejemplo 5: Actualizar Factura y Cambiar Archivos**
```bash
curl -X PUT http://localhost/api/invoices/1 \
  -H "Authorization: Bearer {token}" \
  -F "invoice_number=FAC-001-2024-UPDATED" \
  -F "subtotal=1200.00" \
  -F "payment_support=@nuevo_comprobante.pdf" \
  -F "invoice_file=@nueva_factura.pdf"
```

---

## ✅ Validaciones y Límites

### **Validaciones de Archivos:**
- **Tipos permitidos**: PDF, JPG, JPEG, PNG
- **Tamaño máximo**: 10MB por archivo
- **Validación de tipo MIME**: Verificación del tipo real del archivo
- **Nombres de archivo**: Se generan automáticamente para evitar conflictos

### **Validaciones de Factura:**
- **Número de factura**: Requerido, único, máximo 100 caracteres
- **Fechas**: `invoice_date` requerida, `due_date` opcional pero debe ser >= `invoice_date`
- **Montos**: `subtotal` requerido y > 0, `retention` opcional y >= 0
- **Relaciones**: `provider_id` y `cost_center_id` deben existir
- **Estados**: `status` debe ser PENDIENTE o PAGADA
- **Tipos de venta**: `sale_type` debe ser CONTADO o CREDITO

### **Límites del Sistema:**
- **Archivos por factura**: Máximo 2 (payment_support + invoice_file)
- **Almacenamiento**: Archivos se guardan en `storage/app/public/invoices/`
- **Organización**: Subcarpetas por tipo (`payment_support/`, `invoice_files/`)
- **Limpieza**: Archivos anteriores se eliminan automáticamente al subir nuevos

---

## 📂 Estructura de Archivos

### **Organización en el Servidor:**
```
storage/app/public/invoices/
├── payment_support/
│   ├── abc123.pdf
│   ├── def456.jpg
│   └── ghi789.png
└── invoice_files/
    ├── jkl012.pdf
    ├── mno345.jpg
    └── pqr678.png
```

### **URLs de Acceso:**
- **Soporte de Pago**: `http://localhost/storage/invoices/payment_support/abc123.pdf`
- **Archivo de Factura**: `http://localhost/storage/invoices/invoice_files/def456.pdf`

### **Nombres de Archivo:**
- **Formato**: `{hash_único}.{extensión}`
- **Ejemplo**: `a1b2c3d4e5f6.pdf`
- **Ventaja**: Evita conflictos de nombres y mejora la seguridad

---

## 🔄 Flujo de Trabajo Recomendado

### **Escenario 1: Factura Completa desde el Inicio**
1. **Crear factura** con todos los datos y archivos
2. **Verificar** que los archivos se subieron correctamente
3. **Obtener URLs** de los archivos para mostrar en la interfaz

### **Escenario 2: Factura Progresiva**
1. **Crear factura** básica sin archivos
2. **Subir archivos** cuando estén disponibles
3. **Actualizar** archivos si es necesario
4. **Eliminar** archivos obsoletos

### **Escenario 3: Gestión de Archivos**
1. **Listar facturas** con información de archivos
2. **Descargar** archivos usando las URLs
3. **Reemplazar** archivos si es necesario
4. **Limpiar** archivos no utilizados

---

## 🚨 Consideraciones Importantes

### **Seguridad:**
- ✅ **Validación de tipos MIME** para prevenir archivos maliciosos
- ✅ **Límites de tamaño** para evitar ataques de denegación de servicio
- ✅ **Nombres únicos** para evitar conflictos y accesos no autorizados
- ✅ **Autenticación requerida** para todas las operaciones

### **Rendimiento:**
- ✅ **Almacenamiento optimizado** con subcarpetas por tipo
- ✅ **Eliminación automática** de archivos anteriores
- ✅ **Límites de tamaño** para mantener el rendimiento
- ✅ **URLs directas** para acceso rápido a archivos

### **Mantenimiento:**
- ✅ **Limpieza automática** de archivos huérfanos
- ✅ **Logs de operaciones** para auditoría
- ✅ **Validaciones robustas** para prevenir errores
- ✅ **Respuestas informativas** para debugging

---

*Documentación de Registro de Facturas y Subida de Archivos v1.0 - 6 de Octubre de 2025*
