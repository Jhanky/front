import React, { useState } from 'react';
import { getApiUrl, API_CONFIG } from '../config/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testConfiguration = () => {
    setTestResults([]);
    addResult('=== INICIO DE PRUEBAS DE CONFIGURACIÓN ===', 'info');
    
    // Test 1: Verificar variables de entorno
    addResult(`process.env.REACT_APP_API_URL: ${process.env.REACT_APP_API_URL || 'NO DEFINIDA'}`, 
      process.env.REACT_APP_API_URL ? 'success' : 'error');
    
    // Test 2: Verificar API_CONFIG
    addResult(`API_CONFIG.BASE_URL: ${API_CONFIG.BASE_URL || 'NO DEFINIDA'}`, 
      API_CONFIG.BASE_URL ? 'success' : 'error');
    
    // Test 3: Verificar getApiUrl
    const loginUrl = getApiUrl('/api/auth/login');
    addResult(`getApiUrl('/api/auth/login'): ${loginUrl}`, 'info');
    
    // Test 4: Verificar si la URL es válida
    try {
      new URL(loginUrl);
      addResult('✅ URL válida', 'success');
    } catch (error) {
      addResult(`❌ URL inválida: ${error.message}`, 'error');
    }
  };

  const testApiConnection = async () => {
    setLoading(true);
    addResult('=== INICIO DE PRUEBAS DE CONECTIVIDAD ===', 'info');
    
    try {
      const loginUrl = getApiUrl('/api/auth/login');
      addResult(`Intentando conectar a: ${loginUrl}`, 'info');
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'password123'
        })
      });
      
      addResult(`Status: ${response.status} ${response.statusText}`, 
        response.ok ? 'success' : 'error');
      
      const data = await response.json();
      addResult(`Respuesta: ${JSON.stringify(data, null, 2)}`, 'info');
      
      if (response.ok) {
        addResult('✅ Login exitoso - La API funciona correctamente', 'success');
      } else {
        addResult(`❌ Error en login: ${data.message || data.mensaje || 'Error desconocido'}`, 'error');
      }
      
    } catch (error) {
      addResult(`❌ Error de conexión: ${error.message}`, 'error');
      
      // Información adicional sobre el error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        addResult('💡 Posible problema de CORS o servidor no disponible', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 Pruebas de Configuración API</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testConfiguration}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            marginRight: '10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Probar Configuración
        </button>
        
        <button 
          onClick={testApiConnection}
          disabled={loading}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            marginRight: '10px',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Probando...' : 'Probar Conexión API'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Limpiar
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #dee2e6',
        minHeight: '200px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {testResults.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Haz clic en "Probar Configuración" para comenzar...
          </p>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '8px',
                padding: '5px',
                borderRadius: '3px',
                backgroundColor: 
                  result.type === 'success' ? '#d4edda' :
                  result.type === 'error' ? '#f8d7da' :
                  result.type === 'info' ? '#d1ecf1' : '#f8f9fa',
                border: 
                  result.type === 'success' ? '1px solid #c3e6cb' :
                  result.type === 'error' ? '1px solid #f5c6cb' :
                  result.type === 'info' ? '1px solid #bee5eb' : '1px solid #dee2e6'
              }}
            >
              <strong>[{result.timestamp}]</strong> {result.message}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>💡 Información de Depuración:</h4>
        <ul>
          <li><strong>Variable de entorno:</strong> {process.env.REACT_APP_API_URL || 'NO DEFINIDA'}</li>
          <li><strong>API_CONFIG.BASE_URL:</strong> {API_CONFIG.BASE_URL || 'NO DEFINIDA'}</li>
          <li><strong>URL de login completa:</strong> {getApiUrl('/api/auth/login')}</li>
          <li><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
