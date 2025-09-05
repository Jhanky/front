#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API_URLS = {
  dev: 'http://127.0.0.1:8000',
  prod: 'https://www.api.energy4cero.com/public'
};

const envFile = path.join(__dirname, '..', '.env.local');

function createEnvFile(url) {
  const content = `# Configuración de la API
REACT_APP_API_URL=${url}

# Configuración del entorno
NODE_ENV=development

# Otras configuraciones
REACT_APP_ENVIRONMENT=development
`;

  fs.writeFileSync(envFile, content);

}

function switchApi(environment) {
  const url = API_URLS[environment];
  
  if (!url) {
    console.error('❌ Entorno no válido. Usa: dev o prod');
    process.exit(1);
  }

  try {
    createEnvFile(url);
    
  } catch (error) {
    console.error('❌ Error al cambiar la API:', error.message);
    process.exit(1);
  }
}

// Obtener el argumento de la línea de comandos
const environment = process.argv[2];

if (!environment) {

  process.exit(0);
}

switchApi(environment);
