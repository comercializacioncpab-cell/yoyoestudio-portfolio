/**
 * Main application entrypoint
 * Bridges Render's default 'node index.js' to server.js with error logging
 */
console.log('=======================================================');
console.log('🚀 [YOYOESTUDIO] Iniciando desde index.js...');
console.log('📦 Node.js versión:', process.version);
console.log('🌐 Variable PORT asignada por Render:', process.env.PORT || '(no definida, usando 3001)');
console.log('📂 Directorio de trabajo:', process.cwd());
console.log('=======================================================');

process.on('uncaughtException', (err) => {
  console.error('❌ [FATAL] uncaughtException en index.js:', err.stack || err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ [FATAL] unhandledRejection en index.js:', reason);
});

try {
  require('./server.js');
} catch (err) {
  console.error('❌ [FATAL] Error crítico al importar server.js:', err.stack || err);
  process.exit(1);
}

