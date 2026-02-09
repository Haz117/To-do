// utils/logger.js
// Sistema de logging condicional - solo logs en ambiente de desarrollo

const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

const logger = {
  log: (...args) => {
    // Desabilitar logs en producción
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    // Desabilitar warnings en producción
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Solo errores críticos en producción
    if (isDevelopment) {
      console.error(...args);
    }
  },
  debug: (...args) => {
    // Solo en desarrollo
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

export default logger;
