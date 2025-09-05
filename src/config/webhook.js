// Configuración del webhook para procesamiento de facturas
export const WEBHOOK_CONFIG = {
  // URL del webhook para procesar archivos de facturas
  INVOICE_PROCESSING_URL: process.env.REACT_APP_INVOICE_WEBHOOK_URL || 'https://api.example.com/process-invoice',
  
  // Configuración de timeout para las peticiones
  TIMEOUT: 30000, // 30 segundos
  
  // Headers adicionales para el webhook
  HEADERS: {
    'Accept': 'application/json',
    'User-Agent': 'React-Facturas-App/1.0'
  },
  
  // Configuración de reintentos
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // 1 segundo
    backoffMultiplier: 2
  },
  
  // Tipos de archivo permitidos
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png'
  ],
  
  // Tamaño máximo de archivo (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // Configuración de validación de respuesta
  EXPECTED_RESPONSE_FORMAT: {
    success: 'boolean',
    data: {
      invoice_number: 'string',
      date: 'string',
      total_amount: 'number',
      payment_method: 'string',
      description: 'string',
      supplier_id: 'string'
    },
    message: 'string'
  }
};

// Función para validar la respuesta del webhook
export const validateWebhookResponse = (response) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Respuesta inválida del webhook');
  }
  
  if (typeof response.success !== 'boolean') {
    throw new Error('Campo "success" requerido en la respuesta del webhook');
  }
  
  if (!response.success) {
    throw new Error(response.message || 'Error en el procesamiento del archivo');
  }
  
  if (!response.data || typeof response.data !== 'object') {
    throw new Error('Campo "data" requerido en la respuesta del webhook');
  }
  
  return true;
};

// Función para construir la URL del webhook con parámetros
export const buildWebhookUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

